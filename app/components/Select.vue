<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({
  inheritAttrs: false,
});

type Value = string | number | boolean | null;
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

const grouped = computed(() => {
  const groups = new Map<string, Option[]>();
  const ungrouped = [];
  for (const option of props.options) {
    if (!option.group) {
      ungrouped.push(option);
    } else {
      groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
    }
  }

  return [
    ...(ungrouped.length ? [{ label: '', options: ungrouped }] : []),
    ...[...groups.entries()].map(([label, options]) => ({ label, options })),
  ];
});

function change(event: Event) {
  const target = event.target as HTMLSelectElement;
  const option = props.options.find(
    (opt) => String(opt.value) === target.value,
  );
  emit('change', option!.value);
}
</script>

<template>
  <span
    v-bind="$attrs"
    class="relative inline-block"
  >
    <select
      class="w-full appearance-none rounded border border-stone-300 bg-white py-1 pl-2 pr-8 text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      :name="name"
      :value="String(value)"
      @change="change"
      :disabled="disabled"
    >
      <template v-for="group in grouped" :key="group.label">
        <optgroup v-if="group.label" :label="group.label">
          <option
            v-for="option in group.options"
            :key="String(option.value)"
            :value="String(option.value)"
          >
            {{ option.label }}
          </option>
        </optgroup>
        <template v-else>
          <option
            v-for="option in group.options"
            :key="String(option.value)"
            :value="String(option.value)"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </template>
      </template>
    </select>
    <Icon
      name="lucide:chevron-down"
      class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400"
    />
  </span>
</template>
