<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
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
import { wireIDv1 } from '~/set';

const PAGE_SIZE = 100;

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
const page = ref(1);
const resultsList = ref<HTMLElement | null>(null);
const resultIds = new WeakMap<BuildResult, string>();

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
const pageCount = computed(() =>
  Math.max(1, Math.ceil(sortedResults.value.length / PAGE_SIZE)),
);
const pagedResults = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;

  return sortedResults.value.slice(start, start + PAGE_SIZE);
});
const pageStart = computed(() =>
  results.value.length === 0 ? 0 : (page.value - 1) * PAGE_SIZE + 1,
);
const pageEnd = computed(() =>
  Math.min(page.value * PAGE_SIZE, results.value.length),
);

watch(
  () => session.value.id,
  () => (page.value = 1),
);
watch(sort, () => (page.value = 1));
watch(pageCount, (count) => {
  if (page.value > count) page.value = count;
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

function resultId(result: BuildResult) {
  let id = resultIds.get(result);

  if (id === undefined) {
    id = wireIDv1(result.armour, result.decorations);
    resultIds.set(result, id);
  }

  return id;
}

async function setPage(next: number) {
  page.value = next;
  await nextTick();
  resultsList.value?.scrollIntoView({ block: 'start' });
}

function previousPage() {
  if (page.value > 1) void setPage(page.value - 1);
}

function nextPage() {
  if (page.value < pageCount.value) void setPage(page.value + 1);
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
              :title="translate(session.status === 'paused' ? 'search-resume' : 'search-pause')"
              :aria-label="translate(session.status === 'paused' ? 'search-resume' : 'search-pause')"
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
      <span v-if="pageCount > 1" class="text-sm text-stone-600 dark:text-stone-400">
        {{
          translate('results-page-range', {
            first: formatNumber(pageStart),
            last: formatNumber(pageEnd),
            total: formatNumber(results.length),
          })
        }}
      </span>

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
      <div ref="resultsList" class="flex flex-col gap-2">
        <ResultCard
          v-for="result in pagedResults"
          :key="resultId(result)"
          :set="result"
        />
      </div>
      <nav
        v-if="pageCount > 1"
        class="flex items-center justify-center gap-3"
        :aria-label="translate('results-pagination')"
      >
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-xl border border-stone-300 text-stone-700 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
          :disabled="page === 1"
          :title="translate('results-previous-page')"
          :aria-label="translate('results-previous-page')"
          @click="previousPage"
        >
          <Icon name="lucide:chevron-left" />
        </button>
        <span class="min-w-28 text-center text-sm">
          {{
            translate('results-page-count', {
              page: formatNumber(page),
              pages: formatNumber(pageCount),
            })
          }}
        </span>
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-xl border border-stone-300 text-stone-700 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
          :disabled="page === pageCount"
          :title="translate('results-next-page')"
          :aria-label="translate('results-next-page')"
          @click="nextPage"
        >
          <Icon name="lucide:chevron-right" />
        </button>
      </nav>
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
