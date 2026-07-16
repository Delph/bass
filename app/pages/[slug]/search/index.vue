<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Fieldset from '~/components/Fieldset.vue';
import Field from '~/components/Field.vue';
import Select from '~/components/Select.vue';
import Toggle from '~/components/Toggle.vue';
import { useGame } from '~/composables/useGame';
import { useHistory } from '~/composables/useHistory';
import { useLanguage } from '~/composables/useLanguage';
import { useQuery } from '~/composables/useQuery';
import { useSearch } from '~/composables/useSearch';
import {
  HUNTER_GENDER,
  type HunterGender,
  WEAPON_CLASS,
  type WeaponClass,
} from '~/query/types';
import Label from '~/components/Label.vue';
import SkillPill from '~/components/SkillPill.vue';
import Radioboxes from '~/components/Radioboxes.vue';

const { data, game } = useGame();
const router = useRouter();
const history = useHistory();
const search = useSearch();
const { formatNumber, translate } = useLanguage();
const {
  query,
  setGuildRank,
  setHunterGender,
  setVillageRank,
  setWeaponClass,
  setWeaponSlots,
} = useQuery();

function rankLabel(rank: { rank: number; group?: string }) {
  const gRank = rank.group === 'g-rank';
  const value = gRank ? rank.rank - 6 : rank.rank;

  return translate(gRank ? 'rank-label-g' : 'rank-label-stars', {
    rank: formatNumber(value),
  });
}

const guildRankOptions = computed(() => {
  return (
    game.value?.guild.map((rank) => ({
      value: rank.rank,
      label: rankLabel(rank),
      group: rank.group ? translate(`rank-group-${rank.group}`) : undefined,
    })) ?? []
  );
});

const villageRankOptions = computed(() => {
  return (
    game.value?.village.map((rank) => ({
      value: rank.rank,
      label: rankLabel(rank),
      group: rank.group ? translate(`rank-group-${rank.group}`) : undefined,
    })) ?? []
  );
});

const genderOptions = computed(() => [
  {
    value: 1,
    label: translate('gender-male'),
  },
  {
    value: 2,
    label: translate('gender-female'),
  },
]);

const weaponClassOptions = computed(() => [
  {
    value: 1,
    label: translate('weapon-class-blademaster'),
  },
  {
    value: 2,
    label: translate('weapon-class-gunner'),
  },
]);

const slotOptions = [0, 1, 2, 3].map((slots) => ({
  value: slots,
  label: String(slots),
}));

const resultsPath = computed(() =>
  game.value ? `/${game.value.slug}/search/results` : '/',
);
const selectedSkills = computed(() => {
  return Object.entries(query.value.skills).map(([skill, points]) => ({
    skill,
    points,
  }));
});
const canSearch = computed(
  () => data.value !== undefined && game.value !== undefined && selectedSkills.value.length > 0,
);

function submit() {
  if (!data.value || !game.value || selectedSkills.value.length === 0) return;

  search.start(game.value.slug, query.value, data.value);
  history.add(query.value);
  void router.push(resultsPath.value);
}
</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate('navigation-tab-search') }}
  </h2>
  <Fieldset :legend="translate('search-hunter')">
    <Label>
      {{ translate('search-hunter-rank-guild') }}
      <Select
        name="guild-rank"
        :value="query.hunter.rank"
        :options="guildRankOptions"
        @change="(v) => setGuildRank(v as number)"
      />
    </Label>
    <Label>
      {{ translate('search-hunter-rank-village') }}
      <Select
        name="village-rank"
        :value="query.hunter.village"
        :options="villageRankOptions"
        @change="(v) => setVillageRank(v as number)"
      />
    </Label>
    <Label>
      {{ translate('search-hunter-gender') }}
      <Radioboxes
        name="hunter-gender"
        :value="query.hunter.gender"
        :options="genderOptions"
        @change="
          (v) => setHunterGender(v as (typeof HUNTER_GENDER)[HunterGender])
        "
      />
    </Label>
  </Fieldset>
  <Fieldset :legend="translate('search-weapon')">
    <Label>
      {{ translate('search-weapon-class') }}
      <Select
        name="weapon-class"
        :value="query.weapon.class"
        :options="weaponClassOptions"
        @change="(v) => setWeaponClass(v as (typeof WEAPON_CLASS)[WeaponClass])"
      />
    </Label>
    <Label v-if="game?.features.decorations">
      {{ translate('search-weapon-slots') }}
      <Radioboxes
        name="weapon-slots"
        :value="query.weapon.slots"
        :options="slotOptions"
        @change="(v) => setWeaponSlots(v as number)"
      />
    </Label>
  </Fieldset>
  <Fieldset :legend="translate('search-skills')">
    <NuxtLink
      to="search/skills"
      class="block rounded-xl border border-stone-200 bg-white p-3 text-sm shadow-sm dark:border-stone-700 dark:bg-stone-900"
    >
      <p
        v-if="selectedSkills.length === 0"
        class="text-stone-500 dark:text-stone-400"
      >
        {{ translate('search-skills-empty') }}
      </p>
      <div v-else class="flex flex-wrap gap-2">
        <SkillPill
          v-for="skill in selectedSkills"
          :key="`${skill.skill}:${skill.points}`"
          :skill="skill.skill"
          :points="skill.points"
        />
      </div>
    </NuxtLink>
  </Fieldset>
  <Fieldset :legend="translate('search-options')">
    <Label>
      {{ translate('search-options-allow-bad') }}
      <Toggle
        v-model="query.options.allowBad"
      />
    </Label>
    <Label>
      {{ translate('search-options-allow-dummy') }}
      <Toggle
        v-model="query.options.allowDummy"
      />
    </Label>
  </Fieldset>
  <button
    type="button"
    :disabled="!canSearch"
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
    @click="submit"
  >
    {{ translate('search-submit') }}
  </button>
</template>
