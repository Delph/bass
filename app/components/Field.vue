<script lang="ts" setup>
import { computed } from "vue";
import Toggle from '~/components/Toggle.vue';

export type FieldValue = string | number | boolean;

const props = defineProps<
  {
    name: string;
    modelValue?: FieldValue;
    type: 'text' | 'textarea';
    placeholder?: string;
  }
>();

const emit = defineEmits<{
  (event: 'change', value: FieldValue): void;
  (event: 'update:modelValue', value: FieldValue): void;
}>();

function update(value: FieldValue) {
  emit('update:modelValue', value);
  emit('change', value);
}

function inputValue(value: FieldValue | undefined) {
  return value === undefined ? '' : String(value);
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;

  update(target.value);
}
</script>

<template>
   <textarea
    v-if="type === 'textarea'"
    :value="inputValue(modelValue)"
    :name="name"
    :placeholder="placeholder"
    @input="onInputChange"
    class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
  />

  <input
    v-else-if="type === 'text'"
    type="text"
    :name="name"
    :value="inputValue(modelValue)"
    :placeholder="placeholder"
    @input="onInputChange"
    class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
  />
</template>
