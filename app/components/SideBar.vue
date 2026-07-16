<script lang="ts" setup>
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
  open: boolean;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const tabs = ['home', 'search', 'sets', 'history'] as const;
type Tab = (typeof tabs)[number];

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
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-stone-200 bg-stone-100 p-4 text-stone-950 shadow-xl transition-transform dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 md:static md:z-auto md:w-auto md:translate-x-0 md:shadow-none"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div>
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-bold">
          {{ translate(`game-${game.slug}-title-short`) }}
        </h2>
        <button
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
      <NuxtLink to="/settings">
        {{ translate('settings') }}
      </NuxtLink>
    </div>
  </aside>
</template>
