import { useState } from '#app';
import { computed } from 'vue';
import {
  countdownRemaining,
  createCountdown,
  pauseCountdown,
  resumeCountdown,
  type Countdown,
} from '~/timer';
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

const timers = new Map<
  UUID,
  {
    countdown: Countdown;
    duration: number;
    timeout: ReturnType<typeof setTimeout> | null;
  }
>();

export function useToasts() {
  const entries = useState<RegisteredToast[]>('toasts', () => []);

  /**
   * Removes a toast
   * @param id The ID of the toast to remove
   * @returns
   */
  function remove(id: UUID) {
    const timer = timers.get(id);
    if (timer?.timeout) clearTimeout(timer.timeout);
    timers.delete(id);

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
  function schedule(id: UUID, time: number) {
    const timer = timers.get(id);
    if (!timer) return;

    const remaining = countdownRemaining(timer.countdown, time);
    if (remaining === 0) {
      remove(id);
      return;
    }

    timer.timeout = setTimeout(() => remove(id), remaining);
  }

  function pause(id: UUID) {
    const timer = timers.get(id);
    if (!timer || timer.countdown.startedAt === null) return;

    if (timer.timeout) clearTimeout(timer.timeout);
    timer.timeout = null;
    pauseCountdown(timer.countdown, performance.now());
  }

  function resume(id: UUID) {
    const timer = timers.get(id);
    if (!timer || timer.countdown.startedAt !== null) return;

    const time = performance.now();
    resumeCountdown(timer.countdown, time);
    schedule(id, time);
  }

  function remainingRatio(id: UUID, time: number) {
    const timer = timers.get(id);
    if (!timer) return 0;

    return countdownRemaining(timer.countdown, time) / timer.duration;
  }

  function add(toast: Toast, displayMs: number = -1) {
    const id = crypto.randomUUID();
    const registered = { id, ...toast } satisfies RegisteredToast;
    const automaticDuration = Math.min(15000, 6000 + toast.text.length * 100);
    const duration = displayMs > 0 ? displayMs : automaticDuration;
    const time = performance.now();

    entries.value.push(registered);
    timers.set(id, {
      countdown: createCountdown(duration, time),
      duration,
      timeout: null,
    });
    schedule(id, time);

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
    pause,
    remainingRatio,
    remove,
    resume,
    success,
    toasts: computed(() => entries.value),
  };
}
