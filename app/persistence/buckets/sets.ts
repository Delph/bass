import { defineBucket } from '~/persistence/storage';
import type { ArmourSet } from '~/solver/solver';
import type { AuditFields, UUID } from '~/types';

export type SavedSet = {
  /// an id to identify this set
  id: UUID;

  /// a user assigned name
  name: string;

  /// user notes about the set (not shared)
  notes: string;
} & AuditFields &
  ArmourSet;

export const bucket = defineBucket<Record<string, SavedSet[]>>({
  key: 'bass:sets',
  version: 0,
  initial: {
    mhfu: [],
  },
  migrate: function (
    version: number,
    stored: unknown,
  ): Record<string, SavedSet[]> {
    return stored as Record<string, SavedSet[]>;
  },
});
