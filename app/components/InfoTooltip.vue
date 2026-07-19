<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

defineProps<{
  text: string;
}>();

const trigger = ref<HTMLButtonElement | null>(null);
const tooltip = ref<HTMLElement | null>(null);
let hovered = false;
let pinned = false;
let visibilityObserver: IntersectionObserver | null = null;

function isOpen() {
  return tooltip.value?.matches(':popover-open') ?? false;
}

function updatePosition() {
  if (!trigger.value || !tooltip.value || !isOpen()) return;

  const gap = 8;
  const triggerRect = trigger.value.getBoundingClientRect();
  const tooltipRect = tooltip.value.getBoundingClientRect();
  const preferredLeft =
    triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
  const maxLeft = Math.max(gap, window.innerWidth - tooltipRect.width - gap);
  const left = Math.min(Math.max(preferredLeft, gap), maxLeft);
  let top = triggerRect.top - tooltipRect.height - gap;

  if (top < gap) top = triggerRect.bottom + gap;
  top = Math.min(top, window.innerHeight - tooltipRect.height - gap);

  tooltip.value.style.left = `${left}px`;
  tooltip.value.style.top = `${Math.max(gap, top)}px`;
}

function startPositioning() {
  updatePosition();
  visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry || entry.intersectionRatio === 1) return;

      hovered = false;
      pinned = false;
      if (isOpen()) tooltip.value?.hidePopover();
    },
    { threshold: 1 },
  );
  if (trigger.value) visibilityObserver.observe(trigger.value);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
}

function stopPositioning() {
  visibilityObserver?.disconnect();
  visibilityObserver = null;
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
}

function sync() {
  if (!tooltip.value) return;

  if (hovered || pinned) {
    if (!isOpen()) tooltip.value.showPopover();
    updatePosition();
  } else if (isOpen()) tooltip.value.hidePopover();
}

function togglePinned() {
  pinned = !pinned;
  sync();
}

function onToggle() {
  if (isOpen()) startPositioning();
  else {
    pinned = false;
    stopPositioning();
  }
}

function onMouseenter() {
  hovered = true;
  sync();
}

function onMouseleave() {
  hovered = false;
  sync();
}

function blur() {
  if (!hovered) pinned = false;
  sync();
}

onBeforeUnmount(stopPositioning);
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <button
      ref="trigger"
      type="button"
      class="flex size-8 shrink-0 items-center justify-center rounded-full text-xl opacity-60 hover:bg-black/10 hover:opacity-100 focus-visible:opacity-100 dark:hover:bg-white/10"
      @click.stop="togglePinned"
      @keydown.stop
      @blur="blur"
    >
      <Icon name="lucide:info" />
    </button>
    <span
      ref="tooltip"
      popover="auto"
      class="fixed inset-auto m-0 w-max max-w-[calc(100vw-1rem)] whitespace-normal rounded-lg border-0 bg-stone-950 px-3 py-2 text-left text-xs font-normal text-white shadow-lg dark:bg-stone-100 dark:text-stone-950 sm:max-w-72"
      @toggle="onToggle"
    >
      {{ text }}
    </span>
  </span>
</template>
