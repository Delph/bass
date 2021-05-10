import heads from './gamedata/mhfu/head.json';
import chests from './gamedata/mhfu/body.json';
import arms from './gamedata/mhfu/arms.json';
import waists from './gamedata/mhfu/waist.json';
import legs from './gamedata/mhfu/legs.json';
import translation from './gamedata/mhfu/translation.json';

import skills from './gamedata/mhfu/skills.json';

import decorations from './gamedata/mhfu/decorations.json';

import { store } from './store';

class GameConfiguration {
  constructor(name, village_ranks, hunter_ranks, damage_types, has_decorations, has_charms)
  {
    this.name = name;
    this.village_ranks = village_ranks;
    this.hunter_ranks = hunter_ranks;
    this.damage_types = damage_types;
    this.has_decorations = has_decorations;
    this.has_charms = has_charms;
  }

  vr_format(vr)
  {
    return this.village_ranks.find(r => r.value === vr)?.label;
  }

  hr_format(hr)
  {
    return this.hunter_ranks.find(r => r.value === hr)?.label;
  }
}


const mhfu = new GameConfiguration('mhfu',
  [
    {value: 9, label: '9★ (Nekoht)'},
    {value: 8, label: '8★ (Nekoht)'},
    {value: 7, label: '7★ (Nekoht)'},
    {value: 6, label: '6★'},
    {value: 5, label: '5★'},
    {value: 4, label: '4★'},
    {value: 3, label: '3★'},
    {value: 2, label: '2★'},
    {value: 1, label: '1★'}
  ],
  [
    {value: 9, label: 'HR9 (GR)'},
    {value: 8, label: 'HR8 (GR)'},
    {value: 7, label: 'HR7 (GR)'},
    {value: 6, label: 'HR6 (HR)'},
    {value: 5, label: 'HR5 (HR)'},
    {value: 4, label: 'HR4 (HR)'},
    {value: 3, label: 'HR3 (LR)'},
    {value: 2, label: 'HR2 (LR)'},
    {value: 1, label: 'HR1 (LR)'}
  ],
  ['fire', 'water', 'thunder', 'ice', 'dragon'],
  true,
  false
);

const games = {
  mhfu
};

function game()
{
  return games[store.getState().game.game];
}

export { game, heads, chests, arms, waists, legs, skills, decorations, translation };
