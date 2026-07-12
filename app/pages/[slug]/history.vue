<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import SkillPill from '~/components/SkillPill.vue';
import { useGame } from '~/composables/useGame';
import { useHistory, type HistoryEntry } from '~/composables/useHistory';
import { useQuery } from '~/composables/useQuery';
import { useTranslation } from '~/composables/useTranslation';
import { formatDateTime } from '~/format';
import { HUNTER_GENDER, WEAPON_CLASS } from '~/query/types';

const { translate } = useTranslation();
const { game, slug } = useGame();
const router = useRouter();
const { setQuery } = useQuery();
const { entries, remove } = useHistory();

const newestEntries = computed(() => entries.value.toReversed());

function skillEntries(entry: HistoryEntry) {
  return Object.entries(entry.query.skills).map(([skill, points]) => ({
    skill,
    points,
  }));
}

function repeat(entry: HistoryEntry) {
  setQuery(entry.query);

  if (slug.value) void router.push(`/${encodeURIComponent(slug.value)}/search`);
}
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate('navigation-tab-history') }}
  </h2>

  <div v-if="newestEntries.length === 0">
    {{ translate('history-empty') }}
  </div>

  <template v-else>
    <article
      v-for="entry in newestEntries"
      :key="entry.id"
      class="flex flex-wrap gap-2 rounded-xl bg-stone-100 p-2 dark:bg-stone-800"
    >
      <div class="flex w-full items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div>
            <span>
              {{
                translate('history-rank-guild', {
                  rank: game!.guild.find(
                    (r) => r.rank === entry.query.hunter.rank,
                  )?.label,
                })
              }}

              {{
                translate('history-rank-village', {
                  rank: game!.village.find(
                    (r) => r.rank === entry.query.hunter.village,
                  )?.label,
                })
              }}
            </span>
          </div>
          <p
            class="flex flex-wrap gap-x-2 text-sm text-stone-600 dark:text-stone-400"
          >
            <span>
              {{
                entry.query.hunter.gender === HUNTER_GENDER.Female
                  ? translate('gender-female')
                  : translate('gender-male')
              }}
            </span>
            <span>
              {{
                entry.query.weapon.class === WEAPON_CLASS.Gunner
                  ? translate('weapon-class-gunner')
                  : translate('weapon-class-blademaster')
              }}
              {{ entry.query.weapon.slots }}
              {{ translate('search-weapon-slots') }}
            </span>
            <span v-if="entry.query.options.allowBad">
              {{ translate('search-options-allow-bad') }}
            </span>
            <span v-if="entry.query.options.allowDummy">
              {{ translate('search-options-allow-dummy') }}
            </span>
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            class="flex size-10 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-700"
            :title="translate('history-repeat')"
            @click="repeat(entry)"
          >
            <Icon name="lucide:rotate-cw" />
          </button>
          <button
            type="button"
            class="flex size-10 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-700"
            :title="translate('history-remove')"
            @click="remove(entry.id)"
          >
            <Icon name="lucide:trash" />
          </button>
        </div>
      </div>

      <div class="flex w-full flex-wrap gap-1">
        <SkillPill
          v-for="skill in skillEntries(entry)"
          :key="`${entry.id}:${skill.skill}:${skill.points}`"
          :skill="skill.skill"
          :points="skill.points"
        />
      </div>

      <p class="w-full text-xs text-stone-500 dark:text-stone-500">
        {{ formatDateTime(new Date(entry.createdAt)) }}
      </p>
    </article>
  </template>
</template>
