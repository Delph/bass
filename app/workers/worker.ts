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

function post(message: WorkerResponse) {
  postMessage(message);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function data(message: TypedWorkerMessage<'data'>) {
  game = message.payload;
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

      for (const result of batch.results)
        postMessage({type: 'result', payload: result});
    }
  } finally {
    aborter = null;
  }
}

function stop(_message: TypedWorkerMessage<'stop'>) {
  aborter?.abort();
}

function terminate(_message: TypedWorkerMessage<'terminate'>) {
  aborter?.abort();
  close();
}

function dispatchMessage(message: WorkerMessage) {
  switch (message.type) {
    case 'data':
      data(message);
      return;
    case 'query':
      query(message);
      return;
    case 'stop':
      stop(message);
      return;
    case 'terminate':
      terminate(message);
      return;
  }
}

onmessage = (message: MessageEvent<WorkerMessage>) => {
  try {
    dispatchMessage(message.data);
  } catch (error) {
    post({
      type: 'error',
      payload: {
        message: getErrorMessage(error),
      },
    });
  }
};
