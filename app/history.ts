import type { QueryState } from '~/query/types';

export const HISTORY_LIMIT = 30;

type HistoryRecord = {
  query: QueryState;
  createdAt: number;
  deletedAt: number | null;
};

function queryKey(value: QueryState) {
  return JSON.stringify([
    value.hunter.rank,
    value.hunter.village,
    value.hunter.gender,
    value.weapon.class,
    value.weapon.slots,
    value.options.allowBad,
    value.options.allowDummy,
    Object.entries(value.skills).toSorted(([left], [right]) =>
      left.localeCompare(right),
    ),
  ]);
}

export function appendHistory<T extends HistoryRecord>(
  entries: T[],
  entry: T,
) {
  const key = queryKey(entry.query);

  for (let index = entries.length - 1; index >= 0; --index) {
    const existing = entries[index]!;

    if (
      existing.deletedAt === null &&
      queryKey(existing.query) === key
    )
      entries.splice(index, 1);
  }

  entries.push(entry);

  const excess = entries
    .filter((record) => record.deletedAt === null)
    .toSorted((left, right) => left.createdAt - right.createdAt)
    .slice(0, -HISTORY_LIMIT);

  for (const existing of excess) existing.deletedAt = entry.createdAt;
}
