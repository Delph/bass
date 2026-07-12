import type { QueryState } from "~/query/types";
import type { ArmourSlot, ArmourPiece, GameData } from "~/game/types";

export type PreparedGear = Record<ArmourSlot, ArmourPiece[]>;

function filter(query: QueryState, data: GameData): PreparedGear {
  const armour: PreparedGear = {
    head: [],
    body: [],
    arms: [],
    waist: [],
    legs: []
  };
  const required = new Set(Object.keys(query.skills));

  for (const [key, collection] of Object.entries(data.armour))
  {
    for (const piece of collection)
    {
      if (piece.hr > query.hunter.rank)
        continue;
      if (piece.elder > query.hunter.village)
        continue;

      if ((piece.gender & query.hunter.gender) === 0)
        continue;
      if ((piece.class & query.weapon.class) === 0)
        continue;

      if (!query.options.allowDummy && piece.slug.includes("dummy"))
        continue;

      // filter out equipment that don't provide at least one skill
      if (required.size > 0 && !piece.torso_inc && !piece.skills.some((skill) => required.has(skill.skill)))
        continue;

      armour[key as ArmourSlot].push(piece);
    }
  }

  return armour;
}

function order(query: QueryState, gear: PreparedGear): PreparedGear {
  void query;

  // now just reverse sort all the pieces, generally, end-game pieces are better than early game ones
  return Object.keys(gear).reduce((a, c) => ({...a, [c]: gear[c as ArmourSlot].toReversed()}), {} as PreparedGear);
}

export function prepare(query: QueryState, data: GameData): PreparedGear {
  // filter out all the stuff we can't use
  const filtered = filter(query, data);

  // order the equipment to optimise for early results
  return order(query, filtered);
}
