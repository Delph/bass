<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useGame } from "~/composables/useGame";
import { useTheme } from "~/composables/useTheme";
import { useTranslation } from "~/composables/useTranslation";

import SideBar from "~/components/SideBar.vue";
import Progress from "~/components/Progress.vue";

const {
  ready,
  translate,
} = useTranslation();
const {
  data,
  game,
  games,
  loading,
  slug,
} = useGame();
const route = useRoute();
const router = useRouter();

useTheme();

watch(
  () => slug.value,
  (currentSlug) => {
    if (currentSlug || games.length !== 1)
      return;

    void router.replace(`/${games[0]!.slug}`);
  },
  { immediate: true },
);

const menu = ref(false);

const backPath = computed(() => {
  const currentGame = game.value;
  const parts = route.path.split('/').filter(Boolean);

  if (!currentGame || parts[0] !== currentGame.slug || parts.length <= 2)
    return '';

  return `/${parts.slice(0, -1).join('/')}`;
});

const scroll = computed(() => route.meta.scroll !== false);
</script>

<template>
  <div
    v-if="ready"
    class="flex h-dvh flex-col bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-100"
  >
    <header class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 bg-emerald-700 px-4 py-2 text-center text-white dark:bg-emerald-900">
      <div class="flex items-center gap-1 justify-self-start">
        <button
          v-if="game"
          class="rounded p-1 hover:bg-emerald-800 dark:hover:bg-emerald-800"
          type="button"
          :aria-label="translate('game-menu-open')"
          @click="menu = true"
        >
          <Icon name="lucide:menu" />
        </button>
        <NuxtLink
          v-if="backPath"
          :to="backPath"
          class="rounded p-1 hover:bg-emerald-800 dark:hover:bg-emerald-800"
          :aria-label="translate('navigation-back')"
        >
          <Icon name="lucide:arrow-left" />
        </NuxtLink>
      </div>
      <NuxtLink to="/">
        <h1>{{ translate("bass-title-full") }}</h1>
      </NuxtLink>
      <div />
    </header>
    <div
      class="flex min-h-0 flex-1"
      :class="game ? 'md:grid md:grid-cols-[12rem_1fr]' : ''"
    >
      <SideBar
        v-if="game"
        :game="game"
        :open="menu"
        @close="menu = false"
      />
      <main class="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:pt-4">
        <div
          v-if="!game || data"
          class="flex min-h-0 flex-1 flex-col gap-4"
          :class="scroll ? 'overflow-y-auto' : 'overflow-hidden'"
        >
          <NuxtPage />
        </div>
        <div
          v-else
          class="flex flex-col gap-2 text-center"
        >
          <p>Loading</p>
          <Progress
            :value="loading.done"
            :max="loading.total"
          />
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ loading.done }} / {{ loading.total }}
          </p>
        </div>
      </main>
    </div>
  </div>
</template>
