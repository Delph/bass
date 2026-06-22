<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  active?: boolean;
  disabled?: boolean | (() => boolean);
}>();

const emit = defineEmits<{ (e: "click"): void }>();

const disabled = computed(() => {
  if (typeof props.disabled === "function")
    return props.disabled();
  return props.disabled;
});
</script>

<template>
  <button
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot></slot>
  </button>
</template>
