import { game } from './gamedata';

import { store } from './store';

function number_format(x)
{
  return new Intl.NumberFormat().format(x);
}

function money_format(x)
{
  return `${new Intl.NumberFormat().format(x)}z`;
}

function slots_format(x, f=0, m=3)
{
  return '●'.repeat(f) + '○'.repeat(x) + '-'.repeat(m-x-f);
}

function weapon_class(c)
{
  switch (c)
  {
    case 1:
      return 'Blademaster';
    case 2:
      return 'Gunner';
    case 3:
      return '';
    default:
      return `UNKNOWN: ${c}`;
  }
}

function gender(g)
{
  switch (g)
  {
    case 1:
      return 'Male';
    case 2:
      return 'Female';
    case 3:
      return '';
    default:
      return `UNKNOWN: ${g}`;
  }
}

function activated_effect(name, points)
{
  const skill = game().skills.find(s => s.name === name);
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
  const section = game().translation[type] ?? null;
  const dict = section[key] ?? null;
  return dict && dict[store.getState().game[store.getState().game.game].settings.language] ? dict[store.getState().game[store.getState().game.game].settings.language] : key;
}

export { number_format, money_format, slots_format, weapon_class, gender, activated_effect, translate };
