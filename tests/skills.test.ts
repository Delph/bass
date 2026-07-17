import { expect, test } from 'vitest';

import type { SkillDefinition } from '~/game/types';
import { getEffect } from '~/skills';

const skill: SkillDefinition = {
  id: 1,
  slug: 'attack',
  categories: [],
  effects: {
    '-20': { description: 'large penalty' },
    '-15': { description: 'medium penalty' },
    '-10': { description: 'small penalty' },
    '10': { description: 'small bonus' },
    '15': { description: 'medium bonus' },
    '20': { description: 'large bonus' },
  },
};

test.each([
  [-25, -20],
  [-20, -20],
  [-19, -15],
  [-15, -15],
  [-14, -10],
  [-10, -10],
  [-9, null],
  [0, null],
  [9, null],
  [10, 10],
  [14, 10],
  [15, 15],
  [19, 15],
  [20, 20],
  [25, 20],
] as const)('getEffect resolves %i points to the %s threshold', (points, expected) => {
  expect(getEffect([skill], skill.slug, points)?.points ?? null).toBe(expected);
});
