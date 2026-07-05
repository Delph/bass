import { useState } from '#app';
import { computed } from 'vue';
import { useGame } from '~/composables/useGame';
import { defineBucket } from '~/persistence/storage';
import {
  WEAPON_CLASS,
  HUNTER_GENDER,
  type WeaponClass,
  type SkillRequirement,
  type HunterGender,
  type QueryState,
  query,
} from '~/query/types';

const bucket = defineBucket<Record<string, QueryState>>({
  key: 'bass:query',
  version: 0,
  initial: {
    mhf: query({
      hunter: { rank: 5, village: 6 },
    }),
    mhfu: query(),
  },
  migrate: function (
    version: number,
    stored: unknown,
  ): Record<string, QueryState> {
    return stored as Record<string, QueryState>;
  },
});

export function useQuery() {
  const game = useGame();

  const queries = useState<Record<string, QueryState>>('query', bucket.load);

  const query = computed(() => queries.value[game.slug.value ?? 'mhfu']!);

  function setGuildRank(value: number) {
    query.value.hunter.rank = value;
    bucket.save(queries.value);
  }

  function setVillageRank(value: number) {
    query.value.hunter.village = value;
    bucket.save(queries.value);
  }

  function setHunterGender(value: (typeof HUNTER_GENDER)[HunterGender]) {
    query.value.hunter.gender = value;
    bucket.save(queries.value);
  }

  function setWeaponClass(value: (typeof WEAPON_CLASS)[WeaponClass]) {
    query.value.weapon.class = value;
    bucket.save(queries.value);
  }

  function setWeaponSlots(value: number) {
    query.value.weapon.slots = value;
    bucket.save(queries.value);
  }

  function hasSkill(skill: SkillRequirement) {
    return query.value.skills[skill.skill] === skill.points;
  }

  function addSkill(skill: SkillRequirement) {
    query.value.skills[skill.skill] = skill.points;
    bucket.save(queries.value);
  }

  function removeSkill(skill: string) {
    delete query.value.skills[skill];
    bucket.save(queries.value);
  }

  return {
    addSkill,
    hasSkill,
    query,
    removeSkill,
    setGuildRank,
    setHunterGender,
    setVillageRank,
    setWeaponClass,
    setWeaponSlots,
  };
}
