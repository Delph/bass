<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { Game } from '~/game/types';

import { useLanguage } from '~/composables/useLanguage';
import LanguageSelector from '~/components/LanguageSelector.vue';
import Toggle from '~/components/Toggle.vue';
import { useTheme } from '~/composables/useTheme';

const { translate } = useLanguage();
const { theme, set } = useTheme();
const route = useRoute();

const props = defineProps<{
  game: Game;
  notice: boolean;
  open: boolean;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const tabs = ['home', 'search', 'sets', 'history'] as const;
type Tab = (typeof tabs)[number];

const sidebar = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

function restoreFocus() {
  if (returnFocus?.isConnected) returnFocus.focus();
  returnFocus = null;
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      await nextTick();
      closeButton.value?.focus();
    } else {
      restoreFocus();
    }
  },
);

onBeforeUnmount(restoreFocus);

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }

  if (event.key !== 'Tab' || !sidebar.value) return;

  const focusable = [
    ...sidebar.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0);

  if (focusable.length === 0) {
    event.preventDefault();
    sidebar.value.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  const active = document.activeElement;

  if (event.shiftKey && (active === first || !sidebar.value.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function path(tab: Tab) {
  if (tab === 'home') return `/${props.game.slug}`;

  return `/${props.game.slug}/${tab}`;
}

function resultsPath() {
  return `/${props.game.slug}/search/results`;
}

function active(tab: Tab) {
  if (tab === 'search')
    return (
      route.path === path('search') ||
      route.path === `/${props.game.slug}/search/skills`
    );

  return route.path === path(tab);
}

function label(tab: Tab) {
  return translate(`navigation-tab-${tab}`);
}
</script>

<template>
  <aside
    id="game-menu"
    ref="sidebar"
    tabindex="-1"
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-stone-200 bg-stone-100 p-4 text-stone-950 shadow-xl transition-[transform,visibility] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 md:static md:z-auto md:w-auto md:translate-x-0 md:shadow-none"
    :class="
      open
        ? 'visible translate-x-0'
        : 'invisible pointer-events-none -translate-x-full md:visible md:pointer-events-auto'
    "
    :role="open ? 'dialog' : undefined"
    :aria-modal="open ? 'true' : undefined"
    :aria-labelledby="open ? 'game-menu-title' : undefined"
    @keydown="onKeydown"
  >
    <div>
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 id="game-menu-title" class="text-lg font-bold">
          {{ translate(`game-${game.slug}-title-short`) }}
        </h2>
        <button
          ref="closeButton"
          class="rounded px-2 py-1 text-2xl leading-none hover:bg-stone-200 dark:hover:bg-stone-800 md:hidden"
          type="button"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>
      <nav class="flex flex-col gap-2">
        <template v-for="tab in tabs" :key="tab">
          <NuxtLink
            class="rounded px-3 py-2 font-semibold"
            :class="
              active(tab)
                ? 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950'
                : 'text-stone-700 hover:bg-stone-200 dark:text-stone-200 dark:hover:bg-stone-800'
            "
            :to="path(tab)"
          >
            {{ label(tab) }}
          </NuxtLink>
          <NuxtLink
            v-if="tab === 'search'"
            class="ml-4 rounded px-3 py-1.5 text-sm font-semibold"
            :class="
              route.path === resultsPath()
                ? 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950'
                : 'text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800'
            "
            :to="resultsPath()"
            >
              {{ translate('navigation-tab-results') }}
            </NuxtLink>
          </template>
          <NuxtLink
            class="flex items-center gap-2 rounded px-3 py-2 font-semibold"
            :class="
              route.path === '/settings'
                ? 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950'
                : 'text-stone-700 hover:bg-stone-200 dark:text-stone-200 dark:hover:bg-stone-800'
            "
            to="/settings"
          >
            {{ translate('settings') }}
            <span
              v-if="notice"
              class="size-2 rounded-full bg-amber-500"
              aria-hidden="true"
            />
          </NuxtLink>
        </nav>
      </div>
    <div
      class="flex flex-col gap-3 border-t border-stone-200 pt-4 dark:border-stone-800"
    >
      <div
        class="flex items-center justify-between gap-3 rounded-lg bg-stone-200 px-3 py-2 text-sm font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-100"
      >
        <button
          @click="() => set('system')"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-xl"
          :class="{
            'bg-emerald-100': theme === 'system',
            'dark:bg-emerald-700': theme === 'system',
          }"
        >
          <Icon name="lucide:computer" />
        </button>
        <button
          @click="() => set('dark')"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-xl"
          :class="{
            'bg-emerald-100': theme === 'dark',
            'dark:bg-emerald-700': theme === 'dark',
          }"
        >
          <Icon name="lucide:moon" />
        </button>
        <button
          @click="() => set('light')"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-xl"
          :class="{
            'bg-emerald-100': theme === 'light',
            'dark:bg-emerald-700': theme === 'light',
          }"
        >
          <Icon name="lucide:sun" />
        </button>
      </div>
      <LanguageSelector class="self-center" />
    </div>
  </aside>
</template>
