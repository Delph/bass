import { HUNTER_GENDER, WEAPON_CLASS, type QueryState } from '../app/query/types';
import type { ArmourPiece, GameData } from '../app/game/types';
import { prepare, PreparedGear } from '../app/solver/prepare';
import { Metrics, solve } from '../app/solver/solver';
import { omit } from '../app/utility';

import head from '../public/data/games/mhfu/head.json';
import body from '../public/data/games/mhfu/body.json';
import arms from '../public/data/games/mhfu/arms.json';
import waist from '../public/data/games/mhfu/waist.json';
import legs from '../public/data/games/mhfu/legs.json';
import decorations from '../public/data/games/mhfu/decorations.json';
import skills from '../public/data/games/mhfu/skills.json';
import translations from '../public/data/games/mhfu/translation.json';

type ProfileCase = {
  filterGear?: (gear: PreparedGear) => void;
  name: string;
  query: QueryState;
  limit: number;
};

const data: GameData = {
  armour: { head, body, arms, waist, legs },
  decorations,
  skills,
  translations,
};

const cases: ProfileCase[] = [
  {
    name: 'low-rank cold res first result',
    limit: 1,
    query: {
      hunter: { rank: 1, village: 1, gender: HUNTER_GENDER.Male },
      weapon: { class: WEAPON_CLASS.Blademaster, slots: 0 },
      options: { allowBad: false, allowDummy: false },
      skills: { 'Cold Res': 10 },
    },
  },
  {
    name: 'g-rank multi-skill hr9 first 10 results',
    filterGear: (gear) => filterGear(gear, (piece) => piece.hr === 9),
    limit: 10,
    query: {
      hunter: { rank: 9, village: 9, gender: HUNTER_GENDER.Male },
      weapon: { class: WEAPON_CLASS.Blademaster, slots: 3 },
      options: { allowBad: true, allowDummy: false },
      skills: {
        'Fast Chrge': 10,
        'Drawn Crit': 10,
        Artisan: 10,
        'Dragon Res': 15,
      },
    },
  },
];

function formatMs(value: number) {
  return value.toFixed(2);
}

function countGear(gear: PreparedGear) {
  return {
    head: gear.head.length,
    body: gear.body.length,
    arms: gear.arms.length,
    waist: gear.waist.length,
    legs: gear.legs.length,
  };
}

function countPieces(gear: PreparedGear) {
  const counts = countGear(gear);

  return counts.head + counts.body + counts.arms + counts.waist + counts.legs;
}

function countCombinations(gear: PreparedGear) {
  const counts = countGear(gear);

  return counts.head * counts.body * counts.arms * counts.waist * counts.legs;
}

function filterGear(gear: PreparedGear, predicate: (piece: ArmourPiece) => boolean) {
  gear.head = gear.head.filter(predicate);
  gear.body = gear.body.filter(predicate);
  gear.arms = gear.arms.filter(predicate);
  gear.waist = gear.waist.filter(predicate);
  gear.legs = gear.legs.filter(predicate);
}

function runCase(profileCase: ProfileCase) {
  const prepareMetrics = new Metrics();
  const gear = prepare(profileCase.query, data);
  prepareMetrics.stop();

  const preparedPieces = countPieces(gear);
  const preparedCombinations = countCombinations(gear);

  const filterMetrics = new Metrics();
  profileCase.filterGear?.(gear);
  filterMetrics.stop();

  const filteredPieces = countPieces(gear);
  const filteredCombinations = countCombinations(gear);

  const solveMetrics = new Metrics();
  let results = 0;

  for (const result of solve(profileCase.query, gear, omit(data, 'armour'))) {
    void result;
    ++results;

    if (results >= profileCase.limit)
      break;
  }

  solveMetrics.stop();

  return {
    case: profileCase.name,
    limit: profileCase.limit,
    results,
    preparedPieces,
    preparedCombinations,
    filteredPieces,
    filteredCombinations,
    prepareMs: formatMs(prepareMetrics.elapsedMs),
    filterMs: formatMs(filterMetrics.elapsedMs),
    solveMs: formatMs(solveMetrics.elapsedMs),
  };
}

console.table(cases.map(runCase));
