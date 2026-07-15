import { type GameData } from '~/game/types';
import { solveAsync } from '~/solver/solver';
import { type WorkerMessage, type WorkerResponse } from '~/workers/types';

type WorkerMessageType = WorkerMessage['type'];
type TypedWorkerMessage<T extends WorkerMessageType> = Extract<
  WorkerMessage,
  { type: T }
>;

let game: Omit<GameData, 'armour'> | null = null;
let aborter: AbortController | null = null;
let paused = false;
let resume: (() => void) | null = null;

function post(message: WorkerResponse) {
  postMessage(message);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function data(message: TypedWorkerMessage<'data'>) {
  game = message.payload;
}

function wake() {
  resume?.();
  resume = null;
}

function yieldToMessages() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitWhilePaused(signal: AbortSignal) {
  while (paused && !signal.aborted) {
    await new Promise<void>((resolve) => {
      resume = resolve;
    });
  }
}

async function query(message: TypedWorkerMessage<'query'>) {
  if (!game)
    throw new Error('Worker game data has not been initialised.');

  const { gear, query } = message.payload;
  if (Object.keys(query.skills).length === 0)
    throw new Error('No skills to search for');

  if (aborter)
    throw new Error('A search is already running.');

  aborter = new AbortController();

  try {
    postMessage({type: 'start', payload: {
      combinations: Object.values(gear).map(g => g.length).reduce((a, c) => a * c, 1)
    }})

    let attempted = 0;

    for await (const batch of solveAsync(
      query,
      gear,
      game,
      aborter.signal,
    )) {
      if (aborter.signal.aborted)
        return;

      attempted += batch.attempted;
      postMessage({type: 'progress', payload: {attempted}});

      if (batch.results.length > 0)
        postMessage({type: 'results', payload: batch.results});

      await yieldToMessages();
      await waitWhilePaused(aborter.signal);
    }

    if (!aborter.signal.aborted) post({ type: 'complete' });
  } finally {
    paused = false;
    wake();
    aborter = null;
  }
}

function pause(_message: TypedWorkerMessage<'pause'>) {
  if (aborter)
    paused = true;
}

function resumeSearch(_message: TypedWorkerMessage<'resume'>) {
  paused = false;
  wake();
}

function terminate(_message: TypedWorkerMessage<'terminate'>) {
  aborter?.abort();
  paused = false;
  wake();
  close();
}

function dispatchMessage(message: WorkerMessage) {
  switch (message.type) {
    case 'data':
      data(message);
      return;
    case 'query':
      return query(message);
    case 'pause':
      pause(message);
      return;
    case 'resume':
      resumeSearch(message);
      return;
    case 'terminate':
      terminate(message);
      return;
  }
}

onmessage = async (message: MessageEvent<WorkerMessage>) => {
  try {
    await dispatchMessage(message.data);
  } catch (error) {
    post({
      type: 'error',
      payload: {
        message: getErrorMessage(error),
      },
    });
  }
};
