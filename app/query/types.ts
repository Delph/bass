import type { DeepPartial } from '~/types';
import { merge } from '~/utility';

export const HUNTER_GENDER = {
  Male: 1,
  Female: 2,
  All: 3,
} as const;

export type HunterGender = keyof typeof HUNTER_GENDER;

export type HunterSpecification = {
  rank: number;
  village: number;
  gender: (typeof HUNTER_GENDER)[HunterGender];
};

export const WEAPON_CLASS = {
  Blademaster: 1,
  Gunner: 2,
} as const;

export type WeaponClass = keyof typeof WEAPON_CLASS;

export type WeaponSpecification = {
  class: (typeof WEAPON_CLASS)[WeaponClass];
  slots: number;
};

export type SkillRequirement = {
  skill: string;
  points: number;
};

export type SkillRequirements = Record<string, number>;

export type QueryState = {
  hunter: HunterSpecification;
  weapon: WeaponSpecification;
  skills: SkillRequirements;
  options: {
    allowBad: boolean;
    allowDummy: boolean;
  };
};

const defaultQuery: QueryState = {
  hunter: {
    rank: 9,
    village: 9,
    gender: HUNTER_GENDER.Male,
  },
  weapon: {
    class: WEAPON_CLASS.Blademaster,
    slots: 0,
  },
  options: {
    allowBad: false,
    allowDummy: false,
  },
  skills: {},
};

export function query(overrides: DeepPartial<QueryState> = {}): QueryState {
  return merge<QueryState>(defaultQuery, overrides);
}
