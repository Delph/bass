import { useState } from '#app';
import { computed, type Ref } from 'vue';

import type { DamageType, GameData } from '~/game/types';
import type { QueryState } from '~/query/types';
import {
  createEmptySearchSession,
  SearchClient,
  type SearchSession,
} from '~/solver/client';
import { usePreferences } from './usePreferences';

export type SearchSortCriteria = 'defence' | DamageType;

let client: SearchClient | null = null;
let subscribed = false;

function getClient(session: Ref<SearchSession>, workers: Ref<number>) {
  client ??= new SearchClient({
    createWorker: () =>
      new Worker(new URL('~/workers/worker.ts', import.meta.url), {
        type: 'module',
      }),
    maxWorkers: () => workers.value,
  });

  if (!subscribed) {
    subscribed = true;
    client.subscribe((next) => {
      session.value = next;
    });
  }

  return client;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function useSearch() {
  const session = useState<SearchSession>('search-session', () =>
    createEmptySearchSession(),
  );
  const sort = useState<SearchSortCriteria | null>('search-sort', () => null);
  const { workers } = usePreferences();
  const search = getClient(session, workers);

  const attempted = computed(() => sum(session.value.attempts));
  const combinations = computed(() => sum(session.value.combinationCounts));
  const progress = computed(() =>
    combinations.value === 0
      ? session.value.status === 'completed'
        ? 1
        : 0
      : attempted.value / combinations.value,
  );
  const hasSession = computed(
    () => session.value.id !== 0 && session.value.slug !== null,
  );
  const active = computed(() =>
    ['running', 'paused'].includes(session.value.status),
  );
  const results = computed(() => session.value.results);

  function start(slug: string, query: QueryState, data: GameData) {
    sort.value = null;
    return search.start({ slug, query, data });
  }

  function reset() {
    sort.value = null;
    search.reset();
  }

  return {
    active,
    attempted,
    combinations,
    hasSession,
    progress,
    results,
    session,
    sort,
    pause: () => search.pause(),
    reset,
    resume: () => search.resume(),
    start,
    stop: () => search.stop(),
    togglePause: () => search.togglePause(),
  };
}
