<script lang="ts" setup>
import type { SkillDefinition } from "~/game/types";
import type { SkillCardDefinition, SkillOption } from "~/skills";

import { useQuery } from "~/composables/useQuery";
import { useLanguage } from '~/composables/useLanguage';
import {
  formatSkillPoints,
  getSkillCategoryIcon,
  getSkillEffectKey,
} from "~/skills";

const { query, hasSkill, addSkill, removeSkill } = useQuery();
const { formatNumber, translate } = useLanguage();

defineProps<{
  card: SkillCardDefinition;
}>();

function hasSelectedSkillGroup(skill: SkillDefinition) {
  return query.value.skills[skill.slug] !== undefined;
}

function optionClass(option: SkillOption) {
  if (isSelected(option)) {
    return option.points < 0
      ? "border-rose-600 bg-rose-600 text-white dark:border-rose-400 dark:bg-rose-400 dark:text-stone-950"
      : "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-stone-950";
  }

  if (option.points < 0)
    return "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200 dark:hover:border-rose-700";

  return "border-stone-200 bg-stone-50 text-stone-900 hover:border-emerald-300 hover:bg-emerald-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950";
}

function isSelected(option: SkillOption) {
  return hasSkill(option.requirement);
}


function toggleSkill(option: SkillOption) {
  if (isSelected(option))
    removeSkill(option.requirement.skill);
  else
    addSkill(option.requirement);
}


function pointsClass(option: SkillOption) {
  if (isSelected(option))
    return "bg-white/20 text-current";

  if (option.points < 0)
    return "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200";

  return "bg-white text-stone-600 dark:bg-stone-900 dark:text-stone-300";
}
</script>

<template>
  <article
    class="rounded-2xl border bg-white p-2 shadow-sm dark:bg-stone-900"
    :class="hasSelectedSkillGroup(card.skill) ? 'border-emerald-300 ring-2 ring-emerald-100 dark:border-emerald-700 dark:ring-emerald-950' : 'border-stone-200 dark:border-stone-700'"
  >
    <template v-if="card.options.length === 1">
      <button
        v-for="option in card.options"
        :key="option.points"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition"
        :class="optionClass(option)"
        @click="toggleSkill(option)"
      >
        <span class="min-w-0 flex-1">
          <span class="block truncate font-semibold">
            {{ translate(getSkillEffectKey(option.requirement.skill, option.points)) }}
          </span>
          <span class="block truncate text-xs opacity-75">{{ translate(`skill-${card.skill.slug}`) }}</span>
        </span>
        <span
          class="rounded-full px-2 py-1 text-xs font-medium"
          :class="pointsClass(option)"
        >
          {{ formatSkillPoints(option.points) }}
        </span>
        <span class="flex shrink-0 gap-1 opacity-60">
          <Icon
            v-for="category in card.skill.categories"
            :key="category"
            :name="getSkillCategoryIcon(category)"
            :title="translate(`category-${category}`)"
          />
        </span>
      </button>
    </template>

    <template v-else>
      <div class="mb-2 flex items-center justify-between gap-3 px-1">
        <div class="min-w-0">
          <p class="truncate font-semibold text-stone-900 dark:text-stone-100">
            {{ translate(`skill-${card.skill.slug}`) }}
          </p>
          <p class="text-xs text-stone-500 dark:text-stone-400">
            {{ translate("search-skill-levels-count", { count: card.options.length, formatted: formatNumber(card.options.length) }) }}
          </p>
        </div>
        <div class="flex shrink-0 gap-1 text-stone-500 dark:text-stone-400">
          <Icon
            v-for="category in card.skill.categories"
            :key="category"
            :name="getSkillCategoryIcon(category)"
            :title="translate(`category-${category}`)"
          />
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="option in card.options"
          :key="option.points"
          type="button"
          class="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition"
          :class="optionClass(option)"
          @click="toggleSkill(option)"
        >
          <span class="min-w-0 truncate font-medium">
            {{ translate(getSkillEffectKey(option.requirement.skill, option.points)) }}
          </span>
          <span
            class="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
            :class="pointsClass(option)"
          >
              {{ formatSkillPoints(option.points) }}
          </span>
        </button>
      </div>
    </template>
  </article>

</template>
