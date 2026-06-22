<script lang="ts" setup>
import GameCard from "~/components/GameCard.vue";
import LanguageSelector from "~/components/LanguageSelector.vue";
import { useGame } from "~/composables/useGame";

const { games } = useGame();
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
