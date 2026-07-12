<script lang="ts" setup>
import { computed } from 'vue';
import { formatSkillPoints, getEffect, getSkillEffectKey } from '~/skills';

import { useGame } from '~/composables/useGame';
import { useTranslation } from '~/composables/useTranslation';
import type { EffectDefinition } from '~/game/types';

const { data } = useGame();
const { translate } = useTranslation();

const props = defineProps<{
  skill: string;
  points: number;
}>();

type SkillEffect = {
  skill: string;
  effect: EffectDefinition[string];
  points: number;
};

const activated = computed((): SkillEffect | null => {
  if (data.value === undefined) return null;
  return getEffect(data.value.skills, props.skill, props.points);
});
</script>

<template>
  <span
    v-if="activated"
    class="inline-flex gap-2 whitespace-nowrap rounded-full px-3 py-1"
    :class="
      activated.points < 0
        ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100'
        : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
    "
  >
    <span>{{ translate(getSkillEffectKey(activated.skill, activated.points)) }}</span>
    <span
      :class="
        activated.points < 0
          ? 'text-rose-700 dark:text-rose-300'
          : 'text-emerald-700 dark:text-emerald-300'
      "
      >{{ formatSkillPoints(activated.points) }}</span
    >
  </span>
</template>
