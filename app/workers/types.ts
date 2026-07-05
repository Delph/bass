import type { GameData } from '~/game/types';
import type { QueryState } from '~/query/types';
import type { PreparedGear } from '~/solver/prepare';
import type { BuildResult } from '~/solver/solver';

export type WorkerMessage =
  | {
      type: 'data';
      payload: Omit<GameData, 'armour'>;
    }
  | {
      type: 'query';
      payload: {
        gear: PreparedGear;
        query: QueryState;
      }
    }
  | {
      type: 'stop';
    }
  | {
      type: 'pause';
    }
  | {
      type: 'resume';
    }
  | {
      type: 'terminate';
    };

export type WorkerResponse =
  | {
      type: 'error';
      payload: {
        message: string;
      };
    }
  | {
      type: 'start';
      payload: {
        combinations: number;
      };
    }
  | {
      type: 'result';
      payload: BuildResult;
    }
  | {
      type: 'progress';
      payload: {
        attempted: number;
      };
    };
