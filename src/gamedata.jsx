import mhfu_heads from './gamedata/mhfu/head.json';
import mhfu_chests from './gamedata/mhfu/body.json';
import mhfu_arms from './gamedata/mhfu/arms.json';
import mhfu_waists from './gamedata/mhfu/waist.json';
import mhfu_legs from './gamedata/mhfu/legs.json';
import mhfu_translation from './gamedata/mhfu/translation.json';
import mhfu_skills from './gamedata/mhfu/skills.json';
import mhfu_decorations from './gamedata/mhfu/decorations.json';

import mhf_heads from './gamedata/mhf/head.json';
import mhf_chests from './gamedata/mhf/body.json';
import mhf_arms from './gamedata/mhf/arms.json';
import mhf_waists from './gamedata/mhf/waist.json';
import mhf_legs from './gamedata/mhf/legs.json';
import mhf_translation from './gamedata/mhf/translation.json';
import mhf_skills from './gamedata/mhf/skills.json';


import { store } from './store';

class GameConfiguration {
  constructor(name, village_ranks, hunter_ranks, damage_types, has_decorations, has_charms, gear, skills, decorations, translation)
  {
    this.name = name;
    this.village_ranks = village_ranks;
    this.hunter_ranks = hunter_ranks;
    this.damage_types = damage_types;
    this.has_decorations = has_decorations;
    this.has_charms = has_charms;
    this.gear = gear;
    this.skills = skills;
    this.decorations = decorations;
    this.translation = translation
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
  false,
  {heads: mhfu_heads, chests: mhfu_chests, arms: mhfu_arms, waists: mhfu_waists, legs: mhfu_legs},
  mhfu_skills,
  mhfu_decorations,
  mhfu_translation
);

const mhf = new GameConfiguration('mhf',
  [
    {value: 6, label: '6★'},
    {value: 5, label: '5★'},
    {value: 4, label: '4★'},
    {value: 3, label: '3★'},
    {value: 2, label: '2★'},
    {value: 1, label: '1★'}
  ],
  [
    {value: 5, label: 'HR5 (GR)'},
    {value: 4, label: 'HR4 (GR)'},
    {value: 3, label: 'HR3 (HR)'},
    {value: 2, label: 'HR2 (HR)'},
    {value: 1, label: 'HR1 (HR)'}
  ],
  ['fire', 'water', 'thunder', 'dragon'],
  false,
  false,
  {heads: mhf_heads, chests: mhf_chests, arms: mhf_arms, waists: mhf_waists, legs: mhf_legs},
  mhf_skills,
  [],
  mhf_translation
);

const games = {
  mhfu,
  mhf
};

function game()
{
  return games[store.getState().game.game];
}

export { game, games };
