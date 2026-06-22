<script lang="ts" setup>
import { computed } from "vue";
import Fieldset from "~/components/Fieldset.vue";
import Field from "~/components/Field.vue";
import Select from "~/components/Select.vue";
import Toggle from "~/components/Toggle.vue";
import { useGame } from "~/composables/useGame";
import { useQuery } from "~/composables/useQuery";
import { useTranslation } from "~/composables/useTranslation";
import { formatSkillPoints, getSkillLabel } from "~/skills";
import { HUNTER_GENDER, type HunterGender, WEAPON_CLASS, type WeaponClass } from "~/query/types";
import Label from "~/components/Label.vue";
import Radioboxes from "~/components/Radioboxes.vue";

const { data, game } = useGame();
const { translate } = useTranslation();
const {
  query,
  setGuildRank,
  setHunterGender,
  setVillageRank,
  setWeaponClass,
  setWeaponSlots,
} = useQuery();

const guildRankOptions = computed(() => {
  return game.value?.guild.map((rank) => ({
    value: rank.rank,
    label: rank.label,
    group: rank.group,
  })) ?? [];
});

const villageRankOptions = computed(() => {
  return game.value?.village.map((rank) => ({
    value: rank.rank,
    label: rank.label,
    group: rank.group,
  })) ?? [];
});

const genderOptions = computed(() => [
  {
    value: 1,
    label: translate("gender-male"),
  },
  {
    value: 2,
    label: translate("gender-female"),
  }
]);

const weaponClassOptions = computed(() => [
  {
    value: 1,
    label: translate("weapon-class-blademaster"),
  },
  {
    value: 2,
    label: translate("weapon-class-gunner"),
  },
]);

const slotOptions = [0, 1, 2, 3].map((slots) => ({
  value: slots,
  label: String(slots),
}));

const resultsPath = computed(() => game.value ? `/${game.value.slug}/search/results` : '/');
const selectedSkills = computed(() => {
  return Object.entries(query.value.skills).map(([skill, points]) => ({
    skill,
    points,
  }));
});

</script>

<template>
  <h2 class="text-2xl font-bold">
    {{ translate("navigation-tab-search") }}
  </h2>
  <Fieldset :legend="translate('search-hunter')">
    <Label>
      {{ translate('search-hunter-rank-guild') }}
      <Select
        :name="translate('search-hunter-rank-guild')"
        :value="query.hunter.rank"
        :options="guildRankOptions"
        @change="v => setGuildRank(v as number)"
      />
    </Label>
    <Label>
      {{ translate('search-hunter-rank-village') }}
      <Select
        :name="translate('search-hunter-rank-village')"
        :value="query.hunter.village"
        :options="villageRankOptions"
        @change="v => setVillageRank(v as number)"
      />
    </Label>
    <Label>
      {{ translate('search-hunter-gender') }}
      <Radioboxes
        :name="translate('search-hunter-gender')"
        :value="query.hunter.gender"
        :options="genderOptions"
        @change=" v => setHunterGender(v as typeof HUNTER_GENDER[HunterGender])"
      />
    </Label>
  </Fieldset>
  <Fieldset :legend="translate('search-weapon')">
    <Label>
      {{ translate('search-weapon-class') }}
      <Select
        :name="translate('search-weapon-class')"
        :value="query.weapon.class"
        :options="weaponClassOptions"
        @change="v => setWeaponClass(v as typeof WEAPON_CLASS[WeaponClass])"
      />
    </Label>
    <Label
      v-if="game?.features.decorations"
    >
      {{ translate('search-weapon-slots') }}
      <Radioboxes
        :name="translate('search-weapon-slots')"
        :value="query.weapon.slots"
        :options="slotOptions"
        @change="v => setWeaponSlots(v as number)"
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
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <span
          v-for="skill in selectedSkills"
          :key="`${skill.skill}:${skill.points}`"
          class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          {{ getSkillLabel(skill, data?.skills) }}
          <span class="text-xs text-emerald-700 dark:text-emerald-300">{{ formatSkillPoints(skill.points) }}</span>
        </span>
      </div>
    </NuxtLink>
  </Fieldset>
  <Fieldset :legend="translate('search-options')">
    <Label>
      {{ translate('search-options-allow-bad') }}
      <Toggle
        v-model="query.options.allowBad"
        :name="translate('search-options-allow-bad')"
      />
    </Label>
    <Label>
      {{ translate('search-options-allow-dummy') }}
      <Toggle
        v-model="query.options.allowDummy"
        :name="translate('search-options-allow-dummy')"
      />
    </Label>
  </Fieldset>
  <NuxtLink
    :to="resultsPath"
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
  >
    {{ translate('search-submit') }}
  </NuxtLink>
</template>
