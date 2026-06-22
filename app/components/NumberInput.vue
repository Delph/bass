<script lang="ts" setup>
defineProps<{
  name: string;
  value: number;

  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (event: 'change', value: number | null): void;
}>();

function update(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  emit("change", value !== "" ? Number(value) : null);
}
</script>

<template>
  <input
    type="number"
    :name="name"
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    :placeholder="placeholder"
    @input="update"
    class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
  />
</template>
