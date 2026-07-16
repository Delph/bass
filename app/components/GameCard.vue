<script lang="ts" setup>
import type { Game } from "~/game/types";

import { useLanguage } from '~/composables/useLanguage';

const { translate } = useLanguage();

const props = defineProps<{
  game: Game;
}>();
</script>

<template>
  <NuxtLink
    class="flex h-20 items-center justify-center rounded-xl bg-emerald-700 text-center text-2xl font-bold text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
    :to="`/${game.slug}`"
  >
    {{ translate(`game-${game.slug}-title-full`) }}
  </NuxtLink>
</template>
