import { expect, test } from 'vitest';

import {
  ARMOUR_SLOTS,
  type ArmourPiece,
  type ArmourSlot,
  type GameData,
} from '~/game/types';
import { query } from '~/query/types';
import { prepare } from '~/solver/prepare';

function piece(
  id: number,
  overrides: Partial<ArmourPiece> = {},
): ArmourPiece {
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
    slug: `piece-${id}`,
    defence: 1,
    gender: 3,
    class: 3,
    rarity: 1,
    hr: 1,
    elder: 1,
    slots: 0,
    ...overrides,
  };
}

function data(head: ArmourPiece[]): GameData {
  return {
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [
        slot,
        slot === 'head' ? head : [piece(100 + ARMOUR_SLOTS.indexOf(slot))],
      ]),
    ) as Record<ArmourSlot, ArmourPiece[]>,
    decorations: [],
    skills: [],
    translations: {},
  };
}

test('prepare ranks contributors and protected platforms before applying cutoff', () => {
  const gear = prepare(
    query({ skills: { attack: 10 } }),
    data([
      piece(1, { slug: 'direct', skills: [{ skill: 'attack', points: 4 }] }),
      piece(2, {
        slug: 'slotted-direct',
        skills: [{ skill: 'attack', points: 3 }],
        slots: 2,
      }),
      piece(3, { slug: 'neutral-platform', skills: [], slots: 3 }),
      piece(4, { slug: 'weaker-neutral', skills: [], slots: 2 }),
      piece(5, {
        slug: 'unrelated',
        skills: [{ skill: 'expert', points: 5 }],
        slots: 3,
      }),
      piece(6, { slug: 'torso-inc', skills: [], torso_inc: true }),
      piece(7, {
        slug: 'opposing',
        skills: [{ skill: 'attack', points: -3 }],
      }),
    ]),
    3,
  );

  expect(gear.head.map((candidate) => candidate.slug)).toStrictEqual([
    'torso-inc',
    'slotted-direct',
    'neutral-platform',
  ]);
});

test('prepare scores skill points in the requested direction', () => {
  const gear = prepare(
    query({ skills: { attack: -10 } }),
    data([
      piece(1, {
        slug: 'negative',
        skills: [{ skill: 'attack', points: -4 }],
      }),
      piece(2, {
        slug: 'positive',
        skills: [{ skill: 'attack', points: 4 }],
      }),
    ]),
    1,
  );

  expect(gear.head[0]?.slug).toBe('negative');
});

test('prepare uses defence to break equal score ties', () => {
  const gear = prepare(
    query({ skills: { attack: 10 } }),
    data([
      piece(1, { slug: 'lower-defence', defence: 10 }),
      piece(2, { slug: 'higher-defence', defence: 20 }),
    ]),
    2,
  );

  expect(gear.head.map((candidate) => candidate.slug)).toStrictEqual([
    'higher-defence',
    'lower-defence',
  ]);
});

test('prepare includes explicitly marked dummy armour only when allowed', () => {
  const game = data([
    piece(1, { slug: 'regular' }),
    piece(2, { slug: 'hidden', dummy: true }),
  ]);

  expect(
    prepare(query({ skills: { attack: 10 } }), game).head.map(
      (candidate) => candidate.slug,
    ),
  ).toStrictEqual(['regular']);
  expect(
    prepare(
      query({
        options: { allowDummy: true },
        skills: { attack: 10 },
      }),
      game,
    ).head.map((candidate) => candidate.slug),
  ).toStrictEqual(['regular', 'hidden']);
});
