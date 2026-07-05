type QuestRank = {
  rank: number;
  label: string;
  group?: string;
};

const DAMAGE_TYPES = ['fire', 'water', 'thunder', 'ice', 'dragon'] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export type Game = {
  /// an identifier for the game
  slug: string;

  /// village quests, if the game has them
  village: QuestRank[];

  /// guild/hub hunter ranks
  guild: QuestRank[];

  /// the elements that exist in the game
  elements: DamageType[];

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

export type Resistances = Record<DamageType, number>;

export type ArmourPiece = {
  id: number;
  materials: Material[];
  skills: SkillPoints[];
  resistances: Resistances;
  torso_inc: boolean;
  name: string;
  price?: number;
  defence: number;
  gender: number;
  class: number;
  rarity: number;
  hr: number;
  elder: number;
  slots: number;
};

export type Decoration = {
  id: number;
  name: string;
  price: number;
  slots: number;
  hr: number;
  elder: number;
  skill: SkillPoints;
  penalty?: SkillPoints;
  materials: Material[];
};

export type EffectDefinition = Record<
  string,
  { name: string; description: string }
>;

export type SkillDefinition = {
  id: number;
  name: string;
  categories: string[];
  effects: Partial<EffectDefinition>;
};

export type GameTranslationEntry = Record<string, string>;
export type GameTranslations = Record<
  string,
  Record<string, GameTranslationEntry>
>;

export type GameData = {
  armour: Record<ArmourSlot, ArmourPiece[]>;
  decorations: Decoration[];
  skills: SkillDefinition[];
  translations: GameTranslations;
};
