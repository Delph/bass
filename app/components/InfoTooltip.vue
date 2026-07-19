<script lang="ts" setup>
import { computed, ref } from 'vue';

defineProps<{
  label: string;
  text: string;
}>();

const hovered = ref(false);
const pinned = ref(false);
const visible = computed(() => hovered.value || pinned.value);

function blur() {
  pinned.value = false;
}
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <button
      type="button"
      class="flex size-5 shrink-0 items-center justify-center rounded-full opacity-60 hover:bg-black/10 hover:opacity-100 focus-visible:opacity-100 dark:hover:bg-white/10"
      :title="label"
      @click.stop="pinned = !pinned"
      @blur="blur"
    >
      <Icon name="lucide:info" />
    </button>
    <span
      v-if="visible"
      class="absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-72 -translate-x-1/2 whitespace-normal rounded-lg bg-stone-950 px-3 py-2 text-left text-xs font-normal text-white shadow-lg dark:bg-stone-100 dark:text-stone-950"
    >
      {{ text }}
    </span>
  </span>
</template>
