import {
  ARMOUR_SLOTS,
  type ArmourPiece,
  type ArmourSlot,
  type DamageType,
  type Decoration,
  type GameData,
} from './game/types';
import type { ArmourSet } from './solver/solver';
import { sum } from './utility';
import { WireReader, WireWriter } from './wire';

export type Decorations = {
  armour: Decoration[];
  torso: Decoration[];
  weapon: Decoration[];
};
export const DECORATION_GROUPS = [
  'armour',
  'torso',
  'weapon',
] as const satisfies readonly (keyof Decorations)[];

function validSlots(slots: unknown, minimum: number): slots is number {
  return (
    typeof slots === 'number' &&
    Number.isInteger(slots) &&
    slots >= minimum &&
    slots <= 3
  );
}

function decorationsFit(capacities: number[], decorations: Decoration[]) {
  if (decorations.some((decoration) => !validSlots(decoration?.slots, 1)))
    return false;

  const remaining = capacities.toSorted((a, b) => b - a);
  const required = decorations
    .map((decoration) => decoration.slots)
    .toSorted((a, b) => b - a);

  if (sum(required) > sum(remaining)) return false;

  function place(index: number): boolean {
    if (index === required.length) return true;

    const slots = required[index]!;
    let previous = -1;

    for (let container = 0; container < remaining.length; ++container) {
      const capacity = remaining[container]!;
      if (capacity < slots || capacity === previous) continue;

      remaining[container] = capacity - slots;
      if (place(index + 1)) return true;
      remaining[container] = capacity;
      previous = capacity;
    }

    return false;
  }

  return place(0);
}

export function validateArmourSet(
  armour: Record<ArmourSlot, ArmourPiece>,
  decorations: Decorations,
  weaponSlots = 3,
) {
  if (!validSlots(weaponSlots, 0)) return false;

  const pieces = ARMOUR_SLOTS.map((slot) => armour?.[slot]);
  if (
    pieces.some(
      (piece) =>
        !piece ||
        !validSlots(piece.slots, 0) ||
        !Number.isInteger(piece.gender) ||
        piece.gender < 1 ||
        piece.gender > 3 ||
        !Number.isInteger(piece.class) ||
        piece.class < 1 ||
        piece.class > 3,
    )
  )
    return false;

  const resolved = pieces as ArmourPiece[];
  if (resolved.reduce((gender, piece) => gender & piece.gender, 3) === 0)
    return false;
  if (resolved.reduce((weaponClass, piece) => weaponClass & piece.class, 3) === 0)
    return false;

  if (
    !decorations ||
    DECORATION_GROUPS.some((group) => !Array.isArray(decorations[group]))
  )
    return false;

  return (
    decorationsFit(
      [
        armour.head.slots,
        armour.arms.slots,
        armour.waist.slots,
        armour.legs.slots,
      ],
      decorations.armour,
    ) &&
    decorationsFit([armour.body.slots], decorations.torso) &&
    decorationsFit([weaponSlots], decorations.weapon)
  );
}

/**
 * @param pieces An armour set by ID
 * @param data The game data to search
 * @returns A resolved armour set
 */
export function resolveArmour(
  pieces: Record<ArmourSlot, number>,
  data: Pick<GameData, 'armour'>,
) {
  return Object.fromEntries(
    Object.entries(pieces).map(([slot, id]) => [
      slot,
      data.armour[slot as ArmourSlot].find((p) => p.id === id),
    ]),
  ) as Record<ArmourSlot, ArmourPiece>;
}

/**
 * @param decorations Decorations object by ID
 * @param data The game data to search
 * @returns The solve decorations
 */
export function resolveDecorations(
  decorations: { armour: number[]; torso: number[]; weapon: number[] },
  data: Pick<GameData, 'decorations'>,
) {
  return Object.fromEntries(
    Object.entries(decorations).map(([type, collection]) => [
      type,
      collection.map((id) => data.decorations.find((d) => d.id === id)),
    ]),
  ) as Decorations;
}

/**
 * @param pieces The collection of pieces
 * @returns The total raw defence of the pieces
 */
export function defence(pieces: ArmourPiece[]): number {
  return sum(pieces.map((p) => p.defence));
}

/**
 *
 * @param pieces The collection of pieces
 * @param element The element to calculate the resistance for
 * @returns The total elemental resistance of the pieces for that element
 */
export function resistance(pieces: ArmourPiece[], element: DamageType): number {
  return sum(pieces.map((p) => p.resistances[element]));
}

/**
 *
 * @param pieces The collection of pieces
 * @returns An object of elements and resistances for the collection of pieces
 */
export function resistances(
  pieces: ArmourPiece[],
): Partial<Record<DamageType, number>> {
  const elements = new Set(
    pieces.flatMap((p) => Object.keys(p.resistances) as DamageType[]),
  );

  return Object.fromEntries(
    [...elements].map((e) => [e, resistance(pieces, e)]),
  );
}

/**
 * Calculates the "effective defence" value, which is the one that is actually used in calculations
 * @param raw The raw defence value
 * @param modifier The elemental defence value
 * @returns The effective defence value used in damage calculations
 */
export function effective(raw: number, modifier: number = 0) {
  return Math.floor((1 / ((160 * (1 - modifier / 100)) / (raw + 160))) * raw);
}

export function groupDecorations(decorations: Decoration[]) {
  const grouped = new Map<
    number,
    { decoration: Decoration; quantity: number }
  >();

  for (const decoration of decorations) {
    const group = grouped.get(decoration.id);
    if (group) ++group.quantity;
    else grouped.set(decoration.id, { decoration, quantity: 1 });
  }
  return [...grouped.values()].toSorted((a, b) =>
    a.decoration.slug.localeCompare(b.decoration.slug),
  );
}

/**
 * For a given set of armour and decorations, calculates the total skill points
 * @param pieces The collection of pieces
 * @param decorations The collection of decorations
 * @returns The computed skills
 */
export function setSkills(
  pieces: Record<ArmourSlot, ArmourPiece>,
  decorations: Decorations,
) {
  const torsoInc = Object.values(pieces).filter((p) => p.torso_inc).length;

  const skills: Record<string, number> = {};

  function add(skill: string, points: number, multiplier: number) {
    skills[skill] = (skills[skill] ?? 0) + points * multiplier;
  }

  for (const slot of ARMOUR_SLOTS) {
    const piece = pieces[slot as ArmourSlot];

    // this shouldn't happen, but doing it like this will help for partial sets
    if (piece === undefined) continue;

    for (const skill of piece.skills)
      add(skill.skill, skill.points, slot === 'body' ? torsoInc + 1 : 1);
  }

  for (const type of DECORATION_GROUPS) {
    const collection = decorations[type];
    for (const decoration of collection) {
      add(
        decoration.skill.skill,
        decoration.skill.points,
        type === 'torso' ? torsoInc + 1 : 1,
      );
      if (decoration.penalty)
        add(
          decoration.penalty.skill,
          decoration.penalty.points,
          type === 'torso' ? torsoInc + 1 : 1,
        );
    }
  }

  return Object.fromEntries(
    Object.entries(skills).toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

export type WireSetV1 = {
  /// version
  v: 1;

  /// armour: head, body, arms, waist, legs
  a: [number, number, number, number, number];

  /// decorations: armour, torso, weapon
  d: [number[], number[], number[]];
};

function writeDecorationIDs(writer: WireWriter, decorations: number[]) {
  writer.byte(decorations.length);

  for (const id of decorations.toSorted((a, b) => a - b)) writer.id(id);
}

function readDecorationIDs(reader: WireReader) {
  const count = reader.byte();
  const ids: number[] = [];

  for (let i = 0; i < count; i++) ids.push(reader.id());

  return ids;
}

export function armourSetIDv1(set: ArmourSet) {
  const writer = WireWriter.create();

  writer.byte(1);

  for (const slot of ARMOUR_SLOTS) writer.id(set.armour[slot]);

  writeDecorationIDs(writer, set.decorations.armour);
  writeDecorationIDs(writer, set.decorations.torso);
  writeDecorationIDs(writer, set.decorations.weapon);

  return writer.toEncoded();
}

export function setSharePath(slug: string, set: ArmourSet, name: string = '') {
  const path = `/${encodeURIComponent(slug)}/sets/${armourSetIDv1(set)}`;
  const params = new URLSearchParams();
  const trimmedName = name.trim();

  if (trimmedName) params.set('name', trimmedName);

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export function setShareURL(
  origin: string,
  slug: string,
  set: ArmourSet,
  name: string = '',
) {
  return new URL(setSharePath(slug, set, name), origin).toString();
}

export function wireIDv1(
  pieces: Record<ArmourSlot, ArmourPiece>,
  decorations: Decorations,
) {
  return armourSetIDv1({
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [slot, pieces[slot].id]),
    ) as ArmourSet['armour'],
    decorations: {
      armour: decorations.armour.map((decoration) => decoration.id),
      torso: decorations.torso.map((decoration) => decoration.id),
      weapon: decorations.weapon.map((decoration) => decoration.id),
    },
  });
}

function parseWireIDv1(reader: WireReader) {
  return {
    armour: Object.fromEntries(
      ARMOUR_SLOTS.map((slot) => [slot, reader.id()]),
    ) as Record<ArmourSlot, number>,
    decorations: {
      armour: readDecorationIDs(reader),
      torso: readDecorationIDs(reader),
      weapon: readDecorationIDs(reader),
    },
  };
}

export function parseWireID(id: string): ArmourSet {
  const reader = WireReader.fromEncoded(id);
  const version = reader.byte();

  switch (version) {
    case 1:
      const set = parseWireIDv1(reader);

      if (!reader.done) throw new Error(`Invalid wire ID: ${id}`);

      return set;
    default:
      throw new Error(`Unable to process wire ID version: ${version}`);
  }
}
