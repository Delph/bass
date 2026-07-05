<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useGame } from '~/composables/useGame';
import { useQuery } from '~/composables/useQuery';
import type { WorkerMessage, WorkerResponse } from '~/workers/types';
import type { BuildResult } from '~/solver/solver';
import { formatNumber, formatPercent } from '~/format';
import { range, omit } from '~/utility';
import { prepare, type PreparedGear } from '~/solver/prepare';
import ResultCard from '~/components/ResultCard.vue';
import Progress from '~/components/Progress.vue';
import SkillPill from '~/components/SkillPill.vue';
import Select from '~/components/Select.vue';
import type { DamageType } from '~/game/types';
import type { Identity } from '~/types';
import { useTranslation } from '#imports';

const { translate } = useTranslation();
const { query } = useQuery();
const { game, data } = useGame();

const workers = ref<Worker[]>([]);
const attempts = ref<number[]>([]);
const combinationCounts = ref<number[]>([]);
const results = ref<BuildResult[]>([]);
const stopped = ref(false);
const paused = ref(false);

type SortCriteria = Identity<'defence' | DamageType>;
const sort = ref<SortCriteria | null>(null);

const attempted = computed(() =>
  attempts.value.reduce((total, count) => total + count, 0),
);
const combinations = computed(() =>
  combinationCounts.value.reduce((total, count) => total + count, 0),
);
const progress = computed(() =>
  combinations.value === 0 ? 0 : attempted.value / combinations.value,
);
const sortedResults = computed(() => {
  if (sort.value === null) return results.value;

  return results.value
    .map((result, index) => ({ result, index }))
    .toSorted((a, b) => {
      const difference =
        sortValue(b.result, sort.value!) - sortValue(a.result, sort.value!);

      if (difference !== 0) return difference;

      return a.index - b.index;
    })
    .map(({ result }) => result);
});

function clone<T>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T;
}

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

function onMessage(worker: number, message: MessageEvent<WorkerResponse>) {
  switch (message.data.type) {
    case 'start':
      attempts.value[worker] = 0;
      combinationCounts.value[worker] = message.data.payload.combinations;
      return;
    case 'progress':
      attempts.value[worker] = message.data.payload.attempted;
      return;
    case 'error':
      console.error(message.data.payload.message);
      return;
    case 'result':
      results.value.push(message.data.payload);
      return;
  }
}

function threads(gear: PreparedGear): number {
  return Math.max(1, Math.min(navigator.hardwareConcurrency, gear.head.length));
}

function partition(
  gear: PreparedGear,
  worker: number,
  workers: number,
): PreparedGear {
  return {
    ...gear,
    head: gear.head.filter((_, index) => index % workers === worker),
  };
}

function stop() {
  stopped.value = true;
  paused.value = false;

  for (const worker of Object.values(workers.value))
    worker.postMessage({ type: 'stop' } satisfies WorkerMessage);
}

function togglePause() {
  if (stopped.value) return;

  paused.value = !paused.value;

  for (const worker of Object.values(workers.value)) {
    worker.postMessage({
      type: paused.value ? 'pause' : 'resume',
    } satisfies WorkerMessage);
  }
}

onMounted(() => {
  if (!data.value) return;

  attempts.value = [];
  combinationCounts.value = [];
  results.value = [];
  stopped.value = false;
  paused.value = false;

  const prepared = prepare(query.value, data.value);
  const workerCount = threads(prepared);

  for (const i of range(0, workerCount)) {
    workers.value[i] = new Worker(
      new URL('~/workers/worker.ts', import.meta.url),
      { type: 'module' },
    );
    workers.value[i].onmessage = (message) => onMessage(i, message);
    workers.value[i].postMessage({
      type: 'data',
      payload: clone(omit(data.value, 'armour')),
    } satisfies WorkerMessage);
    workers.value[i].postMessage({
      type: 'query',
      payload: {
        gear: clone(partition(prepared, i, workerCount)),
        query: clone(query.value),
      },
    } satisfies WorkerMessage);
  }
});

onBeforeUnmount(() => {
  stop();

  for (const worker of Object.values(workers.value)) {
    worker.postMessage({ type: 'terminate' } satisfies WorkerMessage);
    worker.terminate();
  }
  workers.value = [];
  attempts.value = [];
  combinationCounts.value = [];
  stopped.value = true;
  paused.value = false;
});
</script>
<template>
  <div class="flex flex-col gap-2">
    <!--div class="flex flex-wrap gap-2">
      <SkillPill
        v-for="(points, skill) in query.skills"
        :skill="{ skill, points }"
      />
      </div-->
    <div
      class="rounded-xl border border-stone-200 bg-white p-2 dark:border-stone-700 dark:bg-stone-900"
    >
      <div class="mb-2 flex items-center justify-between gap-3">
        <p class="min-w-0 text-sm text-stone-600 dark:text-stone-400">
          {{
            translate('results-progress', {
              attempted: formatNumber(attempted),
              combinations: formatNumber(combinations),
            })
          }}
        </p>
        <div class="flex shrink-0 items-center gap-2">
          <span class="font-mono text-sm text-stone-600 dark:text-stone-400">
            {{ formatPercent(progress) }}
          </span>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200"
            :disabled="stopped"
            @click="togglePause"
          >
            <Icon :name="paused ? 'lucide:play' : 'lucide:pause'" />
          </button>
        </div>
      </div>
      <Progress :value="attempted" :max="combinations || 1" />
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
      @change="(s) => (sort = s as SortCriteria | null)"
      class="w-full"
    />
    <div class="flex flex-col gap-2">
      <ResultCard v-for="result in sortedResults" :set="result" />
    </div>
  </div>
</template>
