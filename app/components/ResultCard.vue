<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { BuildResult } from '~/solver/solver';
import { useSets } from '~/composables/useSets';
import { formatNumber } from '~/format';
import SkillPill from '~/components/SkillPill.vue';
import { useIcons } from '~/composables/useIcons';
import { defence, effective, resistances } from '~/set';

const { addSet } = useSets();
const icons = useIcons();

const props = defineProps<{
  set: BuildResult;
}>();
const saved = ref(false);

const def = computed(() => defence(Object.values(props.set.armour)));
const res = computed(() => resistances(Object.values(props.set.armour)));

const decorations = computed(() => {
  const grouped = new Map<string, { name: string; count: number }>();

  for (const collection of Object.values(props.set.decorations)) {
    for (const decoration of collection) {
      const group = grouped.get(decoration.name);

      if (group) ++group.count;
      else grouped.set(decoration.name, { name: decoration.name, count: 1 });
    }
  }

  return [...grouped.values()];
});

function save() {
  addSet({
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
  });
  saved.value = true;
}
</script>

<template>
  <div
    class="bg-stone-100 dark:bg-stone-800 rounded-xl p-2 flex flex-wrap gap-2"
  >
    <div class="min-w-0 flex-1">
      <div v-for="(piece, slot) in set.armour" class="flex gap-2 items-center">
        <img :src="icons.armour(slot)" class="w-4 shrink-0" />
        <span class="truncate">{{ piece.name }}</span>
      </div>
    </div>
    <div class="shrink-0">
      <div
        class="flex gap-2 items-center font-mono justify-between"
        :title="formatNumber(effective(def))"
      >
        <img :src="icons.defence()" class="w-4" /> {{ formatNumber(def) }}
      </div>
      <template v-for="(resistance, element) in res">
        <div
          v-if="resistance !== undefined"
          class="flex gap-2 items-center font-mono justify-between"
          :title="formatNumber(effective(def, resistance))"
        >
          <img :src="icons.element(element)" class="w-4" />
          {{ formatNumber(resistance) }}
        </div>
      </template>
    </div>
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
        :key="decoration.name"
        class="rounded-full bg-stone-200 px-2 py-0.5 text-sm text-stone-800 dark:bg-stone-700 dark:text-stone-100"
      >
        {{ decoration.name }}
        <span
          v-if="decoration.count > 1"
          class="text-xs text-stone-600 dark:text-stone-300"
        >
          x{{ decoration.count }}
        </span>
      </div>
    </div>
  </div>
</template>
