import { computed } from 'vue';
import { useGame } from '~/composables/useGame';
import { bucket } from '~/buckets/query';
import { current } from '~/game/game';
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

  const queries = bucket.state;

  const query = computed(() =>
    current(game.slug.value ?? 'mhfu', queries.value, () => createQuery()),
  );

  function setQuery(value: QueryState) {
    queries.value[game.slug.value ?? 'mhfu'] = createQuery(value);
    bucket.save();
  }

  function setGuildRank(value: number) {
    query.value.hunter.rank = value;
    bucket.save();
  }

  function setVillageRank(value: number) {
    query.value.hunter.village = value;
    bucket.save();
  }

  function setHunterGender(value: (typeof HUNTER_GENDER)[HunterGender]) {
    query.value.hunter.gender = value;
    bucket.save();
  }

  function setWeaponClass(value: (typeof WEAPON_CLASS)[WeaponClass]) {
    query.value.weapon.class = value;
    bucket.save();
  }

  function setWeaponSlots(value: number) {
    query.value.weapon.slots = value;
    bucket.save();
  }

  function setAllowBad(value: boolean) {
    query.value.options.allowBad = value;
    bucket.save();
  }

  function setAllowDummy(value: boolean) {
    query.value.options.allowDummy = value;
    bucket.save();
  }

  function hasSkill(skill: SkillRequirement) {
    return query.value.skills[skill.skill] === skill.points;
  }

  function addSkill(skill: SkillRequirement) {
    query.value.skills[skill.skill] = skill.points;
    bucket.save();
  }

  function removeSkill(skill: string) {
    delete query.value.skills[skill];
    bucket.save();
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
