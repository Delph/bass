import type { GameData } from '~/game/types';
import type { QueryState } from '~/query/types';
import { prepare, type PreparedGear } from '~/solver/prepare';
import type { BuildResult } from '~/solver/solver';
import { deepcopy, omit, product, range } from '~/utility';
import type { WorkerMessage, WorkerResponse } from '~/workers/types';

export type SearchStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

export type SearchSession = {
  id: number;
  slug: string | null;
  query: QueryState | null;
  status: SearchStatus;
  attempts: number[];
  combinationCounts: number[];
  completed: boolean[];
  results: BuildResult[];
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
};

export type SearchWorker = {
  onmessage: ((message: MessageEvent<WorkerResponse>) => void) | null;
  onerror?: ((event: ErrorEvent) => void) | null;
  onmessageerror?: ((event: MessageEvent) => void) | null;
  postMessage(message: WorkerMessage): void;
  terminate(): void;
};

export type SearchClientOptions = {
  createWorker: () => SearchWorker;
  maxWorkers: () => number;
  cutoff: () => number;
  now?: () => number;
};

export type SearchStartOptions = {
  slug: string;
  query: QueryState;
  data: GameData;
};

export type SearchListener = (session: SearchSession) => void;

export function createEmptySearchSession(): SearchSession {
  return {
    id: 0,
    slug: null,
    query: null,
    status: 'idle',
    attempts: [],
    combinationCounts: [],
    completed: [],
    results: [],
    error: null,
    startedAt: null,
    finishedAt: null,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function combinations(gear: PreparedGear) {
  return product(Object.values(gear).map((pieces) => pieces.length));
}

function partition(
  gear: PreparedGear,
  worker: number,
  workers: number,
): PreparedGear {
  return {
    ...gear,
    head: gear.head.filter((_, index) => index % workers === worker),
  };
}

export class SearchClient {
  private activeRun = 0;
  private nextRun = 0;
  private listeners = new Set<SearchListener>();
  private pendingEmit: ReturnType<typeof setTimeout> | null = null;
  private session = createEmptySearchSession();
  private workers: SearchWorker[] = [];

  constructor(private options: SearchClientOptions) {}

  get state() {
    return this.snapshot();
  }

  subscribe(listener: SearchListener) {
    this.listeners.add(listener);
    listener(this.snapshot());

    return () => this.listeners.delete(listener);
  }

  start(options: SearchStartOptions) {
    this.activeRun = 0;
    this.cancelPendingEmit();
    this.terminateWorkers();

    const run = ++this.nextRun;
    const startedAt = this.now();
    const query = deepcopy(options.query) as QueryState;

    this.activeRun = run;
    this.session = {
      id: run,
      slug: options.slug,
      query,
      status: 'running',
      attempts: [],
      combinationCounts: [],
      completed: [],
      results: [],
      error: null,
      startedAt,
      finishedAt: null,
    };

    try {
      if (Object.keys(query.skills).length === 0)
        throw new Error('No skills to search for');

      const prepared = prepare(query, options.data, this.options.cutoff());
      const totalCombinations = combinations(prepared);

      if (totalCombinations === 0) {
        this.session.attempts = [0];
        this.session.combinationCounts = [0];
        this.complete(run);
        return this.snapshot();
      }

      const workerCount = this.threads(prepared);
      const workerGear = [...range(0, workerCount)].map((index) =>
        partition(prepared, index, workerCount),
      );

      this.session.attempts = workerGear.map(() => 0);
      this.session.combinationCounts = workerGear.map(combinations);
      this.session.completed = workerGear.map(() => false);
      this.emit();

      const data = deepcopy(omit(options.data, 'armour'));

      for (const [index, gear] of workerGear.entries()) {
        const worker = this.options.createWorker();
        this.workers[index] = worker;
        worker.onmessage = (message) => this.onMessage(run, index, message);
        worker.onerror = (event) => {
          this.fail(run, event.message || 'Search worker failed.');
        };
        worker.onmessageerror = () => {
          this.fail(run, 'Search worker sent an unreadable message.');
        };
        worker.postMessage({
          type: 'data',
          payload: data,
        } satisfies WorkerMessage);
        worker.postMessage({
          type: 'query',
          payload: {
            gear: deepcopy(gear),
            query: deepcopy(query),
          },
        } satisfies WorkerMessage);
      }
    } catch (error) {
      this.fail(run, getErrorMessage(error));
    }

    return this.snapshot();
  }

  pause() {
    if (this.session.status !== 'running') return;

    this.session.status = 'paused';
    for (const worker of this.workers)
      worker.postMessage({ type: 'pause' } satisfies WorkerMessage);
    this.flushEmit();
  }

  resume() {
    if (this.session.status !== 'paused') return;

    this.session.status = 'running';
    for (const worker of this.workers)
      worker.postMessage({ type: 'resume' } satisfies WorkerMessage);
    this.flushEmit();
  }

  togglePause() {
    if (this.session.status === 'paused') this.resume();
    else this.pause();
  }

  reset() {
    this.activeRun = 0;
    this.cancelPendingEmit();
    this.terminateWorkers();
    this.session = createEmptySearchSession();
    this.emit();
  }

  destroy() {
    this.activeRun = 0;
    this.cancelPendingEmit();
    this.terminateWorkers();
    this.listeners.clear();
  }

  private complete(run: number) {
    if (this.activeRun !== run) return;

    this.activeRun = 0;
    this.session.status = 'completed';
    this.session.finishedAt = this.now();
    this.terminateWorkers();
    this.flushEmit();
  }

  private cancelPendingEmit() {
    if (this.pendingEmit === null) return;

    clearTimeout(this.pendingEmit);
    this.pendingEmit = null;
  }

  private emit() {
    const session = this.snapshot();
    for (const listener of this.listeners) listener(session);
  }

  private flushEmit() {
    this.cancelPendingEmit();
    this.emit();
  }

  private fail(run: number, message: string) {
    if (this.activeRun !== run) return;

    this.activeRun = 0;
    this.session.status = 'error';
    this.session.error = message;
    this.session.finishedAt = this.now();
    this.terminateWorkers();
    this.flushEmit();
  }

  private onMessage(
    run: number,
    worker: number,
    message: MessageEvent<WorkerResponse>,
  ) {
    if (this.activeRun !== run) return;

    switch (message.data.type) {
      case 'start':
        this.session.attempts[worker] = 0;
        this.session.combinationCounts[worker] = message.data.payload.combinations;
        this.scheduleEmit();
        return;
      case 'progress':
        this.session.attempts[worker] = message.data.payload.attempted;
        this.scheduleEmit();
        return;
      case 'result':
        this.session.results.push(message.data.payload);
        this.scheduleEmit();
        return;
      case 'results':
        this.session.results.push(...message.data.payload);
        this.scheduleEmit();
        return;
      case 'complete':
        this.session.completed[worker] = true;
        if (!this.completeIfReady(run)) this.scheduleEmit();
        return;
      case 'error':
        this.fail(run, message.data.payload.message);
        return;
    }
  }

  private completeIfReady(run: number) {
    if (this.workers.length === 0) return false;
    if (!this.workers.every((_, index) => this.session.completed[index]))
      return false;

    this.complete(run);
    return true;
  }

  private scheduleEmit() {
    if (this.pendingEmit !== null) return;

    this.pendingEmit = setTimeout(() => {
      this.pendingEmit = null;
      this.emit();
    }, 50);
  }

  private now() {
    return this.options.now?.() ?? Date.now();
  }

  private snapshot(): SearchSession {
    return {
      ...this.session,
      attempts: [...this.session.attempts],
      combinationCounts: [...this.session.combinationCounts],
      completed: [...this.session.completed],
      results: this.session.results,
    };
  }

  private terminateWorkers() {
    for (const worker of this.workers) {
      worker.postMessage({ type: 'terminate' } satisfies WorkerMessage);
      worker.terminate();
    }

    this.workers = [];
  }

  private threads(gear: PreparedGear) {
    return Math.min(Math.max(1, this.options.maxWorkers()), gear.head.length);
  }
}
