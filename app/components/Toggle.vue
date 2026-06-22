<script lang="ts" setup>
const props = defineProps<{
  label?: string;
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "change", value: boolean): void;
}>();

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.checked;

  emit("update:modelValue", value);
  emit("change", value);
}
</script>

<template>
  <label class="relative inline-flex h-6 w-11 m-1 cursor-pointer">
    <input
      class="peer sr-only"
      type="checkbox"
      :aria-label="label"
      :checked="modelValue"
      @change="onChange"
    >
    <span class="absolute inset-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700 dark:bg-stone-700 dark:peer-checked:bg-emerald-500 dark:peer-focus-visible:outline-emerald-400" />
    <span
      class="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 dark:bg-stone-100"
    />
  </label>
</template>
