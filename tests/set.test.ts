import { expect, test } from 'vitest';
import {
  armourSetIDv1,
  effective,
  parseWireID,
  resolveArmour,
  resolveDecorations,
  setSharePath,
  setSkills,
  validateArmourSet,
} from '~/set';
import {
  ARMOUR_SLOTS,
  type ArmourPiece,
  type ArmourSlot,
  type Decoration,
} from '~/game/types';
import type { ArmourSet } from '~/solver/solver';

function piece(skill: string): ArmourPiece {
  return {
    torso_inc: false,
    skills: [{ skill, points: 1 }],
  } as ArmourPiece;
}

function armourPiece(
  id: number,
  overrides: Partial<ArmourPiece> = {},
): ArmourPiece {
  return {
    id,
    materials: [],
    skills: [],
    resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
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

function decoration(id: number, slots: number): Decoration {
  return {
    id,
    slug: `decoration-${id}`,
    price: 1,
    slots,
    hr: 1,
    elder: 1,
    skill: { skill: 'attack', points: 1 },
    materials: [],
  };
}

function armour(
  overrides: Partial<Record<ArmourSlot, Partial<ArmourPiece>>> = {},
) {
  return Object.fromEntries(
    ARMOUR_SLOTS.map((slot, index) => [
      slot,
      armourPiece(index + 1, overrides[slot]),
    ]),
  ) as Record<ArmourSlot, ArmourPiece>;
}

test.each([
  [160, 0, 320],
  [160, 15, 376],
  [160, -20, 266],
])(
  'effective(%i, %i) returns %i',
  (defence, resistance, expected) => {
    expect(effective(defence, resistance)).toBe(expected);
  },
);

test('armourSetIDv1 canonicalizes decoration order', () => {
  const first: ArmourSet = {
    armour: {
      head: 1,
      body: 2,
      arms: 3,
      waist: 4,
      legs: 5,
    },
    decorations: {
      armour: [12, 6, 12],
      torso: [9, 1],
      weapon: [],
    },
  };
  const second: ArmourSet = {
    armour: {
      head: 1,
      body: 2,
      arms: 3,
      waist: 4,
      legs: 5,
    },
    decorations: {
      armour: [12, 12, 6],
      torso: [1, 9],
      weapon: [],
    },
  };
  const canonical: ArmourSet = {
    armour: second.armour,
    decorations: {
      armour: [6, 12, 12],
      torso: [1, 9],
      weapon: [],
    },
  };

  expect(armourSetIDv1(first)).toBe(armourSetIDv1(second));
  expect(parseWireID(armourSetIDv1(first))).toStrictEqual(canonical);
});

test('resolveArmour rejects unknown IDs', () => {
  const pieces = armour();
  const ids = Object.fromEntries(
    ARMOUR_SLOTS.map((slot) => [slot, pieces[slot].id]),
  ) as Record<ArmourSlot, number>;
  const data = {
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [slot, [pieces[slot]]]),
    ) as Record<ArmourSlot, ArmourPiece[]>,
  };

  ids.head = 999;

  expect(() => resolveArmour(ids, data)).toThrow(
    'Unknown armour ID 999 for head',
  );
});

test('resolveDecorations rejects unknown IDs', () => {
  expect(() =>
    resolveDecorations(
      { armour: [999], torso: [], weapon: [] },
      { decorations: [decoration(1, 1)] },
    ),
  ).toThrow('Unknown decoration ID 999 for armour');
});

test('setSkills returns skills in skill-slug order', () => {
  const skills = setSkills(
    {
      head: piece('wind-res'),
      body: piece('attack'),
      arms: piece('gathering'),
      waist: piece('defense'),
      legs: piece('hearing'),
    },
    { armour: [], torso: [], weapon: [] },
  );

  expect(Object.keys(skills)).toStrictEqual([
    'attack',
    'defense',
    'gathering',
    'hearing',
    'wind-res',
  ]);
});

test('setSharePath includes canonical set ID and optional name', () => {
  const set: ArmourSet = {
    armour: {
      head: 1,
      body: 2,
      arms: 3,
      waist: 4,
      legs: 5,
    },
    decorations: {
      armour: [12, 6, 12],
      torso: [9, 1],
      weapon: [],
    },
  };

  expect(setSharePath('mhfu', set, ' KAS meta ')).toBe(
    `/mhfu/sets/${armourSetIDv1(set)}?name=KAS+meta`,
  );
});

test('validateArmourSet enforces physical decoration containers', () => {
  const oneSlot = decoration(1, 1);
  const twoSlot = decoration(2, 2);
  const threeSlot = decoration(3, 3);
  const pieces = armour({
    head: { slots: 2 },
    body: { slots: 1 },
    arms: { slots: 1 },
  });

  expect(
    validateArmourSet(
      pieces,
      { armour: [twoSlot, oneSlot], torso: [oneSlot], weapon: [threeSlot] },
      3,
    ),
  ).toBe(true);
  expect(
    validateArmourSet(armour({ head: { slots: 1 }, arms: { slots: 1 } }), {
      armour: [twoSlot],
      torso: [],
      weapon: [],
    }),
  ).toBe(false);
  expect(
    validateArmourSet(pieces, { armour: [], torso: [twoSlot], weapon: [] }),
  ).toBe(false);
  expect(
    validateArmourSet(
      pieces,
      { armour: [], torso: [], weapon: [threeSlot] },
      2,
    ),
  ).toBe(false);
});

test('validateArmourSet rejects incompatible armour', () => {
  const decorations = { armour: [], torso: [], weapon: [] };

  expect(
    validateArmourSet(
      armour({ head: { gender: 1 }, body: { gender: 2 } }),
      decorations,
    ),
  ).toBe(false);
  expect(
    validateArmourSet(
      armour({ head: { class: 1 }, body: { class: 2 } }),
      decorations,
    ),
  ).toBe(false);
});
