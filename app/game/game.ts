import type { Translations } from '~/translation';

export type QuestRank = {
  key: string;
  rank: number;
  group?: string;
};

export const DAMAGE_TYPES = [
  'fire',
  'water',
  'thunder',
  'ice',
  'dragon',
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];
export type MhfDamageType = Exclude<DamageType, 'ice'>;

export const GAME_SLUGS = ['mhf', 'mhfu'] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

export function isGameSlug(value: unknown): value is GameSlug {
  return typeof value === 'string' && GAME_SLUGS.some((slug) => slug === value);
}

export type Game<Element extends DamageType = DamageType> = {
  /// an identifier for the game
  slug: GameSlug;

  /// village quests, if the game has them
  village: QuestRank[];

  /// guild/hub hunter ranks
  guild: QuestRank[];

  /// the elements that exist in the game
  elements: Element[];

  /// random features that a game might have
  features: {
    /// does this game have the decoration feature
    decorations: boolean;
  };
};

export const ARMOUR_SLOTS = ['head', 'body', 'arms', 'waist', 'legs'] as const;
export type ArmourSlot = (typeof ARMOUR_SLOTS)[number];

export type Material = {
  item: string;
  quantity: number;
};

export type SkillPoints = {
  skill: string;
  points: number;
};

export type Resistances<Element extends DamageType = DamageType> = Record<
  Element,
  number
>;

export type ArmourPiece<Element extends DamageType = DamageType> = {
  id: number;
  materials: Material[];
  skills: SkillPoints[];
  resistances: Resistances<Element>;
  torso_inc: boolean;
  torso_add?: number;
  slug: string;
  price?: number;
  defence: number;
  gender: number;
  class: number;
  rarity: number;
  hr: number;
  elder: number;
  slots: number;
  /// if true, this is a dummy piece which needs (normally) hidden items to obtain
  dummy?: boolean;
};

export type Decoration = {
  id: number;
  slug: string;
  price: number;
  slots: number;
  hr: number;
  elder: number;
  skill: SkillPoints;
  penalty?: SkillPoints;
  materials: Material[];
};

export type SkillDefinition = {
  id: number;
  slug: string;
  categories: string[];
  effects: number[];
  combines?: SkillPoints[];
};

export type GameData<Element extends DamageType = DamageType> = {
  armour: Record<ArmourSlot, ArmourPiece<Element>[]>;
  decorations: Decoration[];
  skills: SkillDefinition[];
  translations: Translations;
};

export function current<T>(
  slug: GameSlug,
  data: Record<GameSlug, T>,
  create: () => T,
): T {
  data[slug] ??= create();
  return data[slug];
}
