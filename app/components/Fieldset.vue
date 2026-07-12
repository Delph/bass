<script lang="ts" setup>
import { ref } from "vue";

defineProps<{
  legend: string;
}>();

const open = ref(true);
</script>

<template>
  <fieldset class="rounded border border-stone-300 p-3 dark:border-stone-700">
    <legend>
      <button
        class="flex items-center gap-2 px-1 font-semibold text-stone-900 dark:text-stone-100"
        type="button"
        @click="open = !open"
      >
        {{ legend }}
        <Icon
          name="lucide:chevron-down"
          class="transition-transform"
          :class="{ '-rotate-90': !open }"
        />
      </button>
    </legend>
    <div
      v-show="open"
      class="mt-2"
    >
      <slot />
    </div>
  </fieldset>
</template>
