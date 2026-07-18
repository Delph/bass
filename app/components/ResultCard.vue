<script lang="ts" setup>
import { computed } from 'vue';
import type { ArmourSet, BuildResult } from '~/solver/solver';
import { useSets } from '~/composables/useSets';
import SkillPill from '~/components/SkillPill.vue';
import { useIcons } from '~/composables/useIcons';
import { useLanguage } from '~/composables/useLanguage';
import { useGame } from '~/composables/useGame';
import { defence, effective, resistances, setSharePath } from '~/set';

const { addSet, hasSet } = useSets();
const { slug } = useGame();
const icons = useIcons();
const { formatNumber, translate } = useLanguage();

const props = defineProps<{
  set: BuildResult;
}>();
const def = computed(() => defence(Object.values(props.set.armour)));
const res = computed(() => resistances(Object.values(props.set.armour)));
const armourSet = computed<ArmourSet>(() => ({
  armour: {
    head: props.set.armour.head.id,
    body: props.set.armour.body.id,
    arms: props.set.armour.arms.id,
    waist: props.set.armour.waist.id,
    legs: props.set.armour.legs.id,
  },
  decorations: {
    armour: props.set.decorations.armour.map((d) => d.id),
    torso: props.set.decorations.torso.map((d) => d.id),
    weapon: props.set.decorations.weapon.map((d) => d.id),
  },
}));
const saved = computed(() => hasSet(armourSet.value));
const setPath = computed(() =>
  slug.value ? setSharePath(slug.value, armourSet.value) : '/',
);

const decorations = computed(() => {
  const grouped = new Map<string, { slug: string; count: number }>();

  for (const collection of Object.values(props.set.decorations)) {
    for (const decoration of collection) {
      const group = grouped.get(decoration.slug);

      if (group) ++group.count;
      else grouped.set(decoration.slug, { slug: decoration.slug, count: 1 });
    }
  }

  return [...grouped.values()];
});

function save() {
  addSet(armourSet.value);
}
</script>

<template>
  <div
    class="bg-stone-100 dark:bg-stone-800 rounded-xl p-2 flex flex-wrap gap-2"
  >
    <div class="min-w-0 flex-1">
      <div v-for="(piece, slot) in set.armour" class="flex gap-2 items-center">
        <img :src="icons.armour(slot)" class="w-4 shrink-0" />
        <span class="truncate">{{ translate(`armour-${slot}-${piece.slug}`) }}</span>
      </div>
    </div>
    <div
      class="grid shrink-0 grid-cols-[1rem_auto_auto] items-center gap-x-2 font-mono"
    >
      <span></span>
      <span
        class="text-right text-[0.65rem] uppercase text-stone-500 dark:text-stone-400"
      >
        {{ translate('set-stat-raw') }}
      </span>
      <span
        class="text-right text-[0.65rem] uppercase text-stone-500 dark:text-stone-400"
      >
        {{ translate('set-stat-effective') }}
      </span>
      <img :src="icons.defence()" class="w-4" />
      <span class="text-right">{{ formatNumber(def) }}</span>
      <span class="text-right">{{ formatNumber(effective(def)) }}</span>
      <template v-for="(resistance, element) in res" :key="element">
        <template v-if="resistance !== undefined">
          <img :src="icons.element(element)" class="w-4" />
          <span class="text-right">{{ formatNumber(resistance) }}</span>
          <span class="text-right">
            {{ formatNumber(effective(def, resistance)) }}
          </span>
        </template>
      </template>
    </div>
    <NuxtLink
      class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-200"
      :to="setPath"
      :title="translate('set-open')"
    >
      <span class="sr-only">{{ translate('set-open') }}</span>
      <Icon name="lucide:view" />
    </NuxtLink>
    <button
      type="button"
      class="flex size-8 shrink-0 items-center justify-center rounded-lg border text-stone-700 dark:text-stone-200"
      :class="
        saved
          ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100'
          : 'border-stone-300 dark:border-stone-700'
      "
      @click="save"
    >
      <Icon :name="saved ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'" />
    </button>
    <div class="w-full flex flex-wrap gap-1">
      <SkillPill
        v-for="(points, skill) in set.skills"
        :skill="skill"
        :points="points"
      />
    </div>
    <div v-if="decorations.length > 0" class="flex w-full flex-wrap gap-1">
      <div
        v-for="decoration in decorations"
        :key="decoration.slug"
        class="rounded-full bg-stone-200 px-2 py-0.5 text-sm text-stone-800 dark:bg-stone-700 dark:text-stone-100"
      >
        {{ translate(`decoration-${decoration.slug}`) }}
        <span
          v-if="decoration.count > 1"
          class="text-xs text-stone-600 dark:text-stone-300"
        >
          {{ translate('set-decoration-quantity', { formatted: formatNumber(decoration.count) }) }}
        </span>
      </div>
    </div>
  </div>
</template>
