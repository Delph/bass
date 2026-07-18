<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import ProgressRing from '~/components/ProgressRing.vue';
import { type RegisteredToast, useToasts } from '~/composables/useToasts';

const { pause, remainingRatio, remove, resume } = useToasts();

const props = defineProps<{
  toast: RegisteredToast;
}>();

let focused = false;
let hovered = false;
let frame: number | null = null;
const expanded = ref(false);
const remaining = ref(1);

function updateProgress(time: number) {
  remaining.value = remainingRatio(props.toast.id, time);
  frame = requestAnimationFrame(updateProgress);
}

onMounted(() => {
  frame = requestAnimationFrame(updateProgress);
});

onBeforeUnmount(() => {
  if (frame !== null) cancelAnimationFrame(frame);
});

function updateTimer() {
  if (expanded.value || focused || hovered) pause(props.toast.id);
  else resume(props.toast.id);
}

function toggleExpanded(event: MouseEvent) {
  expanded.value = !expanded.value;
  updateTimer();

  if (
    !expanded.value &&
    event.detail > 0 &&
    event.currentTarget instanceof HTMLElement
  )
    event.currentTarget.blur();
}

function setHovered(value: boolean) {
  hovered = value;
  updateTimer();
}

function focusIn() {
  focused = true;
  updateTimer();
}

function focusOut(event: FocusEvent) {
  if (
    event.currentTarget instanceof HTMLElement &&
    event.relatedTarget instanceof Node &&
    event.currentTarget.contains(event.relatedTarget)
  )
    return;

  focused = false;
  updateTimer();
}

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
    class="pointer-events-auto mx-auto flex max-w-full items-center gap-4 rounded-xl border border-stone-700 bg-black p-4 text-center text-xl shadow-2xl shadow-black/40 dark:border-stone-500"
    :class="colour(toast.type)"
    role="status"
    @pointerenter="setHovered(true)"
    @pointerleave="setHovered(false)"
    @focusin="focusIn"
    @focusout="focusOut"
  >
    <button
      type="button"
      class="min-w-0 flex-1 text-center"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <span
        class="block break-words"
        :class="{ 'overflow-hidden truncate text-ellipsis': !expanded }"
      >
        {{ toast.text }}
      </span>
    </button>
    <ProgressRing
      :value="remaining"
      hide-for-reduced-motion
      class="size-8 text-white"
    >
      <button
        type="button"
        class="flex size-full cursor-pointer select-none items-center justify-center rounded-full hover:bg-white/10"
        @click.stop="remove(toast.id)"
      >
        <Icon name="lucide:x" />
      </button>
    </ProgressRing>
  </div>
</template>
