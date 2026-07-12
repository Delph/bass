import { query, type QueryState } from '~/query/types';
import { defineBucket } from '~/persistence/storage';

export const bucket = defineBucket<Record<string, QueryState>>({
  key: 'bass:query',
  version: 0,
  initial: {
    mhf: query({
      hunter: { rank: 5, village: 6 },
    }),
    mhfu: query(),
  },
  migrate: function (
    version: number,
    stored: unknown,
  ): Record<string, QueryState> {
    return stored as Record<string, QueryState>;
  },
});
