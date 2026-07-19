<script lang="ts" setup>
import { useSets } from '~/composables/useSets';
import { useLanguage } from '~/composables/useLanguage';
import SetCard from '~/components/SetCard.vue';

const { translate } = useLanguage();
const { sets } = useSets();
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate('navigation-tab-sets') }}
  </h2>
  <div
    v-if="sets.length"
    class="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start"
  >
    <SetCard v-for="set in sets" :key="set.id" :set="set" />
  </div>
  <div v-else>
    {{ translate('sets-no-sets') }}
  </div>
</template>
