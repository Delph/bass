import { query, type QueryState } from '../app/query/types';
import type { GameData } from '../app/game/types';
import { prepare, type PreparedGear } from '../app/solver/prepare';
import { Metrics, solve } from '../app/solver/solver';
import { omit } from '../app/utility';
import {
  countCombinations,
  countPieces,
  filterGear,
} from './solver-helpers';

import head from '../public/data/games/mhfu/head.json';
import body from '../public/data/games/mhfu/body.json';
import arms from '../public/data/games/mhfu/arms.json';
import waist from '../public/data/games/mhfu/waist.json';
import legs from '../public/data/games/mhfu/legs.json';
import decorations from '../public/data/games/mhfu/decorations.json';
import skills from '../public/data/games/mhfu/skills.json';
import translations from '../public/data/games/mhfu/translations/en-US.json';

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
    query: query({
      hunter: { rank: 1, village: 1 },
      skills: { 'cold-res': 10 },
    }),
  },
  {
    name: 'g-rank multi-skill hr9 first 10 results',
    filterGear: (gear) => filterGear(gear, (piece) => piece.hr === 9),
    limit: 10,
    query: query({
      weapon: { slots: 3 },
      options: { allowBad: true },
      skills: {
        'short-charg': 10,
        'sword-draw': 10,
        artisan: 10,
        'dragon-res': 15,
      },
    }),
  },
];

function formatMs(value: number) {
  return value.toFixed(2);
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
