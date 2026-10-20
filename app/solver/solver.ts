import type { QueryState } from '~/query/types';
import type {
  ArmourPiece,
  ArmourSlot,
  DamageType,
  GameData,
  Decoration,
} from '~/game/game';
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

export type BuildResult<Element extends DamageType = DamageType> = {
  armour: Record<ArmourSlot, ArmourPiece<Element>>;
  decorations: {
    armour: Decoration[];
    torso: Decoration[];
    weapon: Decoration[];
  };

  torsoInc: number;
  torsoAdd: number;

  skills: Record<string, number>;
};

function* generate<Element extends DamageType>(
  gear: Record<ArmourSlot, ArmourPiece<Element>[]>,
): Generator<Record<ArmourSlot, ArmourPiece<Element>>> {
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

function evaluate<Element extends DamageType>(
  set: Record<ArmourSlot, ArmourPiece<Element>>,
  decorate: ReturnType<typeof createDecorationOptimizer<Element>>,
): BuildResult<Element> | null {
  const build: BuildResult<Element> = {
    armour: { ...set },
    decorations: {
      armour: [],
      torso: [],
      weapon: [],
    },
    torsoInc: Object.values(set).filter((p) => p.torso_inc).length,
    torsoAdd: Object.values(set).reduce(
      (total, piece) => total + (piece.torso_add ?? 0),
      0,
    ),
    skills: {},
  };

  for (const [slot, piece] of Object.entries(set)) {
    for (const skill of piece.skills) {
      if (build.skills[skill.skill] === undefined)
        build.skills[skill.skill] = 0;
      build.skills[skill.skill]! +=
        skill.points * (slot === 'body' ? build.torsoInc + 1 : 1) +
        (slot === 'body' ? build.torsoAdd : 0);
    }
  }

  const solution = decorate(set, build.skills, build.torsoInc);
  if (!solution) return null;

  build.decorations = solution.decorations;
  build.skills = solution.skills;
  return build;
}

/// for synchronous workloads (e.g., tests and performance benchmarking)
export function* solve<Element extends DamageType>(
  query: QueryState,
  gear: Record<ArmourSlot, ArmourPiece<Element>[]>,
  data: Omit<GameData<Element>, 'armour'>,
): Generator<BuildResult<Element>> {
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

export type SolveBatch<Element extends DamageType = DamageType> = {
  attempted: number;
  results: BuildResult<Element>[];
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
export async function* solveAsync<Element extends DamageType>(
  query: QueryState,
  gear: PreparedGear<Element>,
  data: Omit<GameData<Element>, 'armour'>,
  signal: AbortSignal,
): AsyncGenerator<SolveBatch<Element>> {
  const decorate = createDecorationOptimizer(query, data);
  let next = performance.now() + YIELD_CYCLE;
  let batch: SolveBatch<Element> = {
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
