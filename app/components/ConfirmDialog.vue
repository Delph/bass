<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';

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

const dialog = ref<HTMLDialogElement | null>(null);
const id = useId();
const titleId = `${id}-title`;
const messageId = `${id}-message`;
let returnFocus: HTMLElement | null = null;

function restoreFocus() {
  if (returnFocus?.isConnected) returnFocus.focus();
  returnFocus = null;
}

watch(
  () => props.open,
  async (open) => {
    await nextTick();

    const element = dialog.value;
    if (!element) return;

    if (open && !element.open) {
      returnFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      element.showModal();
    } else if (!open && element.open) {
      element.close();
      restoreFocus();
    }
  },
  { immediate: true },
);

onBeforeUnmount(restoreFocus);
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="m-auto w-[calc(100%-2rem)] max-w-sm bg-transparent p-0 backdrop:bg-stone-950/80"
      :aria-labelledby="titleId"
      :aria-describedby="message ? messageId : undefined"
      @cancel.prevent="emit('cancel')"
      @click.self="emit('cancel')"
    >
      <section
        class="w-full max-w-sm rounded-xl border border-stone-300 bg-stone-50 p-4 text-stone-950 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
        <p
          v-if="message"
          :id="messageId"
          class="mt-2 text-sm text-stone-600 dark:text-stone-300"
        >
          {{ message }}
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl bg-stone-200 px-3 py-2 dark:bg-stone-800"
            autofocus
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
    </dialog>
  </Teleport>
</template>
