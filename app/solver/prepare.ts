import type { QueryState } from '~/query/types';
import type { ArmourSlot, ArmourPiece, GameData } from '~/game/types';

export type PreparedGear = Record<ArmourSlot, ArmourPiece[]>;

const SLOT_SCORE = 2;
const TORSO_INC_SCORE = 10;

function eligible(query: QueryState, piece: ArmourPiece) {
  return (
    piece.hr <= query.hunter.rank &&
    piece.elder <= query.hunter.village &&
    (piece.gender & query.hunter.gender) !== 0 &&
    (piece.class & query.weapon.class) !== 0 &&
    (query.options.allowDummy || !piece.dummy)
  );
}

function filter(query: QueryState, data: GameData): PreparedGear {
  const armour: PreparedGear = {
    head: [],
    body: [],
    arms: [],
    waist: [],
    legs: [],
  };
  const required = new Set(Object.keys(query.skills));

  for (const [key, collection] of Object.entries(data.armour)) {
    const available = collection.filter((piece) => eligible(query, piece));
    const neutralSlots = available
      .filter((piece) => piece.skills.length === 0)
      .reduce((maximum, piece) => Math.max(maximum, piece.slots), 0);

    for (const piece of available) {
      const contributes = piece.skills.some((skill) =>
        required.has(skill.skill),
      );
      const neutralPlatform =
        piece.skills.length === 0 &&
        piece.slots > 0 &&
        piece.slots === neutralSlots;

      if (
        required.size > 0 &&
        !contributes &&
        !piece.torso_inc &&
        !neutralPlatform
      )
        continue;

      armour[key as ArmourSlot].push(piece);
    }
  }

  return armour;
}

function score(query: QueryState, piece: ArmourPiece) {
  const skillScore = piece.skills.reduce((total, skill) => {
    const target = query.skills[skill.skill];
    if (target === undefined) return total;

    return total + Math.sign(target) * skill.points;
  }, 0);

  return (
    skillScore +
    piece.slots * SLOT_SCORE +
    (piece.torso_inc ? TORSO_INC_SCORE : 0)
  );
}

function order(
  query: QueryState,
  gear: PreparedGear,
  cutoff: number,
): PreparedGear {
  const limit = Number.isFinite(cutoff)
    ? Math.max(1, Math.floor(cutoff))
    : Number.POSITIVE_INFINITY;

  return Object.fromEntries(
    Object.entries(gear).map(([slot, pieces]) => [
      slot,
      pieces
        .toSorted(
          (a, b) => score(query, b) - score(query, a) || b.defence - a.defence,
        )
        .slice(0, limit),
    ]),
  ) as PreparedGear;
}

export function prepare(
  query: QueryState,
  data: GameData,
  cutoff = Number.POSITIVE_INFINITY,
): PreparedGear {
  // filter out all the stuff we can't use
  const filtered = filter(query, data);

  // order the equipment to optimise for early results
  return order(query, filtered, cutoff);
}
