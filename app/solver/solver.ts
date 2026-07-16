import type { QueryState } from '~/query/types';
import type {
  ArmourPiece,
  ArmourSlot,
  GameData,
  Decoration,
} from '~/game/types';
import type { PreparedGear } from './prepare';
import { createDecorationOptimizer } from './decorate';
import { validateArmourSet } from '~/set';

export { decorationsForSkill, satisfiesRequirement } from './decorate';

export class Metrics {
  start: number;
  end: number | null;

  constructor() {
    this.start = Metrics.now();
    this.end = null;
  }

  get elapsedMs() {
    return (this.end ?? Metrics.now()) - this.start;
  }

  stop() {
    this.end ??= Metrics.now();
  }

  summary() {
    return {
      elapsedMs: this.elapsedMs,
    };
  }

  static now() {
    return globalThis.performance?.now() ?? Date.now();
  }
}

class Context {
  query: QueryState;

  constructor(query: QueryState) {
    this.query = query;
  }
}

export type ArmourSet = {
  armour: Record<ArmourSlot, number>;
  decorations: {
    armour: number[];
    // store decorations for the torso separately, for torso inc
    torso: number[];
    // store the decorations for the weapon separately, because not using those slots saves resources
    weapon: number[];
  };
};

export type BuildResult = {
  armour: Record<ArmourSlot, ArmourPiece>;
  decorations: {
    armour: Decoration[];
    torso: Decoration[];
    weapon: Decoration[];
  };

  torsoInc: number;

  skills: Record<string, number>;
};

function* generate(
  gear: Record<ArmourSlot, ArmourPiece[]>,
): Generator<Record<ArmourSlot, ArmourPiece>> {
  for (const head of gear.head) {
    for (const body of gear.body) {
      for (const arms of gear.arms) {
        for (const waist of gear.waist) {
          for (const legs of gear.legs) {
            yield { head, body, arms, waist, legs };
          }
        }
      }
    }
  }
}

function evaluate(
  set: Record<ArmourSlot, ArmourPiece>,
  decorate: ReturnType<typeof createDecorationOptimizer>,
): BuildResult | null {
  const build: BuildResult = {
    armour: { ...set },
    decorations: {
      armour: [],
      torso: [],
      weapon: [],
    },
    torsoInc: Object.values(set).filter((p) => p.torso_inc).length,
    // torso1: Object.values(set).filter(p => p.torso_1).length;
    // torso2: Object.values(set).filter(p => p.torso_2).length;
    skills: {},
  };

  for (const [slot, piece] of Object.entries(set)) {
    for (const skill of piece.skills) {
      if (build.skills[skill.skill] === undefined)
        build.skills[skill.skill] = 0;
      build.skills[skill.skill]! +=
        skill.points * (slot === 'body' ? build.torsoInc + 1 : 1);
    }
  }

  const solution = decorate(set, build.skills, build.torsoInc);
  if (!solution) return null;

  build.decorations = solution.decorations;
  build.skills = solution.skills;
  return build;
}

/// for synchronous workloads (e.g., tests and performance benchmarking)
export function* solve(
  query: QueryState,
  gear: Record<ArmourSlot, ArmourPiece[]>,
  data: Omit<GameData, 'armour'>,
): Generator<BuildResult> {
  const decorate = createDecorationOptimizer(query, data);

  for (const set of generate(gear)) {
    const build = evaluate(set, decorate);
    if (
      build !== null &&
      validateArmourSet(build.armour, build.decorations, query.weapon.slots)
    )
      yield build;
  }
}

const YIELD_CYCLE = 8;

export type SolveBatch = {
  attempted: number;
  results: BuildResult[];
};

type GlobalScheduler = {
  yield(): Promise<void>;
};

async function surrender(): Promise<void> {
  const scheduler = (
    globalThis as typeof globalThis & { scheduler?: GlobalScheduler }
  ).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/// for asynchronous workloads (e.g., the main application)
export async function* solveAsync(
  query: QueryState,
  gear: PreparedGear,
  data: Omit<GameData, 'armour'>,
  signal: AbortSignal,
): AsyncGenerator<SolveBatch> {
  const decorate = createDecorationOptimizer(query, data);
  let next = performance.now() + YIELD_CYCLE;
  let batch: SolveBatch = {
    attempted: 0,
    results: [],
  };

  for (const set of generate(gear)) {
    if (signal.aborted) return;

    const build = evaluate(set, decorate);
    ++batch.attempted;

    if (
      build !== null &&
      validateArmourSet(build.armour, build.decorations, query.weapon.slots)
    )
      batch.results.push(build);

    if (performance.now() >= next) {
      yield batch;
      batch = {
        attempted: 0,
        results: [],
      };

      await surrender();
      next = performance.now() + YIELD_CYCLE;
      if (signal.aborted) return;
    }
  }

  if (batch.attempted > 0) yield batch;
}
