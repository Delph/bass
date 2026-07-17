<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useGame } from "~/composables/useGame";
import { useTheme } from "~/composables/useTheme";
import { useLanguage } from '~/composables/useLanguage';
import { useToasts } from '~/composables/useToasts';
import '~/persistence/register';

import SideBar from "~/components/SideBar.vue";
import Progress from "~/components/Progress.vue";
import SearchStatus from '~/components/SearchStatus.vue';
import Toast from '~/components/Toast.vue';

const {
  ready,
  translate,
} = useLanguage();
const {
  data,
  game,
  loading,
  retry,
  status,
} = useGame();
const route = useRoute();
const router = useRouter();
const { toasts } = useToasts();

useTheme();

const menu = ref(false);
let desktopMedia: MediaQueryList | null = null;

function closeMenuAtDesktop(event: MediaQueryListEvent) {
  if (event.matches) menu.value = false;
}

onMounted(() => {
  desktopMedia = window.matchMedia('(min-width: 48rem)');
  desktopMedia.addEventListener('change', closeMenuAtDesktop);
});

onBeforeUnmount(() => {
  desktopMedia?.removeEventListener('change', closeMenuAtDesktop);
});

watch(
  () => route.fullPath,
  () => {
    menu.value = false;
  },
);

const hasBack = computed(() => {
  const currentGame = game.value;
  const parts = route.path.split('/').filter(Boolean);

  if (parts.length === 0) return false;

  if (!currentGame || parts[0] !== currentGame.slug) return true;

  return parts.length > 2;
});

function back() {
  router.back();
}

const scroll = computed(() => route.meta.scroll !== false);
</script>

<template>
  <div
    v-show="ready"
    class="flex h-dvh flex-col overflow-hidden bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-100"
  >
    <header
      class="grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 bg-emerald-700 px-4 py-2 text-center text-white dark:bg-emerald-900"
      :inert="menu"
    >
      <div class="flex items-center gap-1 justify-self-start">
        <button
          v-if="game"
          class="rounded p-1 hover:bg-emerald-800 dark:hover:bg-emerald-800 md:hidden"
          type="button"
          :aria-label="translate('game-menu-open')"
          :aria-expanded="menu"
          aria-controls="game-menu"
          @click="menu = true"
        >
          <Icon name="lucide:menu" />
        </button>
        <button
          v-if="hasBack"
          type="button"
          class="rounded p-1 hover:bg-emerald-800 dark:hover:bg-emerald-800"
          :aria-label="translate('navigation-back')"
          @click="back"
        >
          <Icon name="lucide:arrow-left" />
        </button>
      </div>
      <NuxtLink to="/">
        <h1>{{ translate("bass-title-full") }}</h1>
      </NuxtLink>
      <div class="justify-self-end">
        <SearchStatus />
      </div>
    </header>
    <div
      class="flex min-h-0 flex-1 overflow-hidden"
      :class="game ? 'md:grid md:grid-cols-[12rem_1fr]' : ''"
    >
      <div
        v-if="menu"
        class="fixed inset-0 z-40 bg-stone-950/60 md:hidden"
        aria-hidden="true"
        @click="menu = false"
      ></div>
      <SideBar
        v-if="game"
        :game="game"
        :open="menu"
        @close="menu = false"
      />
      <main
        class="flex min-h-0 flex-1 flex-col p-4 md:pt-4"
        :class="scroll ? 'overflow-y-auto' : 'overflow-hidden'"
        :inert="menu"
      >
        <div
          class="flex min-h-0 flex-1 flex-col gap-4"
        >
          <NuxtPage v-slot="{ Component }">
            <component
              :is="Component"
              v-if="ready && (!game || data)"
            />
          </NuxtPage>
        </div>
        <div
          v-if="ready && game && !data && status !== 'error'"
          class="flex flex-col gap-2 text-center"
        >
          <p>{{ translate('common-loading') }}</p>
          <Progress
            :value="loading.done"
            :max="loading.total"
          />
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ loading.done }} / {{ loading.total }}
          </p>
        </div>
        <div
          v-if="ready && game && status === 'error'"
          class="m-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-rose-300 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950"
          role="alert"
        >
          <Icon name="lucide:cloud-off" class="text-4xl text-rose-700 dark:text-rose-300" />
          <div class="flex flex-col gap-1">
            <h2 class="text-xl font-bold">
              {{ translate('game-data-error-title') }}
            </h2>
            <p class="text-stone-700 dark:text-stone-300">
              {{ translate('game-data-error-message') }}
            </p>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
            @click="retry"
          >
            <Icon name="lucide:refresh-cw" />
            {{ translate('common-retry') }}
          </button>
        </div>
      </main>
    </div>
    <Teleport to="body">
      <div
        class="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:bottom-6"
        :inert="menu"
        aria-live="polite"
        aria-relevant="additions"
      >
        <TransitionGroup
          tag="div"
          class="flex flex-col gap-3"
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
          <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>
