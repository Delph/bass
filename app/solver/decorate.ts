import type { ArmourPiece, ArmourSlot, Decoration, GameData } from '~/game/types';
import type { QueryState } from '~/query/types';

type Effects = Record<string, number>;

type Loadout = {
  decorations: Decoration[];
  effects: Effects;
  slotsUsed: number;
};

type Placement = 'armour' | 'torso' | 'weapon';

type State = {
  decorations: Record<Placement, Decoration[]>;
  effects: Effects;
  slotsUsed: number;
  weaponSlotsUsed: number;
  harmfulPenalty: number;
};

export type DecorationSolution = Pick<State, 'decorations'> & {
  skills: Record<string, number>;
};

const skillDecorationCache = new WeakMap<
  GameData['decorations'],
  Map<string, Decoration[]>
>();

function decorationCache(data: Omit<GameData, 'armour'>) {
  let cache = skillDecorationCache.get(data.decorations);
  if (cache === undefined) {
    cache = new Map();
    skillDecorationCache.set(data.decorations, cache);
  }

  return cache;
}

export function decorationsForSkill(
  data: Omit<GameData, 'armour'>,
  skill: string,
) {
  const cache = decorationCache(data);

  if (!cache.has(skill))
    cache.set(
      skill,
      data.decorations
        .filter((decoration) => decoration.skill.skill === skill)
        .toSorted(
          (a, b) =>
            b.slots - a.slots || b.skill.points - a.skill.points,
        ),
    );

  return cache.get(skill)!;
}

export function satisfiesRequirement(
  actual: number | undefined,
  required: number,
) {
  const points = actual ?? 0;

  return required < 0 ? points <= required : points >= required;
}

function addEffect(effects: Effects, skill: string, points: number) {
  effects[skill] = (effects[skill] ?? 0) + points;
  if (effects[skill] === 0) delete effects[skill];
}

function addDecorationEffects(
  effects: Effects,
  decoration: Decoration,
  multiplier = 1,
) {
  addEffect(
    effects,
    decoration.skill.skill,
    decoration.skill.points * multiplier,
  );
  if (decoration.penalty)
    addEffect(
      effects,
      decoration.penalty.skill,
      decoration.penalty.points * multiplier,
    );
}

function effectKey(effects: Effects) {
  return Object.entries(effects)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([skill, points]) => `${skill}:${points}`)
    .join(',');
}

function decorationKey(decorations: Decoration[]) {
  return decorations
    .map((decoration) => decoration.id)
    .toSorted((a, b) => a - b)
    .join(',');
}

function compareLoadouts(a: Loadout, b: Loadout) {
  return (
    a.slotsUsed - b.slotsUsed ||
    a.decorations.length - b.decorations.length ||
    decorationKey(a.decorations).localeCompare(decorationKey(b.decorations))
  );
}

function loadouts(capacity: number, decorations: Decoration[]) {
  const unique = new Map<string, Decoration>();
  for (const decoration of decorations) {
    const key = [
      decoration.slots,
      decoration.skill.skill,
      decoration.skill.points,
      decoration.penalty?.skill ?? '',
      decoration.penalty?.points ?? 0,
    ].join(':');
    const existing = unique.get(key);

    if (!existing || decoration.id < existing.id) unique.set(key, decoration);
  }

  const candidates = [...unique.values()].toSorted(
    (a, b) => a.slots - b.slots || a.id - b.id,
  );
  const plans = new Map<string, Loadout>();

  function visit(
    start: number,
    remaining: number,
    selected: Decoration[],
    effects: Effects,
  ) {
    const plan: Loadout = {
      decorations: [...selected],
      effects: { ...effects },
      slotsUsed: capacity - remaining,
    };
    const key = effectKey(plan.effects);
    const existing = plans.get(key);
    if (!existing || compareLoadouts(plan, existing) < 0) plans.set(key, plan);

    for (let index = start; index < candidates.length; ++index) {
      const decoration = candidates[index]!;
      if (decoration.slots > remaining) continue;

      selected.push(decoration);
      addDecorationEffects(effects, decoration);
      visit(index, remaining - decoration.slots, selected, effects);
      addDecorationEffects(effects, decoration, -1);
      selected.pop();
    }
  }

  visit(0, capacity, [], {});
  return [...plans.values()].toSorted(compareLoadouts);
}

function placementKey(state: State) {
  return (['armour', 'torso', 'weapon'] as const)
    .map((placement) => decorationKey(state.decorations[placement]))
    .join('|');
}

function compareStates(a: State, b: State) {
  return (
    a.weaponSlotsUsed - b.weaponSlotsUsed ||
    a.slotsUsed - b.slotsUsed ||
    a.decorations.armour.length +
      a.decorations.torso.length +
      a.decorations.weapon.length -
      (b.decorations.armour.length +
        b.decorations.torso.length +
        b.decorations.weapon.length) ||
    a.harmfulPenalty - b.harmfulPenalty ||
    placementKey(a).localeCompare(placementKey(b))
  );
}

function combine(
  state: State,
  plan: Loadout,
  placement: Placement,
  multiplier: number,
  query: QueryState,
): State {
  const effects = { ...state.effects };
  for (const decoration of plan.decorations)
    addDecorationEffects(effects, decoration, multiplier);

  const penaltyCost =
    state.harmfulPenalty +
    harmfulPenalty(plan.decorations, query) * multiplier;

  return {
    decorations: {
      ...state.decorations,
      [placement]: [
        ...state.decorations[placement],
        ...plan.decorations,
      ],
    },
    effects,
    slotsUsed: state.slotsUsed + plan.slotsUsed,
    weaponSlotsUsed:
      state.weaponSlotsUsed +
      (placement === 'weapon' ? plan.slotsUsed : 0),
    harmfulPenalty: penaltyCost,
  };
}

function harmfulPenalty(decorations: Decoration[], query: QueryState) {
  return decorations.reduce((total, decoration) => {
    if (!decoration.penalty) return total;
    if ((query.skills[decoration.penalty.skill] ?? 0) < 0) return total;

    return total + Math.abs(decoration.penalty.points);
  }, 0);
}

function projectedLoadouts(
  loadouts: Loadout[],
  relevant: string[],
  query: QueryState,
) {
  const projected = new Map<string, Loadout>();

  for (const loadout of loadouts) {
    const key = relevant
      .map((skill) => loadout.effects[skill] ?? 0)
      .join(',');
    const existing = projected.get(key);
    const compare = existing
      ? loadout.slotsUsed - existing.slotsUsed ||
        loadout.decorations.length - existing.decorations.length ||
        harmfulPenalty(loadout.decorations, query) -
          harmfulPenalty(existing.decorations, query) ||
        decorationKey(loadout.decorations).localeCompare(
          decorationKey(existing.decorations),
        )
      : -1;

    if (!existing || compare < 0) projected.set(key, loadout);
  }

  return [...projected.values()].toSorted(compareLoadouts);
}

type Container = {
  placement: Placement;
  multiplier: number;
  plans: Loadout[];
};

type Bounds = Record<string, { min: number; max: number }>;

function remainingBounds(containers: Container[], relevant: string[]) {
  const bounds: Bounds[] = Array.from(
    { length: containers.length + 1 },
    () => ({}),
  );

  for (const skill of relevant)
    bounds[containers.length]![skill] = { min: 0, max: 0 };

  for (let index = containers.length - 1; index >= 0; --index) {
    const container = containers[index]!;
    const next = bounds[index + 1]!;
    const current = bounds[index]!;

    for (const skill of relevant) {
      const values = container.plans.map(
        (plan) => (plan.effects[skill] ?? 0) * container.multiplier,
      );
      current[skill] = {
        min: next[skill]!.min + Math.min(...values),
        max: next[skill]!.max + Math.max(...values),
      };
    }
  }

  return bounds;
}

function normalizedStateKey(
  state: State,
  base: Record<string, number>,
  relevant: string[],
  remaining: Bounds,
  query: QueryState,
) {
  const normalized: number[] = [];

  for (const skill of relevant) {
    const actual = (base[skill] ?? 0) + (state.effects[skill] ?? 0);
    const { min, max } = remaining[skill]!;
    const required = query.skills[skill];

    if (required !== undefined && required < 0) {
      if (actual + min > required) return null;
      normalized.push(Math.max(actual, required - max));
      continue;
    }

    if (required !== undefined) {
      if (actual + max < required) return null;
      normalized.push(Math.min(actual, required - min));
      continue;
    }

    if (actual + max <= -10) return null;
    normalized.push(Math.min(actual, -9 - min));
  }

  return normalized.join(',');
}

function applyEffects(base: Record<string, number>, effects: Effects) {
  const skills = { ...base };
  for (const [skill, points] of Object.entries(effects))
    skills[skill] = (skills[skill] ?? 0) + points;

  return skills;
}

function validSkills(skills: Record<string, number>, query: QueryState) {
  if (
    Object.entries(query.skills).some(
      ([skill, required]) =>
        !satisfiesRequirement(skills[skill], required),
    )
  )
    return false;

  return (
    query.options.allowBad ||
    !Object.entries(skills).some(
      ([skill, points]) =>
        points <= -10 && (query.skills[skill] ?? 0) >= 0,
    )
  );
}

function solutionKey(
  set: Record<ArmourSlot, ArmourPiece>,
  weaponSlots: number,
  torsoInc: number,
  relevant: string[],
  base: Record<string, number>,
) {
  const armour = [set.head.slots, set.arms.slots, set.waist.slots, set.legs.slots]
    .toSorted((a, b) => b - a)
    .join(',');
  const skills = relevant
    .map((skill) => `${skill}:${base[skill] ?? 0}`)
    .join(',');

  return [
    armour,
    set.body.slots,
    weaponSlots,
    torsoInc,
    skills,
  ].join('|');
}

export function createDecorationOptimizer(
  query: QueryState,
  data: Omit<GameData, 'armour'>,
) {
  const requirements = Object.entries(query.skills);
  const candidates = data.decorations.filter((decoration) => {
    if (decoration.hr > query.hunter.rank) return false;
    if (decoration.elder > query.hunter.village) return false;

    return requirements.some(
      ([skill, points]) =>
        (points > 0 && decoration.skill.skill === skill) ||
        (points < 0 && decoration.penalty?.skill === skill),
    );
  });
  const plans = [0, 1, 2, 3].map((capacity) =>
    loadouts(capacity, candidates),
  );
  const projected = new Map<string, Loadout[]>();
  const cache = new Map<string, State | null>();

  function plansFor(capacity: number, relevant: string[]) {
    const key = `${capacity}|${relevant.join(',')}`;
    let result = projected.get(key);

    if (!result) {
      result = projectedLoadouts(plans[capacity]!, relevant, query);
      projected.set(key, result);
    }

    return result;
  }

  return function decorate(
    set: Record<ArmourSlot, ArmourPiece>,
    base: Record<string, number>,
    torsoInc: number,
  ): DecorationSolution | null {
    const relevant = new Set(Object.keys(query.skills));
    if (!query.options.allowBad) {
      for (const decoration of candidates) {
        if (decoration.penalty) relevant.add(decoration.penalty.skill);
      }

      for (const [skill, points] of Object.entries(base)) {
        if (points > -10 || (query.skills[skill] ?? 0) < 0) continue;
        if (!candidates.some((decoration) => decoration.skill.skill === skill))
          return null;

        relevant.add(skill);
      }
    }

    const skills = [...relevant].toSorted();
    const key = solutionKey(
      set,
      query.weapon.slots,
      torsoInc,
      skills,
      base,
    );
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (!cached) return null;

      return {
        decorations: cached.decorations,
        skills: applyEffects(base, cached.effects),
      };
    }

    const containers: Container[] = [
      ...[set.head.slots, set.arms.slots, set.waist.slots, set.legs.slots]
        .toSorted((a, b) => b - a)
        .map((capacity) => ({
          placement: 'armour' as const,
          multiplier: 1,
          plans: plansFor(capacity, skills),
        })),
      {
        placement: 'torso',
        multiplier: torsoInc + 1,
        plans: plansFor(set.body.slots, skills),
      },
      {
        placement: 'weapon',
        multiplier: 1,
        plans: plansFor(query.weapon.slots, skills),
      },
    ];
    const bounds = remainingBounds(containers, skills);
    const empty: State = {
      decorations: { armour: [], torso: [], weapon: [] },
      effects: {},
      slotsUsed: 0,
      weaponSlotsUsed: 0,
      harmfulPenalty: 0,
    };
    const initialKey = normalizedStateKey(
      empty,
      base,
      skills,
      bounds[0]!,
      query,
    );
    let states = new Map<string, State>();
    if (initialKey !== null) states.set(initialKey, empty);

    for (const [index, container] of containers.entries()) {
      const next = new Map<string, State>();

      for (const state of states.values()) {
        for (const plan of container.plans) {
          const combined = combine(
            state,
            plan,
            container.placement,
            container.multiplier,
            query,
          );
          const stateKey = normalizedStateKey(
            combined,
            base,
            skills,
            bounds[index + 1]!,
            query,
          );
          if (stateKey === null) continue;

          const existing = next.get(stateKey);
          if (!existing || compareStates(combined, existing) < 0)
            next.set(stateKey, combined);
        }
      }

      states = next;
      if (states.size === 0) break;
    }

    const result = [...states.values()].toSorted(compareStates).find((state) => {
      const skills = applyEffects(base, state.effects);
      return validSkills(skills, query);
    });
    cache.set(key, result ?? null);
    if (!result) return null;

    return {
      decorations: result.decorations,
      skills: applyEffects(base, result.effects),
    };
  };
}
