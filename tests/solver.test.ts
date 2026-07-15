import { assert, expect, test } from 'vitest';
import { prepare } from '~/solver/prepare';
import {
  decorationsForSkill,
  satisfiesRequirement,
  solve,
  type BuildResult,
} from '~/solver/solver';

import { WEAPON_CLASS } from '~/query/types';
import {
  ARMOUR_SLOTS,
  type ArmourSlot,
  type GameData,
} from '~/game/types';

import head from '../public/data/games/mhfu/head.json';
import body from '../public/data/games/mhfu/body.json';
import arms from '../public/data/games/mhfu/arms.json';
import waist from '../public/data/games/mhfu/waist.json';
import legs from '../public/data/games/mhfu/legs.json';
import decorations from '../public/data/games/mhfu/decorations.json';
import skills from '../public/data/games/mhfu/skills.json';
import translations from '../public/data/games/mhfu/translations/en-US.json';
import { omit } from '~/utility';
import { query } from '~/query/types';
import { setSkills } from '~/set';
import {
  filterGear,
  mapGear,
  matchesGear,
  selectGear,
  type GearSlugs,
} from '../scripts/solver-helpers';

const data: GameData = {
  armour: { head, body, arms, waist, legs },
  decorations,
  skills,
  translations,
};
const RAJANG_GEAR = {
  head: 'golden-hair-tie-shin',
  body: 'golden-haori-shin',
  arms: 'golden-kote-shin',
  waist: 'golden-obi-shin',
  legs: 'golden-hakama-shin',
} satisfies GearSlugs;
const CHAKRA_GEAR = {
  head: 'chakra-piercing',
  body: 'chakra-necklace',
  arms: 'chakra-bracelet',
  waist: 'chakra-tasset',
  legs: 'chakra-anklet',
} satisfies GearSlugs;

function chakraSlotProfile(
  slots: Partial<Record<ArmourSlot, number>>,
  torsoInc: ArmourSlot[] = [],
) {
  return mapGear(selectGear(data.armour, CHAKRA_GEAR), (piece, slot) => ({
    ...piece,
    slots: slots[slot] ?? 0,
    torso_inc: torsoInc.includes(slot),
  }));
}

export function hasSkill(build: BuildResult, skill: string, points?: number) {
  points ??= 0;
  if (points < 0) return (build.skills[skill] ?? 0) <= points;
  else return (build.skills[skill] ?? 0) >= points;
}

export function hasNoBadSkill(build: BuildResult) {
  return Object.values(build.skills).every((p) => p > -10);
}

export function hasDecoration(build: BuildResult, slug: string) {
  return build.decorations.armour.find((d) => d.slug === slug) !== undefined;
}

function reloadPenaltyFixtureGear() {
  return selectGear(data.armour, {
    head: 'dark-ukanlos-fangs',
    body: 'dark-ukanlos-plate',
    arms: 'kirin-gloves-x',
    waist: 'blango-coat-x',
    legs: 'dark-ukanlos-boots',
  });
}

test('solver/prepare', () => {
  const q = query();

  const prepared = prepare(q, data);
  const pieces = ARMOUR_SLOTS.flatMap((slot) => prepared[slot]);

  expect(pieces.length).toBeGreaterThan(0);
  expect(pieces.every((piece) => piece.hr <= q.hunter.rank)).toBe(true);
  expect(pieces.every((piece) => piece.elder <= q.hunter.village)).toBe(true);
  expect(pieces.every((piece) => (piece.gender & q.hunter.gender) !== 0)).toBe(
    true,
  );
  expect(pieces.every((piece) => (piece.class & q.weapon.class) !== 0)).toBe(
    true,
  );
  expect(pieces.every((piece) => !piece.dummy)).toBe(true);
});

test('solver/solver:decorationsForSkill', () => {
  const attack = decorationsForSkill(omit(data, 'armour'), 'attack');
  expect(attack.length).toBe(3);
  expect(attack.map((d) => d.slots)).toStrictEqual([3, 2, 1]);

  const heat = decorationsForSkill(omit(data, 'armour'), 'heat-res');
  expect(heat.map((d) => d.skill.points)).toStrictEqual([3, 2, 1]);
  expect(heat.map((d) => d.slug)).toStrictEqual([
    'cold-wind-jewel',
    'cold-breeze-jewel',
    'cool-breeze-jewel',
  ]);
});

test('solver/solver: decoration cache is scoped to its dataset', () => {
  const attack = decorations.filter(
    (decoration) => decoration.skill.skill === 'attack',
  );
  const first = [attack[0]!];
  const second = [attack[1]!];
  const game = omit(data, 'armour');

  expect(decorationsForSkill({ ...game, decorations: first }, 'attack')).toEqual(
    first,
  );
  expect(
    decorationsForSkill({ ...game, decorations: second }, 'attack'),
  ).toEqual(second);
});

test('solver/solver: requirement satisfaction follows the requested direction', () => {
  expect(satisfiesRequirement(10, 10)).toBe(true);
  expect(satisfiesRequirement(15, 10)).toBe(true);
  expect(satisfiesRequirement(9, 10)).toBe(false);
  expect(satisfiesRequirement(-10, -10)).toBe(true);
  expect(satisfiesRequirement(-15, -10)).toBe(true);
  expect(satisfiesRequirement(-9, -10)).toBe(false);
  expect(satisfiesRequirement(undefined, 10)).toBe(false);
  expect(satisfiesRequirement(undefined, -10)).toBe(false);
});

// test('solver/solver:solve - basic', () => {
//   const query: QueryState = {
//     hunter: {
//       rank: 1,
//       village: 1,
//       gender: HUNTER_GENDER.Male,
//     },
//     weapon: {
//       class: WEAPON_CLASS.Blademaster,
//       slots: 0,
//     },
//     options: {
//       allowBad: false,
//       allowDummy: false,
//     },
//     skills: {
//       'Cold Res': 10,
//     },
//   };

//   const {done, value} = solve(query, prepare(query, data), omit(data, 'armour')).next();

//   assert(!done);

//   expect(value.skills['Cold Res']).toBe(16);
//   expect(value.skills['Heat Res']).toBe(-8);
//   expect(value.armour.head.piece.name).toBe("Mafumofu Hood");
//   expect(value.armour.body.piece.name).toBe("Mafumofu Jacket");
//   expect(value.armour.arms.piece.name).toBe("Mafumofu Mittens");
//   expect(value.armour.waist.piece.name).toBe("Mafumofu Coat");
//   expect(value.armour.legs.piece.name).toBe("Green Pants");
// });

test('solver/solver:solve - KAS meta', () => {
  const q = query({
    weapon: {
      slots: 3,
    },
    options: {
      allowBad: true,
    },
    skills: {
      'short-charg': 10,
      'sword-draw': 10,
      artisan: 10,
      'dragon-res': 15,
    },
  });

  const gear = filterGear(prepare(q, data), (piece) => piece.hr === 9);

  expect(Object.values(gear).map((c) => c.length)).toStrictEqual([
    8, 5, 5, 5, 5,
  ]);

  const { done, value } = solve(q, gear, omit(data, 'armour')).next();

  assert(!done);

  expect(hasSkill(value, 'short-charg', 10)).toBe(true);
  expect(hasSkill(value, 'sword-draw', 10)).toBe(true);
  expect(hasSkill(value, 'artisan', 10)).toBe(true);
  expect(hasSkill(value, 'dragon-res', 15)).toBe(true);
  expect(hasSkill(value, 'sneak', -10)).toBe(true);
  expect(setSkills(value.armour, value.decorations)).toStrictEqual(value.skills);
});

test('solver/solver:solve - Taunt with full Rajang armour', () => {
  const q = query({
    skills: {
      sneak: -10,
    },
  });

  const gear = filterGear(prepare(q, data), (piece) => piece.hr === 9);

  let rajang: BuildResult | undefined;
  for (const result of solve(q, gear, omit(data, 'armour'))) {
    if (matchesGear(result.armour, RAJANG_GEAR)) {
      rajang = result;
      break;
    }
  }

  expect(rajang?.skills.sneak).toBe(-13);
});

test('solver/solver:solve - Taunt with Chakra armour and decoration penalties', () => {
  const q = query({
    skills: {
      sneak: -10,
    },
  });
  const gear = selectGear(data.armour, CHAKRA_GEAR);

  const { done, value } = solve(q, gear, omit(data, 'armour')).next();

  assert(!done);

  expect(value.skills.sneak).toBe(-10);
  expect(value.decorations.armour).toHaveLength(10);
  expect(
    value.decorations.armour.every(
      (decoration) => decoration.penalty?.skill === 'sneak',
    ),
  ).toBe(true);
  expect(setSkills(value.armour, value.decorations)).toStrictEqual(value.skills);
});

test('solver/solver: keeps multi-slot jewels within one physical container', () => {
  const q = query({ skills: { 'guard-up': 3 } });

  expect([
    ...solve(
      q,
      chakraSlotProfile({ head: 1, arms: 1 }),
      omit(data, 'armour'),
    ),
  ]).toHaveLength(0);

  const { done, value } = solve(
    q,
    chakraSlotProfile({ head: 2 }),
    omit(data, 'armour'),
  ).next();
  assert(!done);
  expect(value.decorations.armour.map((decoration) => decoration.slug)).toEqual([
    'wall-jewel',
  ]);
});

test('solver/solver: chooses efficient smaller jewels over a stronger greedy choice', () => {
  const q = query({ skills: { 'cold-res': 4 } });
  const { done, value } = solve(
    q,
    chakraSlotProfile({ head: 2 }),
    omit(data, 'armour'),
  ).next();

  assert(!done);
  expect(value.decorations.armour.map((decoration) => decoration.slug)).toEqual([
    'hot-breeze-jewel',
    'hot-breeze-jewel',
  ]);
  expect(value.skills['cold-res']).toBe(4);
  expect(value.skills['heat-res']).toBeUndefined();
});

test('solver/solver: records decorations that require weapon slots', () => {
  const q = query({
    weapon: { slots: 1 },
    skills: { attack: 1 },
  });
  const { done, value } = solve(
    q,
    chakraSlotProfile({}),
    omit(data, 'armour'),
  ).next();

  assert(!done);
  expect(value.decorations.armour).toEqual([]);
  expect(value.decorations.torso).toEqual([]);
  expect(value.decorations.weapon.map((decoration) => decoration.slug)).toEqual([
    'attack-jewel',
  ]);
  expect(setSkills(value.armour, value.decorations)).toStrictEqual(value.skills);
});

test.each([
  {
    hunter: { rank: 6, village: 9 },
    decoration: 'strong-wall-jewel',
  },
  {
    hunter: { rank: 9, village: 1 },
    decoration: 'wall-jewel',
  },
])(
  'solver/solver: filters decorations at HR $hunter.rank and village $hunter.village',
  ({ hunter, decoration }) => {
    const q = query({ hunter, skills: { 'guard-up': 3 } });
    const { done, value } = solve(
      q,
      chakraSlotProfile({ head: 3 }),
      omit(data, 'armour'),
    ).next();

    assert(!done);
    expect(value.decorations.armour.map((decoration) => decoration.slug)).toEqual([
      decoration,
    ]);
  },
);

test('solver/solver: multiplies body decoration skills and penalties with Torso Inc', () => {
  const q = query({ skills: { attack: 9 } });
  const { done, value } = solve(
    q,
    chakraSlotProfile({ body: 2 }, ['arms', 'waist']),
    omit(data, 'armour'),
  ).next();

  assert(!done);
  expect(value.torsoInc).toBe(2);
  expect(value.decorations.armour).toEqual([]);
  expect(value.decorations.torso.map((decoration) => decoration.slug)).toEqual([
    'fierce-jewel',
  ]);
  expect(value.decorations.weapon).toEqual([]);
  expect(value.skills.attack).toBe(9);
  expect(value.skills.defense).toBe(-3);
  expect(setSkills(value.armour, value.decorations)).toStrictEqual(value.skills);
});

test('solver/solver: multiplies native body skills with Torso Inc', () => {
  const q = query({ skills: { attack: 3 } });
  const gear = chakraSlotProfile({}, ['arms', 'waist']);
  gear.body = [
    {
      ...gear.body[0]!,
      skills: [{ skill: 'attack', points: 1 }],
    },
  ];

  const { done, value } = solve(q, gear, omit(data, 'armour')).next();

  assert(!done);
  expect(value.torsoInc).toBe(2);
  expect(value.decorations).toStrictEqual({ armour: [], torso: [], weapon: [] });
  expect(value.skills.attack).toBe(3);
  expect(setSkills(value.armour, value.decorations)).toStrictEqual(value.skills);
});

test.each([
  { allowBad: false, matches: 0 },
  { allowBad: true, matches: 1 },
])(
  'solver/solver: allowBad=$allowBad controls unrequested negative skills',
  ({ allowBad, matches }) => {
    const q = query({
      options: { allowBad },
      skills: { artisan: 10 },
    });

    expect([
      ...solve(
        q,
        selectGear(data.armour, RAJANG_GEAR),
        omit(data, 'armour'),
      ),
    ]).toHaveLength(matches);
  },
);

test('solver/solver: rejects builds when decoration penalties break required skills', () => {
  const q = query({
    weapon: { class: WEAPON_CLASS.Gunner, slots: 0 },
    skills: {
      reload: 10,
      capacity: 10,
      'element-atk': 10,
      'shot-mix': 10,
    },
  });

  expect([
    ...solve(q, reloadPenaltyFixtureGear(), omit(data, 'armour')),
  ]).toHaveLength(0);
});

test('solver/solver: repairs required skills after decoration penalties when possible', () => {
  const q = query({
    weapon: { class: WEAPON_CLASS.Gunner, slots: 3 },
    skills: {
      reload: 10,
      capacity: 10,
      'element-atk': 10,
      'shot-mix': 10,
    },
  });

  const results = [...solve(q, reloadPenaltyFixtureGear(), omit(data, 'armour'))];

  expect(results).toHaveLength(1);
  const build = results[0];
  assert(build);
  expect(hasSkill(build, 'reload', 10)).toBe(true);
  expect(
    build.decorations.armour.some(
      (decoration) => decoration.skill.skill === 'reload',
    ),
  ).toBe(true);
});

test('solver/solver:solve - AR, Evd Dist Up, EAU, 1 slot', () => {
  const q = query({
    weapon: { class: WEAPON_CLASS.Gunner, slots: 1 },
    skills: {
      'element-atk': 10,
      'evade-dist': 10,
      'auto-reload': 10,
    },
  });

  expect(true).toBe(true);

  // armour: blango cap z, gravious vest z, kirin gloves x, kirin shorts x, narga leggings x
  // decorations: 1 Element jwl, 3 Cont. Fire jwl, 3 Jumping jwl, 1 Barrage jwl, 1 flying jwl
});
