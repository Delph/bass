import { useState } from '#app';
import { usePreferences } from '~/composables/usePreferences';
import { persistence } from '@delphington/persistent-buckets';

let checking: Promise<void> | null = null;

export function usePersistence() {
  const { persistenceReminder: reminder, setPersistenceReminder } =
    usePreferences();
  const persistent = useState<boolean | undefined>(
    'storage-persistent',
    () => undefined,
  );
  const supported = useState('storage-persistence-supported', () => true);
  const pending = useState('storage-persistence-pending', () => false);

  async function check() {
    if (
      persistence.ephemeral ||
      persistent.value !== undefined ||
      !supported.value
    )
      return;

    if (!navigator.storage?.persisted || !navigator.storage.persist) {
      supported.value = false;
      return;
    }

    checking ??= navigator.storage
      .persisted()
      .then((value) => (persistent.value = value))
      .catch(() => (supported.value = false))
      .then(() => undefined)
      .finally(() => (checking = null));

    await checking;
  }

  async function request() {
    if (persistence.ephemeral) return false;

    if (!navigator.storage?.persist) {
      supported.value = false;
      return false;
    }

    pending.value = true;

    try {
      persistent.value = await navigator.storage.persist();
      return persistent.value;
    } finally {
      pending.value = false;
    }
  }

  function dismiss() {
    setPersistenceReminder(false);
  }

  return {
    check,
    dismiss,
    ephemeral: persistence.ephemeral,
    pending,
    persistent,
    reminder,
    request,
    supported,
  };
}
