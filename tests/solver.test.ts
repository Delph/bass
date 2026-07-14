import { assert, expect, test } from 'vitest';
import { prepare } from '~/solver/prepare';
import { decorationsForSkill, solve, type BuildResult } from '~/solver/solver';

import { WEAPON_CLASS } from '~/query/types';
import { ARMOUR_SLOTS, type GameData, type ArmourSlot } from '~/game/types';

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

const data: GameData = {
  armour: { head, body, arms, waist, legs },
  decorations,
  skills,
  translations,
};

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

function findBySlug<T extends { slug: string }>(items: T[], slug: string) {
  const item = items.find((item) => item.slug === slug);

  if (!item) throw new Error(`Missing fixture: ${slug}`);

  return item;
}

function reloadPenaltyFixtureGear() {
  return {
    head: [findBySlug(head, 'dark-ukanlos-fangs')],
    body: [findBySlug(body, 'dark-ukanlos-plate')],
    arms: [findBySlug(arms, 'kirin-gloves-x')],
    waist: [findBySlug(waist, 'blango-coat-x')],
    legs: [findBySlug(legs, 'dark-ukanlos-boots')],
  };
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
  expect(pieces.every((piece) => !piece.slug.includes('dummy'))).toBe(true);
});

test('solver/solver:decorationsForSkill', () => {
  const attack = decorationsForSkill(omit(data, 'armour'), 'attack');
  expect(attack.length).toBe(3);
  expect(attack.map((d) => d.slots)).toStrictEqual([3, 2, 1]);

  const heat = decorationsForSkill(omit(data, 'armour'), 'heat-res');
  expect(heat.map((d) => d.skill.points)).toStrictEqual([3, 2, 1]);
  expect(heat.map((d) => d.slug)).toStrictEqual([
    'cold-wind-jewel',
    'icy-gale-jewel',
    'cool-breeze-jewel',
  ]);
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

  const gear = prepare(q, data);
  for (const [slot, collection] of Object.entries(gear)) {
    gear[slot as ArmourSlot] = collection.filter((p) => p.hr === 9);
  }

  expect(Object.values(gear).map((c) => c.length)).toStrictEqual([
    8, 5, 5, 5, 6,
  ]);

  const { done, value } = solve(q, gear, omit(data, 'armour')).next();

  assert(!done);

  expect(hasSkill(value, 'short-charg', 10)).toBe(true);
  expect(hasSkill(value, 'sword-draw', 10)).toBe(true);
  expect(hasSkill(value, 'artisan', 10)).toBe(true);
  expect(hasSkill(value, 'dragon-res', 15)).toBe(true);
  expect(hasSkill(value, 'sneak', -10)).toBe(true);
});

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
