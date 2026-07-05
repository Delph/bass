<script lang="ts" setup>
import { ref } from 'vue';
import { type RegisteredToast, useToasts } from '~/composables/useToasts';

const { remove } = useToasts();

defineProps<{
  toast: RegisteredToast;
}>();

const expanded = ref(false);

function colour(type = 'information') {
  switch (type) {
    case 'information':
      return 'text-white';
    case 'success':
      return 'text-emerald-500';
    case 'warning':
      return 'text-amber-500';
    case 'error':
      return 'text-rose-500';
    default:
      return 'text-white';
  }
}
</script>

<template>
  <div
    class="pointer-events-auto mx-auto flex max-w-full transform items-center gap-4 rounded-xl border border-stone-700 bg-black p-4 text-center text-xl shadow-2xl shadow-black/40 transition duration-150 ease-out dark:border-stone-500"
    :class="colour(toast.type)"
    role="status"
    @click="expanded = !expanded"
  >
    <div
      class="min-w-0 flex-1"
      :class="!expanded ? 'overflow-hidden truncate text-ellipsis' : 'h-full'"
    >
      {{ toast.text }}
    </div>
    <button
      type="button"
      class="flex size-6 shrink-0 cursor-pointer select-none items-center justify-center rounded text-white hover:bg-white/10"
      @click.stop="remove(toast.id)"
    >
      <Icon name="lucide:x" class="size-4" />
    </button>
  </div>
</template>
