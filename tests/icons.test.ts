import lucide from '@iconify-json/lucide/icons.json';
import { expect, test } from 'vitest';

const sourceFiles = import.meta.glob('../app/**/*.{ts,vue}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

test('all referenced Lucide icons exist locally', () => {
  const available = new Set([
    ...Object.keys(lucide.icons),
    ...Object.keys(lucide.aliases ?? {}),
  ]);
  const missing = new Set<string>();

  for (const source of Object.values(sourceFiles)) {
    for (const match of source.matchAll(/\blucide:([a-z0-9-]+)\b/g)) {
      const name = match[1];
      if (name && !available.has(name)) missing.add(name);
    }
  }

  expect([...missing].sort()).toEqual([]);
});
