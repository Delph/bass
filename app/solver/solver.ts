import type { QueryState } from "~/query/types";
import type { ArmourPiece, ArmourSlot, GameData, Decoration } from "~/game/types";
import type { PreparedGear } from "./prepare";

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


export type BuildResult = {
  armour: Record<ArmourSlot, {
    piece: ArmourPiece;
    decorations: Decoration[];
  }>;

  torsoInc: number;

  skills: Record<string, number>;
};


function* generate(gear: Record<ArmourSlot, ArmourPiece[]>) : Generator<Record<ArmourSlot, ArmourPiece>> {
  for (const head of gear.head)
  {
    for (const body of gear.body)
    {
      for (const arms of gear.arms)
      {
        for (const waist of gear.waist)
        {
          for (const legs of gear.legs)
          {
            yield { head, body, arms, waist, legs };
          }
        }
      }
    }
  }
}


const skillDecoCache = new Map<string, Decoration[]>();
export function decorationsForSkill(data: Omit<GameData, 'armour'>, skill: string) {
  /* TODO: decoration ranking
    This function assumes that decorations are in a linear order of better to bad, but the Adrenaline decorations don't follow that;
    - Danger Jewel +1, 1 slot, -1
    - Crisis Jewel: +4 3 slots, -2
    - Pinch Jewel: +3 3 slots, -1
    Need to check the data on this one, but there could be scenarios where Pinch Jewel is better because it doesn't gem in a bad skill
  */
  if (!skillDecoCache.has(skill))
    skillDecoCache.set(skill, data.decorations.filter(d => d.skill.skill === skill).toSorted((a, b) => {
      if (b.slots != a.slots)
        return b.slots - a.slots;
      return b.skill.points - a.skill.points;
    }));
  return skillDecoCache.get(skill)!;
}


function decoration(build: BuildResult, data: Omit<GameData, 'armour'>, slots: Record<number, number>, need: {name: string, points: number}): boolean {
  const decorations = decorationsForSkill(data, need.name);

  // we can't gem this
  if (decorations.length === 0)
    return false;

  // store the best decoration we can fit
  let best: Decoration | null = null;
  let slot = 0;
  const MAX_SLOT = 3;
  for (const dec of decorations) {
    // do we have a slot for this
    for (let i = dec.slots; i < MAX_SLOT + 1; ++i) {
      if ((slots[i] ?? 0) === 0)
        continue;

      best = dec;
      slot = i;
      break;
    }

    // if we have found a decoration that fits, and there isn't a smaller one we can use, stop
    if (best !== null && best.skill.points <= need.points)
      break;
  }

  // no dice?
  if (best === null)
    return false;

  // consume the slot
  --slots[slot]!;
  // but, if the decoration slot size is difference, we need to give back the unoccupied ones
  if (best.slots != slot)
    slots[slot - best.slots] = (slots[slot - best.slots] ?? 0) + 1

  // update the skill and the build
  need.points -= best.skill.points;
  build.skills[best.skill.skill] = (build.skills[best.skill.skill] ?? 0) + best.skill.points;
  if (best.penalty !== undefined)
    build.skills[best.penalty.skill] = (build.skills[best.penalty.skill] ?? 0) + best.penalty.points;

  // just push them all onto the head for now
  build.armour.head.decorations.push(best);

  return true;
}


function decorate(build: BuildResult, data: Omit<GameData, 'armour'>, slots: Record<number, number>, need: {name: string, points: number}[]) {
  // sort so we gem the most needed first
  need.sort((a, b) => b.points - a.points);

  while (need.length > 0) {
    const target = need[0]!;
    if (!decoration(build, data, slots, target))
      break;
    if (target.points <= 0)
      need.shift();
    need.sort((a, b) => b.points - a.points);
  }
}


function evaluate(set: Record<ArmourSlot, ArmourPiece>, query: QueryState, data: Omit<GameData, 'armour'>, requirements: [skill: string, points: number][]): BuildResult | null {
    const build: BuildResult = {
      armour: {
        head: {piece: set.head, decorations: []},
        body: {piece: set.body, decorations: []},
        arms: {piece: set.arms, decorations: []},
        waist: {piece: set.waist, decorations: []},
        legs: {piece: set.legs, decorations: []}
      },
      torsoInc: Object.values(set).filter(p => p.torso_inc).length,
      // torso1: Object.values(set).filter(p => p.torso_1).length;
      // torso2: Object.values(set).filter(p => p.torso_2).length;
      skills: {}
    };

    for (const [slot, piece] of Object.entries(set)) {
      for (const skill of piece.skills) {
        if (build.skills[skill.skill] === undefined)
          build.skills[skill.skill] = 0;
        build.skills[skill.skill]! += skill.points * (slot === 'body' ? (build.torsoInc + 1) : 1);
      }
    }

    const need: {name: string, points: number}[] = [];

    for (const [skill, points] of requirements)
    {
      if ((build.skills[skill] ?? 0) < points)
        need.push({name: skill, points: points - (build.skills[skill] ?? 0)});
    }

    // work out what decoration slots we have
    const slots = Object.values(build.armour).reduce((a, c) => ({...a, [c.piece.slots]: (a[c.piece.slots] ?? 0) + 1}), {} as Record<number, number>);
    slots[query.weapon.slots] = (slots[query.weapon.slots] ?? 0) + 1;

    // gemming
    decorate(build, data, slots, need);

    // if we're missing skills, then this set isn't valid
    if (need.some(s => s.points > 0))
      return null;

    // if this set has bad skills and we don't allow bad sets, then this set isn't valid
    if (!query.options.allowBad && Object.values(build.skills).some(s => s <= -10))
      return null;
    return build;
}


/// for synchronous workloads (e.g., tests and performance benchmarking)
export function* solve(query: QueryState, gear: Record<ArmourSlot, ArmourPiece[]>, data: Omit<GameData, 'armour'>): Generator<BuildResult> {
  const requirements = Object.entries(query.skills);

  for (const set of generate(gear)) {
    const build = evaluate(set, query, data, requirements);
    if (build !== null)
      yield build;
  }
}


const YIELD_CYCLE = 8;

export type SolveBatch = {
  attempted: number;
  results: BuildResult[];
};

async function surrender(): Promise<void> {
  if (scheduler?.yield)
    return await scheduler.yield();
  return await new Promise(resolve => setTimeout(resolve, 0));
}

/// for asynchronous workloads (e.g., the main application)
export async function* solveAsync(
  query: QueryState,
  gear: PreparedGear,
  data: Omit<GameData, 'armour'>,
  signal: AbortSignal,
): AsyncGenerator<SolveBatch> {
  const requirements = Object.entries(query.skills);
  let next = performance.now() + YIELD_CYCLE;
  let batch: SolveBatch = {
    attempted: 0,
    results: [],
  };

  for (const set of generate(gear)) {
    if (signal.aborted) return;

    const build = evaluate(set, query, data, requirements);
    ++batch.attempted;

    if (build !== null)
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

  if (batch.attempted > 0)
    yield batch;
}
