<script lang="ts" setup>
import { computed } from 'vue';
import type { ArmourSet, BuildResult } from '~/solver/solver';
import { useGame } from '~/composables/useGame';
import { useIcons } from '~/composables/useIcons';
import { useLanguage } from '~/composables/useLanguage';
import { useSets } from '~/composables/useSets';
import SkillPill from '~/components/SkillPill.vue';
import { defence, effective, resistances, setSharePath } from '~/set';

const props = defineProps<{
  sets: BuildResult[];
}>();

const { game, slug } = useGame();
const { addSet, hasSet } = useSets();
const { formatNumber, translate } = useLanguage();
const icons = useIcons();

const rows = computed(() =>
  props.sets.map((set) => {
    const armourSet: ArmourSet = {
      armour: {
        head: set.armour.head.id,
        body: set.armour.body.id,
        arms: set.armour.arms.id,
        waist: set.armour.waist.id,
        legs: set.armour.legs.id,
      },
      decorations: {
        armour: set.decorations.armour.map((decoration) => decoration.id),
        torso: set.decorations.torso.map((decoration) => decoration.id),
        weapon: set.decorations.weapon.map((decoration) => decoration.id),
      },
    };
    const groupedDecorations = new Map<
      string,
      { slug: string; count: number }
    >();

    for (const collection of Object.values(set.decorations)) {
      for (const decoration of collection) {
        const grouped = groupedDecorations.get(decoration.slug);

        if (grouped) ++grouped.count;
        else
          groupedDecorations.set(decoration.slug, {
            slug: decoration.slug,
            count: 1,
          });
      }
    }

    return {
      armourSet,
      decorations: [...groupedDecorations.values()],
      defence: defence(Object.values(set.armour)),
      path: slug.value ? setSharePath(slug.value, armourSet) : '/',
      resistances: resistances(Object.values(set.armour)),
      set,
    };
  }),
);
</script>

<template>
  <table class="w-full table-fixed border-separate border-spacing-0 text-sm">
    <caption class="sr-only">
      {{
        translate('navigation-tab-results')
      }}
    </caption>
    <colgroup>
      <col class="w-[25%]" />
      <col class="w-[12%]" />
      <col class="w-[8%]" />
      <col class="w-[22%]" />
      <col class="w-[26%]" />
      <col class="w-[7%]" />
    </colgroup>
    <thead class="sticky top-0 z-10 bg-stone-50 dark:bg-stone-950">
      <tr>
        <th
          class="border-b border-stone-300 p-2 text-left dark:border-stone-700"
        >
          {{ translate('set-section-armour') }}
        </th>
        <th
          class="border-b border-stone-300 p-2 text-right dark:border-stone-700"
        >
          <span class="flex items-center justify-end gap-1">
            <img :src="icons.defence()" class="w-4" alt="" />
            {{ translate('set-stat-raw') }}
          </span>
        </th>
        <th
          class="border-b border-stone-300 p-2 text-right dark:border-stone-700"
        >
          {{ translate('set-stat-effective') }}
        </th>
        <th
          class="border-b border-stone-300 p-2 text-left dark:border-stone-700"
        >
          {{ translate('set-section-skills') }}
        </th>
        <th
          class="border-b border-stone-300 p-2 text-left dark:border-stone-700"
        >
          {{ translate('set-section-decorations') }}
        </th>
        <th class="border-b border-stone-300 p-2">
          <span class="sr-only">{{ translate('set-open') }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.path" class="align-top">
        <td class="border-b border-stone-200 p-2 dark:border-stone-800">
          <div
            v-for="(piece, slot) in row.set.armour"
            :key="slot"
            class="flex items-center gap-2"
          >
            <img :src="icons.armour(slot)" class="w-4 shrink-0" alt="" />
            <span class="truncate">
              {{ translate(`armour-${slot}-${piece.slug}`) }}
            </span>
          </div>
        </td>
        <td
          class="border-b border-stone-200 p-2 font-mono dark:border-stone-800"
        >
          <div class="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
            <img
              :src="icons.defence()"
              class="h-5 w-4 object-contain"
              alt=""
              :title="translate('set-section-defence')"
            />
            <span class="h-5 text-right">{{ formatNumber(row.defence) }}</span>
            <template v-for="element in game!.elements" :key="element">
              <img
                :src="icons.element(element)"
                class="h-5 w-4 object-contain"
                alt=""
                :title="translate(`result-sort-${element}`)"
              />
              <span class="h-5 text-right">
                {{ formatNumber(row.resistances[element]!) }}
              </span>
            </template>
          </div>
        </td>
        <td
          class="border-b border-stone-200 p-2 text-right font-mono font-semibold dark:border-stone-800"
        >
          <span class="block h-5">{{
            formatNumber(effective(row.defence))
          }}</span>
          <span
            v-for="element in game!.elements"
            :key="element"
            class="block h-5"
          >
            {{
              formatNumber(effective(row.defence, row.resistances[element]!))
            }}
          </span>
        </td>
        <td class="border-b border-stone-200 p-2 dark:border-stone-800">
          <div class="flex flex-wrap gap-1">
            <SkillPill
              v-for="(points, skill) in row.set.skills"
              :key="skill"
              :skill="skill"
              :points="points"
            />
          </div>
        </td>
        <td class="border-b border-stone-200 p-2 dark:border-stone-800">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="decoration in row.decorations"
              :key="decoration.slug"
              class="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-800 dark:bg-stone-700 dark:text-stone-100"
            >
              {{ translate(`decoration-${decoration.slug}`) }}
              <span v-if="decoration.count > 1">
                {{
                  translate('set-decoration-quantity', {
                    formatted: formatNumber(decoration.count),
                  })
                }}
              </span>
            </span>
          </div>
        </td>
        <td class="border-b border-stone-200 p-2 dark:border-stone-800">
          <div class="flex flex-col items-center gap-2">
            <NuxtLink
              class="flex size-8 items-center justify-center rounded-lg border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-200"
              :to="row.path"
              :title="translate('set-open')"
            >
              <span class="sr-only">{{ translate('set-open') }}</span>
              <Icon name="lucide:view" />
            </NuxtLink>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg border text-stone-700 dark:text-stone-200"
              :class="
                hasSet(row.armourSet)
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100'
                  : 'border-stone-300 dark:border-stone-700'
              "
              :title="
                translate(hasSet(row.armourSet) ? 'set-saved' : 'set-save')
              "
              @click="addSet(row.armourSet)"
            >
              <span class="sr-only">
                {{
                  translate(hasSet(row.armourSet) ? 'set-saved' : 'set-save')
                }}
              </span>
              <Icon
                :name="
                  hasSet(row.armourSet)
                    ? 'lucide:bookmark-check'
                    : 'lucide:bookmark-plus'
                "
              />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
