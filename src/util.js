import { skills } from './gamedata';
import { translation } from './gamedata';

import { store } from './store';

function number_format(x)
{
  return new Intl.NumberFormat().format(x);
}

function money_format(x)
{
  return `${new Intl.NumberFormat().format(x)}z`;
}

function activated_effect(name, points)
{
  const skill = skills.find(s => s.name === name);
  if (!skill)
    return null;

  while (points !== 0)
  {
    const effect = skill.skills[Math.trunc(points / 5) * 5];
    if (effect)
      return effect;
    points = (Math.trunc(points / 5) + (points < 0 ? 1 : -1)) * 5;
  }
  return null;
}

function translate(type, key)
{
  const section = translation[type] ?? null;
  const dict = section[key] ?? null;
  return dict && dict[store.getState().settings.language] ? dict[store.getState().settings.language] : key;
}

export { number_format, money_format, activated_effect, translate };
