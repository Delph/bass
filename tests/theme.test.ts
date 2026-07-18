import { expect, test } from 'vitest';

import { resolveTheme } from '~/theme';

test.each([
  ['light', false, 'light'],
  ['light', true, 'light'],
  ['dark', false, 'dark'],
  ['dark', true, 'dark'],
  ['system', false, 'light'],
  ['system', true, 'dark'],
] as const)(
  'resolves %s with system dark set to %s',
  (theme, systemDark, expected) => {
    expect(resolveTheme(theme, systemDark)).toBe(expected);
  },
);
