<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useGame } from '~/composables/useGame';
import { useQuery } from '~/composables/useQuery';
import type { WorkerMessage, WorkerResponse } from '~/workers/types';
import type { BuildResult } from '~/solver/solver';
import { formatNumber } from '~/format';
import { range, omit } from "~/utility";
import { prepare, type PreparedGear } from "~/solver/prepare";
import SetCard from "~/components/SetCard.vue";

const { query } = useQuery();
const { data } = useGame();

const workers = ref<Worker[]>([]);
const attempts = ref<number[]>([]);
const combinationCounts = ref<number[]>([]);
const results = ref<BuildResult[]>([]);

const attempted = computed(() => attempts.value.reduce((total, count) => total + count, 0));
const combinations = computed(() => combinationCounts.value.reduce((total, count) => total + count, 0));

function clone<T>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T;
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

function partition(gear: PreparedGear, worker: number, workers: number): PreparedGear {
  return {
    ...gear,
    head: gear.head.filter((_, index) => index % workers === worker),
  };
}

function stop() {
  for (const worker of Object.values(workers.value))
    worker.postMessage({ type: 'stop' } satisfies WorkerMessage);
}

onMounted(() => {
  if (!data.value) return;

  attempts.value = [];
  combinationCounts.value = [];
  results.value = [];

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
      payload: { gear: clone(partition(prepared, i, workerCount)), query: clone(query.value) },
    } satisfies WorkerMessage);
  }
});

onBeforeUnmount(() => {
  for (const worker of Object.values(workers.value)) {
    worker.postMessage({ type: 'stop' } satisfies WorkerMessage);
    worker.postMessage({ type: 'terminate' } satisfies WorkerMessage);
    worker.terminate();
  }
  workers.value = [];
  attempts.value = [];
  combinationCounts.value = [];
});
</script>
<template>
  <div>
    {{ formatNumber(results.length) }} results, {{ formatNumber(attempted) }} of
    {{ formatNumber(combinations) }} combinations

    <progress v-for="i in range(0, workers.length)" :value="attempts[i] / combinationCounts[i]"/>

    <button @click="() => stop()">stop</button>

    <div class="flex flex-col gap-2">
      <SetCard
        :set="{
          armour: {
            head: { piece: data!.armour.head[0]!, decorations: [] },
            body: { piece: data!.armour.body[0]!, decorations: [] },
            arms: { piece: data!.armour.arms[0]!, decorations: [] },
            waist: { piece: data!.armour.waist[0]!, decorations: [] },
            legs: { piece: data!.armour.legs[0]!, decorations: [] },
          },
          torsoInc: 0,
          skills: {}
        }"
      />

      <SetCard
        v-for="result in results"
        :set="result"
      />
    </div>
  </div>
</template>
