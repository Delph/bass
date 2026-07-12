import { computed } from 'vue';

import { useGame } from '~/composables/useGame';
import { bucket, type SavedSet } from '~/persistence/buckets/sets';
import { current } from '~/persistence/storage';
import { armourSetIDv1 } from '~/set';
import type { ArmourSet } from '~/solver/solver';
import type { UUID } from '~/types';

export type { SavedSet } from '~/persistence/buckets/sets';

export function useSets() {
  const { slug } = useGame();

  const allSets = bucket.state('sets');

  const sets = computed(() =>
    current(slug.value ?? 'mhfu', allSets.value, () => []),
  );

  const active = computed(() =>
    sets.value.filter((set) => set.deletedAt === null),
  );

  function findSet(set: ArmourSet) {
    const id = armourSetIDv1(set);

    return active.value.find((saved) => armourSetIDv1(saved) === id) ?? null;
  }

  function hasSet(set: ArmourSet) {
    return findSet(set) !== null;
  }

  function addSet(set: ArmourSet, name: string = '', notes: string = '') {
    const existing = findSet(set);

    if (existing) return existing;

    const saved = {
      id: crypto.randomUUID(),
      name: name.trim(),
      notes,
      createdAt: Date.now(),
      updatedAt: null,
      deletedAt: null,
      ...set,
    } satisfies SavedSet;

    sets.value.push(saved);
    bucket.save(allSets.value);

    return saved;
  }

  function updateSet(id: UUID, metadata: Pick<SavedSet, 'name' | 'notes'>) {
    const set = sets.value.find((set) => set.id === id);

    if (!set || set.deletedAt !== null) return null;

    const name = metadata.name.trim();
    const notes = metadata.notes;

    if (set.name === name && set.notes === notes) return set;

    set.name = name;
    set.notes = notes;
    set.updatedAt = Date.now();
    bucket.save(allSets.value);

    return set;
  }

  function saveSet(set: ArmourSet, metadata: Pick<SavedSet, 'name' | 'notes'>) {
    const existing = findSet(set);

    if (existing) return updateSet(existing.id, metadata)!;

    return addSet(set, metadata.name, metadata.notes);
  }

  function removeSet(id: UUID) {
    const set = sets.value.find((s) => s.id === id);
    if (!set) {
      console.warn(`No such set ${id}`);
      return;
    }
    set.deletedAt = Date.now();
    bucket.save(allSets.value);
  }

  return {
    addSet,
    findSet,
    hasSet,
    removeSet,
    saveSet,
    sets: active,
    updateSet,
  };
}
