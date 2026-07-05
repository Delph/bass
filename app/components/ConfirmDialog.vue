<script lang="ts" setup>
const props = defineProps<{
  open: boolean;
  title: string;
  message?: string;
  confirm: string;
  cancel: string;
  danger?: boolean;
}>();

const emit = defineEmits<{
  (event: 'cancel'): void;
  (event: 'confirm'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4"
      @click.self="emit('cancel')"
    >
      <section
        role="dialog"
        aria-modal="true"
        class="w-full max-w-sm rounded-xl border border-stone-300 bg-stone-50 p-4 text-stone-950 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="message" class="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {{ message }}
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl bg-stone-200 px-3 py-2 dark:bg-stone-800"
            @click="emit('cancel')"
          >
            {{ cancel }}
          </button>
          <button
            type="button"
            class="rounded-xl px-3 py-2 font-semibold text-white"
            :class="danger ? 'bg-rose-700' : 'bg-emerald-700'"
            @click="emit('confirm')"
          >
            {{ confirm }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
