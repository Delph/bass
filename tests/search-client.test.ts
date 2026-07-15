import { beforeEach, describe, expect, test } from 'vitest';

import type { ArmourPiece, ArmourSlot, GameData } from '~/game/types';
import { ARMOUR_SLOTS } from '~/game/types';
import { query } from '~/query/types';
import {
  SearchClient,
  type SearchWorker,
} from '~/solver/client';
import type { BuildResult } from '~/solver/solver';
import type { WorkerMessage, WorkerResponse } from '~/workers/types';

class FakeWorker implements SearchWorker {
  static workers: FakeWorker[] = [];

  messages: WorkerMessage[] = [];
  onmessage: ((message: MessageEvent<WorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  terminated = false;

  constructor() {
    FakeWorker.workers.push(this);
  }

  postMessage(message: WorkerMessage): void {
    this.messages.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  send(message: WorkerResponse) {
    this.onmessage?.({ data: message } as MessageEvent<WorkerResponse>);
  }

  fail(message = 'boom') {
    this.onerror?.({ message } as ErrorEvent);
  }
}

beforeEach(() => {
  FakeWorker.workers = [];
});

function createClient(maxWorkers = 2, cutoff = 20) {
  let now = 0;

  return new SearchClient({
    createWorker: () => new FakeWorker(),
    maxWorkers: () => maxWorkers,
    cutoff: () => cutoff,
    now: () => ++now,
  });
}

function piece(slot: ArmourSlot, id: number): ArmourPiece {
  return {
    id,
    materials: [],
    skills: [{ skill: 'attack', points: 1 }],
    resistances: {
      fire: 0,
      water: 0,
      thunder: 0,
      ice: 0,
      dragon: 0,
    },
    torso_inc: false,
    slug: `${slot}-${id}`,
    defence: 1,
    gender: 3,
    class: 3,
    rarity: 1,
    hr: 1,
    elder: 1,
    slots: 0,
  };
}

function gameData(heads = 2): GameData {
  return {
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [
        slot,
        Array.from({ length: slot === 'head' ? heads : 1 }, (_, index) =>
          piece(slot, index + 1),
        ),
      ]),
    ) as GameData['armour'],
    decorations: [],
    skills: [],
    translations: {},
  };
}

function build(data = gameData()): BuildResult {
  return {
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [slot, data.armour[slot][0]!]),
    ) as BuildResult['armour'],
    decorations: {
      armour: [],
      torso: [],
      weapon: [],
    },
    torsoInc: 0,
    skills: { attack: 10 },
  };
}

function searchQuery() {
  return query({
    skills: { attack: 10 },
  });
}

describe('SearchClient', () => {
  test('streams results and completes after every worker completes', () => {
    const client = createClient(2);
    const data = gameData(2);

    client.start({ slug: 'mhfu', query: searchQuery(), data });

    expect(FakeWorker.workers).toHaveLength(2);
    expect(client.state.status).toBe('running');
    expect(client.state.combinationCounts).toEqual([1, 1]);

    FakeWorker.workers[0]!.send({ type: 'progress', payload: { attempted: 1 } });
    FakeWorker.workers[0]!.send({ type: 'result', payload: build(data) });
    FakeWorker.workers[0]!.send({ type: 'complete' });

    expect(client.state.status).toBe('running');
    expect(client.state.results).toHaveLength(1);

    FakeWorker.workers[1]!.send({ type: 'progress', payload: { attempted: 1 } });
    FakeWorker.workers[1]!.send({ type: 'complete' });

    expect(client.state.status).toBe('completed');
    expect(client.state.attempts).toEqual([1, 1]);
    expect(FakeWorker.workers.every((worker) => worker.terminated)).toBe(true);
  });

  test('pauses, resumes, and resets workers', () => {
    const client = createClient(1);

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(1) });
    const worker = FakeWorker.workers[0]!;

    client.pause();
    expect(client.state.status).toBe('paused');
    expect(worker.messages.at(-1)).toEqual({ type: 'pause' });

    client.resume();
    expect(client.state.status).toBe('running');
    expect(worker.messages.at(-1)).toEqual({ type: 'resume' });

    client.reset();
    expect(client.state.status).toBe('idle');
    expect(worker.terminated).toBe(true);
    expect(worker.messages.at(-1)).toEqual({ type: 'terminate' });
  });

  test('ignores stale messages after replacing a run', () => {
    const client = createClient(1);

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(1) });
    const oldWorker = FakeWorker.workers[0]!;

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(1) });

    oldWorker.send({ type: 'result', payload: build() });
    oldWorker.send({ type: 'complete' });

    expect(client.state.id).toBe(2);
    expect(client.state.status).toBe('running');
    expect(client.state.results).toHaveLength(0);
  });

  test('completes immediately when prepared gear has no combinations', () => {
    const client = createClient(2);

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(0) });

    expect(FakeWorker.workers).toHaveLength(0);
    expect(client.state.status).toBe('completed');
    expect(client.state.combinationCounts).toEqual([0]);
  });

  test('applies the configured candidate cutoff before starting workers', () => {
    const client = createClient(1, 2);

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(4) });

    expect(client.state.combinationCounts).toEqual([2]);
    const message = FakeWorker.workers[0]!.messages.find(
      (message): message is Extract<WorkerMessage, { type: 'query' }> =>
        message.type === 'query',
    );
    expect(message?.payload.gear.head).toHaveLength(2);
  });

  test('moves to error state on worker errors', () => {
    const client = createClient(1);

    client.start({ slug: 'mhfu', query: searchQuery(), data: gameData(1) });
    FakeWorker.workers[0]!.fail('worker failed');

    expect(client.state.status).toBe('error');
    expect(client.state.error).toBe('worker failed');
    expect(FakeWorker.workers[0]!.terminated).toBe(true);
  });

  test('keeps a snapshot of the submitted query', () => {
    const client = createClient(1);
    const submitted = searchQuery();

    client.start({ slug: 'mhfu', query: submitted, data: gameData(1) });
    submitted.skills.attack = 20;

    const message = FakeWorker.workers[0]!.messages.find(
      (message): message is Extract<WorkerMessage, { type: 'query' }> =>
        message.type === 'query',
    );

    expect(client.state.query?.skills.attack).toBe(10);
    expect(message?.payload.query.skills.attack).toBe(10);
  });
});
