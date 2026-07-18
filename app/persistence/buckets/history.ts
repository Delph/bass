import type { QueryState } from '~/query/types';
import { defineBucket, pruneDeleted } from '~/persistence/storage';
import type { AuditFields, UUID } from '~/types';

export type HistoryEntry = {
  id: UUID;
  query: QueryState;
} & Omit<AuditFields, 'updatedAt'>;

export const bucket = defineBucket<Record<string, HistoryEntry[]>>({
  key: 'bass:history',
  version: 0,
  initial: {},
  migrate: function (
    version: number,
    stored: unknown,
  ): Record<string, HistoryEntry[]> {
    return stored as Record<string, HistoryEntry[]>;
  },
  prune: (data) =>
    Object.values(data).reduce(
      (removed, records) => removed + pruneDeleted(records),
      0,
    ),
});
