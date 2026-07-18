<script lang="ts" setup>
import { computed } from 'vue';

const RING_CIRCUMFERENCE = 2 * Math.PI * 10;
const props = defineProps<{
  value: number;
  hideForReducedMotion?: boolean;
}>();
const progress = computed(() => {
  if (!Number.isFinite(props.value)) return 0;

  return Math.min(Math.max(props.value, 0), 1);
});
</script>

<template>
  <span class="relative inline-flex shrink-0 items-center justify-center">
    <svg
      class="pointer-events-none absolute inset-0 size-full -rotate-90"
      :class="{ 'motion-reduce:hidden': hideForReducedMotion }"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
        :stroke-dasharray="RING_CIRCUMFERENCE"
        :stroke-dashoffset="RING_CIRCUMFERENCE * (1 - progress)"
      />
    </svg>
    <span class="relative flex size-full items-center justify-center">
      <slot />
    </span>
  </span>
</template>
