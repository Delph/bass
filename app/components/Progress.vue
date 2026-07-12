<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
  }>(),
  {
    max: 1,
  },
);

const progress = computed(() => {
  if (props.max <= 0) return 1;

  return Math.min(Math.max(props.value / props.max, 0), 1);
});
</script>

<template>
  <div
    class="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800"
  >
    <div
      class="h-full rounded-full bg-emerald-700 transition-[width] dark:bg-emerald-500"
      :class="{ 'animate-pulse': max <= 0 }"
      :style="{ width: `${progress * 100}%` }"
    />
  </div>
</template>
