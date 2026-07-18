import { computed } from 'vue';
import { useGame } from '~/composables/useGame';
import { appendHistory } from '~/history';
import { bucket, type HistoryEntry } from '~/persistence/buckets/history';
import { current } from '~/persistence/storage';
import type { QueryState } from '~/query/types';
import type { UUID } from '~/types';
import { deepcopy } from '~/utility';

export type { HistoryEntry } from '~/persistence/buckets/history';

export function useHistory() {
  const { slug } = useGame();
  const searches = bucket.state();

  const allEntries = computed(() =>
    current(slug.value ?? 'mhfu', searches.value, () => []),
  );
  const entries = computed(() =>
    allEntries.value.filter((entry) => entry.deletedAt === null),
  );

  function add(value: QueryState) {
    if (Object.keys(value.skills).length === 0) return;

    appendHistory(allEntries.value, {
      id: crypto.randomUUID(),
      query: deepcopy(value),
      createdAt: Date.now(),
      deletedAt: null,
    });
    bucket.save(searches.value);
  }

  function remove(id: UUID) {
    const entry = allEntries.value.find((entry) => entry.id === id);
    if (!entry) return;

    entry.deletedAt = Date.now();
    bucket.save(searches.value);
  }

  return {
    entries,
    add,
    remove,
  };
}
