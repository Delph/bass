<script lang="ts" setup>
import { computed } from 'vue';
import { useGame } from '~/composables/useGame';
import {
  useSearch,
  type SearchSortCriteria,
} from '~/composables/useSearch';
import type { BuildResult } from '~/solver/solver';
import { formatNumber, formatPercent } from '~/format';
import ResultCard from '~/components/ResultCard.vue';
import Progress from '~/components/Progress.vue';
import Select from '~/components/Select.vue';
import type { DamageType } from '~/game/types';
import { useTranslation } from '#imports';

const { translate } = useTranslation();
const { game, slug } = useGame();
const search = useSearch();
const {
  active,
  attempted,
  combinations,
  progress,
  session,
  sort,
  togglePause,
} = search;

const searchPath = computed(() =>
  slug.value ? `/${encodeURIComponent(slug.value)}/search` : '/',
);
const hasCurrentSession = computed(
  () => search.hasSession.value && search.session.value.slug === slug.value,
);
const results = computed(() =>
  hasCurrentSession.value ? search.results.value : [],
);
const sortedResults = computed(() => {
  if (search.sort.value === null) return results.value;

  return results.value
    .map((result, index) => ({ result, index }))
    .toSorted((a, b) => {
      const difference =
        sortValue(b.result, search.sort.value!) -
        sortValue(a.result, search.sort.value!);

      if (difference !== 0) return difference;

      return a.index - b.index;
    })
    .map(({ result }) => result);
});

function pieces(result: BuildResult) {
  return Object.values(result.armour);
}

function defence(result: BuildResult) {
  return pieces(result).reduce((total, piece) => total + piece.defence, 0);
}

function resistance(result: BuildResult, element: DamageType) {
  return pieces(result).reduce(
    (total, piece) => total + piece.resistances[element],
    0,
  );
}

function effectiveDefence(result: BuildResult, element: DamageType) {
  const rawDefence = defence(result);
  const rawResistance = resistance(result, element);

  return Math.floor(
    (1 / ((160 * (1 - rawResistance / 100)) / (rawDefence + 160))) * rawDefence,
  );
}

function sortValue(result: BuildResult, criterion: SortCriteria) {
  if (criterion === 'defence') return defence(result);

  return effectiveDefence(result, criterion);
}

type SortCriteria = SearchSortCriteria;

function setSort(value: SearchSortCriteria | null) {
  search.sort.value = value;
}
</script>
<template>
  <div class="flex flex-col gap-2">
    <template v-if="hasCurrentSession">
      <div
        class="rounded-xl border border-stone-200 bg-white p-2 dark:border-stone-700 dark:bg-stone-900"
      >
        <div class="mb-2 flex items-center justify-between gap-3">
          <div class="min-w-0 text-sm text-stone-600 dark:text-stone-400">
            <p>
              {{
                translate('results-progress', {
                  attempted: formatNumber(attempted),
                  combinations: formatNumber(combinations),
                })
              }}
            </p>
            <p>{{ translate(`search-status-${session.status}`) }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="font-mono text-sm text-stone-600 dark:text-stone-400">
              {{ formatPercent(progress, 0, { roundingMode: 'floor' }) }}
            </span>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
              :disabled="!active"
              @click="togglePause"
            >
              <Icon :name="session.status === 'paused' ? 'lucide:play' : 'lucide:pause'" />
            </button>
          </div>
        </div>
        <Progress :value="attempted" :max="combinations || 1" />
      </div>

      <div
        v-if="session.error"
        class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
      >
        {{ translate('search-error') }}
      </div>

      {{
        translate('results-count', {
          count: results.length,
          formatted: formatNumber(results.length),
        })
      }}

      <Select
        name="sort"
        :value="sort"
        :options="[
          { value: null, label: translate('result-sort-default') },
          { value: 'defence', label: translate('result-sort-defence') },
          ...game!.elements.map((e) => ({
            value: e,
            label: translate(`result-sort-${e}`),
          })),
        ]"
        @change="(s) => setSort(s as SortCriteria | null)"
        class="w-full"
      />
      <div class="flex flex-col gap-2">
        <ResultCard
          v-for="(result, index) in sortedResults"
          :key="index"
          :set="result"
        />
      </div>
    </template>

    <div
      v-else
      class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
    >
      <h2 class="text-xl font-bold">{{ translate('navigation-tab-results') }}</h2>
      <p class="mt-2 text-stone-600 dark:text-stone-400">
        {{ translate('results-empty') }}
      </p>
      <NuxtLink
        :to="searchPath"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
      >
        {{ translate('search-submit') }}
      </NuxtLink>
    </div>
  </div>
</template>
