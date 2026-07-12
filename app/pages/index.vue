<script lang="ts" setup>
import { navigateTo } from '#app';
import GameCard from "~/components/GameCard.vue";
import LanguageSelector from "~/components/LanguageSelector.vue";
import { useGame } from "~/composables/useGame";

const { games } = useGame();

if (games.length === 1) await navigateTo(`/${games[0]!.slug}`, { replace: true });
</script>

<template>
  <div class="flex flex-col justify-between">
    <div class="grid grid-cols-1 mx-auto w-80 gap-2">
      <GameCard
        v-for="game in games"
        :key="game.slug"
        :game="game"
      />
    </div>

    <LanguageSelector class="self-center"/>
  </div>
</template>
