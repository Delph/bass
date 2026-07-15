import { useState } from '#app';
import { computed, type Ref } from 'vue';

import type { DamageType, GameData } from '~/game/types';
import type { QueryState } from '~/query/types';
import {
  createEmptySearchSession,
  SearchClient,
  type SearchSession,
} from '~/solver/client';
import type { BuildResult } from '~/solver/solver';
import { usePreferences } from './usePreferences';

export type SearchSortCriteria = 'defence' | DamageType;

let client: SearchClient | null = null;
let subscribed = false;

function getClient(
  session: Ref<SearchSession>,
  results: Ref<BuildResult[]>,
  workers: Ref<number>,
  cutoff: Ref<number>,
) {
  client ??= new SearchClient({
    createWorker: () =>
      new Worker(new URL('~/workers/worker.ts', import.meta.url), {
        type: 'module',
      }),
    maxWorkers: () => workers.value,
    cutoff: () => cutoff.value,
  });

  if (!subscribed) {
    subscribed = true;
    client.subscribe((next) => {
      if (
        next.id !== session.value.id ||
        next.results.length !== results.value.length
      )
        results.value = [...next.results];

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
  const results = useState<BuildResult[]>('search-results', () => []);
  const sort = useState<SearchSortCriteria | null>('search-sort', () => null);
  const { workers, cutoff } = usePreferences();
  const search = getClient(session, results, workers, cutoff);

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
    togglePause: () => search.togglePause(),
  };
}
