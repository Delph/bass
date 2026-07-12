<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import SetCard from '~/components/SetCard.vue';
import SkillPill from '~/components/SkillPill.vue';
import { useGame } from '~/composables/useGame';
import { useHistory, type HistoryEntry } from '~/composables/useHistory';
import { useQuery } from '~/composables/useQuery';
import { useSets } from '~/composables/useSets';
import { useTranslation } from '~/composables/useTranslation';
import { formatDateTime } from '~/format';
import { HUNTER_GENDER, WEAPON_CLASS } from '~/query/types';

const { translate } = useTranslation();
const { game, slug } = useGame();
const router = useRouter();
const { setQuery } = useQuery();
const { entries } = useHistory();
const { sets } = useSets();

const searchPath = computed(() =>
  slug.value ? `/${encodeURIComponent(slug.value)}/search` : '/',
);
const historyPath = computed(() =>
  slug.value ? `/${encodeURIComponent(slug.value)}/history` : '/',
);
const setsPath = computed(() =>
  slug.value ? `/${encodeURIComponent(slug.value)}/sets` : '/',
);
const latestSearch = computed(() => entries.value.toReversed()[0] ?? null);
const recentSets = computed(() =>
  sets.value
    .toSorted(
      (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
    )
    .slice(0, 3),
);

function skillEntries(entry: HistoryEntry) {
  return Object.entries(entry.query.skills).map(([skill, points]) => ({
    skill,
    points,
  }));
}

function guildRank(entry: HistoryEntry) {
  return (
    game.value?.guild.find((rank) => rank.rank === entry.query.hunter.rank)
      ?.label ?? entry.query.hunter.rank
  );
}

function villageRank(entry: HistoryEntry) {
  return (
    game.value?.village.find((rank) => rank.rank === entry.query.hunter.village)
      ?.label ?? entry.query.hunter.village
  );
}

function repeat(entry: HistoryEntry) {
  setQuery(entry.query);
  void router.push(searchPath.value);
}
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate('navigation-tab-home') }}
  </h2>

  <section class="grid gap-3 md:grid-cols-2">
    <article
      class="flex min-h-40 flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg font-bold">
          {{ translate('navigation-tab-search') }}
        </h3>
        <Icon name="lucide:search" class="text-2xl text-stone-500 dark:text-stone-400" />
      </div>

      <div class="flex flex-1 items-end">
        <NuxtLink
          :to="searchPath"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
        >
          {{ translate('search-submit') }}
        </NuxtLink>
      </div>
    </article>

    <article
      class="flex min-h-40 flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg font-bold">
          {{ translate('navigation-tab-history') }}
        </h3>
        <NuxtLink
          :to="historyPath"
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          :aria-label="translate('navigation-tab-history')"
        >
          <Icon name="lucide:arrow-right" />
        </NuxtLink>
      </div>

      <template v-if="latestSearch">
        <div class="min-w-0 flex-1">
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ formatDateTime(new Date(latestSearch.createdAt)) }}
          </p>
          <p
            class="mt-1 flex flex-wrap gap-x-2 text-sm text-stone-600 dark:text-stone-400"
          >
            <span>
              {{ translate('history-rank-guild', { rank: guildRank(latestSearch) }) }}
            </span>
            <span>
              {{ translate('history-rank-village', { rank: villageRank(latestSearch) }) }}
            </span>
            <span>
              {{
                latestSearch.query.hunter.gender === HUNTER_GENDER.Female
                  ? translate('gender-female')
                  : translate('gender-male')
              }}
            </span>
            <span>
              {{
                latestSearch.query.weapon.class === WEAPON_CLASS.Gunner
                  ? translate('weapon-class-gunner')
                  : translate('weapon-class-blademaster')
              }}
              {{ latestSearch.query.weapon.slots }}
              {{ translate('search-weapon-slots') }}
            </span>
          </p>
          <div class="mt-2 flex flex-wrap gap-1">
            <SkillPill
              v-for="skill in skillEntries(latestSearch)"
              :key="`${latestSearch.id}:${skill.skill}:${skill.points}`"
              :skill="skill.skill"
              :points="skill.points"
            />
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-4 py-2 font-semibold text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          @click="repeat(latestSearch)"
        >
          <Icon name="lucide:rotate-cw" />
          {{ translate('history-repeat') }}
        </button>
      </template>

      <p v-else class="text-stone-600 dark:text-stone-400">
        {{ translate('history-empty') }}
      </p>
    </article>
  </section>

  <article
    class="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
  >
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-bold">
        {{ translate('navigation-tab-sets') }}
      </h3>
      <NuxtLink
        :to="setsPath"
        class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        :aria-label="translate('navigation-tab-sets')"
      >
        <Icon name="lucide:arrow-right" />
      </NuxtLink>
    </div>

    <div v-if="recentSets.length" class="flex flex-col gap-2">
      <SetCard
        v-for="set in recentSets"
        :key="set.id"
        :set="set"
      />
    </div>
    <div
      v-else
      class="rounded-xl bg-stone-100 p-3 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
    >
      {{ translate('sets-no-sets') }}
    </div>
  </article>
</template>
