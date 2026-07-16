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
  <template v-if="sets.length">
    <SetCard v-for="set in sets" :key="set.id" :set="set" />
  </template>
  <div v-else>
    {{ translate('sets-no-sets') }}
  </div>
</template>
