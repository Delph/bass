import { useState } from '#app';
import { computed } from 'vue';
import type { UUID } from '~/types';

export type ToastType = 'information' | 'success' | 'warning' | 'error';

export type Toast = {
  /// the translate toast text to display
  text: string;

  /// the type of toast
  type: ToastType;
};

export type RegisteredToast = Toast & {
  id: UUID;
};

const timeouts = new Map<UUID, ReturnType<typeof setTimeout>>();

export function useToasts() {
  const entries = useState<RegisteredToast[]>('toasts', () => []);

  /**
   * Removes a toast
   * @param id The ID of the toast to remove
   * @returns
   */
  function remove(id: UUID) {
    const timeout = timeouts.get(id);
    if (timeout) clearTimeout(timeout);
    timeouts.delete(id);

    const index = entries.value.findIndex((toast) => toast.id === id);
    if (index === -1) return;

    entries.value.splice(index, 1);
  }

  /**
   * Adds a toast message to the toast container
   * @param toast The toast to Add
   * @param displayMs How long to display the toast for, in milliseconds. Defaults to a toast message length variable duration.
   * @returns The new toast's ID
   */
  function add(toast: Toast, displayMs: number = -1) {
    const id = crypto.randomUUID();
    const registered = { id, ...toast } satisfies RegisteredToast;
    const automaticDuration = Math.min(15000, 6000 + toast.text.length * 100);
    const timeout = setTimeout(
      () => remove(id),
      displayMs > 0 ? displayMs : automaticDuration,
    );

    entries.value.push(registered);
    timeouts.set(id, timeout);

    return id;
  }

  /**
   * A simple helper for success toasts
   */
  function success(text: string, displayMs?: number) {
    return add({ text, type: 'success' }, displayMs);
  }

  /**
   * A simple helper for error toasts
   */
  function error(error: unknown, displayMs?: number) {
    return add(
      {
        text: error instanceof Error ? error.message : String(error),
        type: 'error',
      },
      displayMs,
    );
  }

  return {
    add,
    error,
    remove,
    success,
    toasts: computed(() => entries.value),
  };
}
