import { expect, test } from 'vitest';
import { armourSetIDv1, parseWireID, setSharePath, setSkills } from '~/set';
import type { ArmourPiece } from '~/game/types';
import type { ArmourSet } from '~/solver/solver';

function piece(skill: string): ArmourPiece {
  return {
    torso_inc: false,
    skills: [{ skill, points: 1 }],
  } as ArmourPiece;
}

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

test('setSkills returns skills in skill-name order', () => {
  const skills = setSkills(
    {
      head: piece('Wind Res'),
      body: piece('Attack'),
      arms: piece('Gathering'),
      waist: piece('Defense'),
      legs: piece('Hearing'),
    },
    { armour: [], torso: [], weapon: [] },
  );

  expect(Object.keys(skills)).toStrictEqual([
    'Attack',
    'Defense',
    'Gathering',
    'Hearing',
    'Wind Res',
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
