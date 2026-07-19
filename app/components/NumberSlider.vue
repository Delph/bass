<script lang="ts" setup>
import NumberInput from '~/components/NumberInput.vue';
import { useLanguage } from '~/composables/useLanguage';

const { formatNumber } = useLanguage();

const props = withDefaults(
  defineProps<{
    label: string;
    max: number;
    min: number;
    name: string;
    step?: number;
    ticks?: number[];
    value: number;
  }>(),
  {
    step: 1,
    ticks: () => [],
  },
);

const emit = defineEmits<{
  (event: 'change', value: number | null): void;
}>();

function updateFromRange(event: Event) {
  emit('change', Number((event.target as HTMLInputElement).value));
}

function tickPosition(tick: number) {
  if (props.max === props.min) return '50%';

  return `${((tick - props.min) / (props.max - props.min)) * 100}%`;
}
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-x-3">
    <input
      type="range"
      :name="name"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      :aria-label="label"
      class="col-start-1 row-start-1 m-0 block w-full accent-emerald-700 dark:accent-emerald-500"
      @input="updateFromRange"
    />
    <label class="col-start-2 row-start-1">
      <span class="sr-only">{{ label }}</span>
      <NumberInput
        :name="`${name}-value`"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
        class="w-full py-1 text-right tabular-nums"
        @change="(next) => emit('change', next)"
      />
    </label>
    <div
      v-if="ticks.length > 0"
      class="relative col-start-1 row-start-2 mx-2 mt-1 h-6 text-xs text-stone-500 dark:text-stone-400"
      aria-hidden="true"
    >
      <span
        v-for="tick in ticks"
        :key="tick"
        class="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
        :style="{ left: tickPosition(tick) }"
      >
        <span class="h-1.5 w-px bg-stone-400 dark:bg-stone-500" />
        <span>{{ formatNumber(tick) }}</span>
      </span>
    </div>
  </div>
</template>
