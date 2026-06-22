<script lang="ts" setup>
type Value = string | number | boolean;
type Option = {
  value: Value;
  label: string;
  group?: string;
  disabled?: boolean;
};

const props = defineProps<{
  name: string;
  value?: Value;
  options: Option[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: 'change', value: Value): void;
}>();
</script>

<template>
  <label
    v-for="option in options"
    :key="String(option.value)"
    class="flex items-center gap-1"
  >
    <input
      type="radio"
      class="accent-emerald-700 dark:accent-emerald-500"
      :name="name"
      :value="String(option.value)"
      :checked="String(value) === String(option.value)"
      @change="emit('change', option.value)"
      :disabled="option.disabled"
    />
    {{ option.label }}
  </label>
</template>
