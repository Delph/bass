import { expect, test } from 'vitest';

import { appendHistory, HISTORY_LIMIT } from '~/history';
import { query, type QueryState } from '~/query/types';

function entry(id: string, value: QueryState, createdAt: number) {
  return {
    id,
    query: value,
    createdAt,
    deletedAt: null as number | null,
  };
}

test('appendHistory replaces a repeated active query', () => {
  const entries = [
    entry(
      'first',
      query({ skills: { attack: 10, 'sharpness-budget': 10 } }),
      1,
    ),
  ];
  const repeated = entry(
    'repeated',
    query({ skills: { 'sharpness-budget': 10, attack: 10 } }),
    2,
  );

  appendHistory(entries, repeated);

  expect(entries).toStrictEqual([repeated]);
});

test('appendHistory soft-deletes active entries beyond the limit', () => {
  const entries = Array.from({ length: HISTORY_LIMIT }, (_, index) =>
    entry(
      String(index),
      query({ skills: { [`skill-${index}`]: 10 } }),
      index + 1,
    ),
  );
  const latest = entry(
    'latest',
    query({ skills: { [`skill-${HISTORY_LIMIT}`]: 10 } }),
    HISTORY_LIMIT + 1,
  );

  appendHistory(entries, latest);

  expect(entries.filter((record) => record.deletedAt === null)).toHaveLength(
    HISTORY_LIMIT,
  );
  expect(entries[0]?.deletedAt).toBe(latest.createdAt);
  expect(entries.at(-1)).toBe(latest);
});
