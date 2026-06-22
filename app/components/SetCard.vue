<script lang="ts" setup>
import type { BuildResult } from "~/solver/solver";
defineProps<{
  set: BuildResult;
}>();
</script>

<template>
  <div class="bg-stone-100 dark:bg-stone-800 rounded-xl p-2">
    <div v-for="(piece, slot) in set.armour">
      {{ piece.piece.name }}
    </div>
  </div>
</template>
