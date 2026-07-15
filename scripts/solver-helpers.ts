import {
  ARMOUR_SLOTS,
  type ArmourPiece,
  type ArmourSlot,
  type GameData,
} from '../app/game/types';
import type { PreparedGear } from '../app/solver/prepare';

export type GearSlugs = Record<ArmourSlot, string>;

export function filterGear(
  gear: PreparedGear,
  predicate: (piece: ArmourPiece) => boolean,
) {
  for (const slot of ARMOUR_SLOTS)
    gear[slot] = gear[slot].filter(predicate);

  return gear;
}

export function selectGear(
  armour: GameData['armour'],
  slugs: GearSlugs,
): PreparedGear {
  return Object.fromEntries(
    ARMOUR_SLOTS.map((slot) => {
      const piece = armour[slot].find((piece) => piece.slug === slugs[slot]);
      if (!piece) throw new Error(`Missing ${slot} fixture: ${slugs[slot]}`);

      return [slot, [piece]];
    }),
  ) as PreparedGear;
}

export function matchesGear(
  gear: Record<ArmourSlot, ArmourPiece>,
  slugs: GearSlugs,
) {
  return ARMOUR_SLOTS.every((slot) => gear[slot].slug === slugs[slot]);
}

export function mapGear(
  gear: PreparedGear,
  transform: (piece: ArmourPiece, slot: ArmourSlot) => ArmourPiece,
): PreparedGear {
  return Object.fromEntries(
    ARMOUR_SLOTS.map((slot) => [
      slot,
      gear[slot].map((piece) => transform(piece, slot)),
    ]),
  ) as PreparedGear;
}

export function countGear(gear: PreparedGear) {
  return Object.fromEntries(
    ARMOUR_SLOTS.map((slot) => [slot, gear[slot].length]),
  ) as Record<ArmourSlot, number>;
}

export function countPieces(gear: PreparedGear) {
  return Object.values(countGear(gear)).reduce(
    (total, count) => total + count,
    0,
  );
}

export function countCombinations(gear: PreparedGear) {
  return Object.values(countGear(gear)).reduce(
    (total, count) => total * count,
    1,
  );
}
