<script lang="ts" setup>
const props = defineProps<{
  name: string;
  value?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (event: 'change', value: string): void;
}>();

function update(value: string) {
  emit('change', value);
}

function inputValue(value: string | undefined) {
  return value === undefined ? '' : String(value);
}

function onInputChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;

  update(target.value);
}
</script>

<template>
  <textarea
    :value="inputValue(value)"
    :name="name"
    :placeholder="placeholder"
    @input="onInputChange"
    class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
  />
</template>
