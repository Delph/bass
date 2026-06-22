<script lang="ts" setup>
import { definePageMeta } from "#imports";
import { computed, ref, watch } from "vue";
import { useGame } from "~/composables/useGame";
import { useQuery } from "~/composables/useQuery";
import { useTranslation } from "~/composables/useTranslation";
import { formatSkillPoints, getSkillCategoryIcon, getSkillLabel, getSkillOptions } from "~/skills";
import type { FieldValue } from "~/components/Field.vue";

import SkillCard from "~/components/SkillCard.vue";
import Toggle from "~/components/Toggle.vue";
import Field from "~/components/Field.vue";
import Label from "~/components/Label.vue";

definePageMeta({
  scroll: false,
});

const { data, game } = useGame();
const { query, hasSkill, addSkill, removeSkill } = useQuery();
const { translate } = useTranslation();
const showNegativeSkills = ref(false);

const searchPath = computed(() => game.value ? `/${game.value.slug}/search` : '/');
const selectedSkills = computed(() => {
  return Object.entries(query.value.skills).map(([skill, points]) => ({
    skill,
    points,
  }));
});

const categories = computed(() => {
  if (!data.value)
    return [];

  const set = new Set<string>();
  for (const skill of data.value.skills) {
    for (const category of skill.categories)
      set.add(category);
  }

  return [...set].toSorted();
});

const filter = ref<{
  search: string;
  categories: string[];
}>({
  search: "",
  categories: [],
});

watch(categories, (nextCategories) => {
  if (filter.value.categories.length === 0)
    filter.value.categories = [...nextCategories];
}, { immediate: true });

function toggleCategory(category: string) {
  if (filter.value.categories.includes(category)) {
    filter.value.categories = filter.value.categories.filter((selected) => selected !== category);
    return;
  }

  filter.value.categories.push(category);
}

const filteredSkillCards = computed(() => {
  if (!data.value)
    return [];

  const term = filter.value.search.trim().toLocaleLowerCase();

  return data.value.skills
    .filter((skill) => {
      const matchesQuery = term.length === 0
        || skill.name.toLocaleLowerCase().includes(term)
        || Object.values(skill.skills).some((label) => label !== undefined && label.toLocaleLowerCase().includes(term));

      return matchesQuery && skill.categories.some((category) => filter.value.categories.includes(category));
    })
    .map((skill) => ({
      options: getSkillOptions(skill, showNegativeSkills.value),
      skill,
    }))
    .filter((card) => card.options.length > 0);
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <section class="shrink-0 space-y-2">
      <Field
        type="text"
        :name="translate('search-skill-filter')"
        :placeholder="translate('search-skill-filter')"
        :model-value="filter.search"
        @change="(value: FieldValue) => filter.search = String(value)"
      />

      <div class="flex items-center justify-between gap-2 text-sm text-stone-600 dark:text-stone-400">
        <p>{{ translate("search-skills-matching-count", { count: filteredSkillCards.length }) }}</p>
        <div class="flex items-center gap-2 text-stone-700 dark:text-stone-300">
          <span>{{ translate("search-skills-show-negative") }}</span>
          <Toggle v-model="showNegativeSkills" />
        </div>
      </div>

      <div
        v-if="categories.length > 0"
        class="flex gap-1 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
      >
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="flex shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-1 text-sm transition"
          :class="filter.categories.includes(category) ? 'border-emerald-700 bg-emerald-100 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-100' : 'border-stone-200 bg-stone-100 text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400'"
          @click="toggleCategory(category)"
        >
          <Icon :name="getSkillCategoryIcon(category)" />
          {{ category }}
        </button>
      </div>

      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900 dark:bg-emerald-950/60">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
          {{ translate("search-skills-selected", { count: selectedSkills.length }) }}
        </p>
        <p
          v-if="selectedSkills.length === 0"
          class="text-sm text-emerald-800 dark:text-emerald-200"
        >
          {{ translate("search-skills-empty") }}
        </p>
        <div
          v-else
          class="flex gap-2 overflow-x-auto pb-1"
        >
          <button
            v-for="selectedSkill in selectedSkills"
            :key="`${selectedSkill.skill}:${selectedSkill.points}`"
            type="button"
            class="flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-emerald-950 shadow-sm dark:bg-stone-900 dark:text-emerald-100"
            @click="removeSkill(selectedSkill.skill)"
          >
            <span>{{ getSkillLabel(selectedSkill, data?.skills) }}</span>
            <span class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
              {{ formatSkillPoints(selectedSkill.points) }}
            </span>
            <Icon
              name="lucide:x"
              class="size-3"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
      <SkillCard
        v-for="card in filteredSkillCards"
        :key="card.skill.name"
        :card="card"
      />

      <p
        v-if="filteredSkillCards.length === 0"
        class="rounded-2xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400"
      >
        {{ translate("search-skills-no-results") }}
      </p>
    </section>

    <footer class="shrink-0 border-t border-stone-200 bg-stone-50 pt-3 dark:border-stone-800 dark:bg-stone-950">
      <NuxtLink
        :to="searchPath"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
      >
        {{ translate('search-skills-continue') }}
      </NuxtLink>
    </footer>
  </div>
</template>
