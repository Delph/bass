import { computed } from 'vue';
import { useGame } from '~/composables/useGame';
import { bucket } from '~/persistence/buckets/query';
import { current } from '~/persistence/storage';
import {
  WEAPON_CLASS,
  HUNTER_GENDER,
  type WeaponClass,
  type SkillRequirement,
  type HunterGender,
  type QueryState,
  query as createQuery,
} from '~/query/types';

export function useQuery() {
  const game = useGame();

  const queries = bucket.state();

  const query = computed(() =>
    current(game.slug.value ?? 'mhfu', queries.value, () => createQuery()),
  );

  function setQuery(value: QueryState) {
    queries.value[game.slug.value ?? 'mhfu'] = createQuery(value);
    bucket.save(queries.value);
  }

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

  function setAllowBad(value: boolean) {
    query.value.options.allowBad = value;
    bucket.save(queries.value);
  }

  function setAllowDummy(value: boolean) {
    query.value.options.allowDummy = value;
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
    setQuery,
    setAllowBad,
    setAllowDummy,
    setGuildRank,
    setHunterGender,
    setVillageRank,
    setWeaponClass,
    setWeaponSlots,
  };
}
