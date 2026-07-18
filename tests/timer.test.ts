import { expect, test } from 'vitest';

import {
  countdownRemaining,
  createCountdown,
  pauseCountdown,
  resumeCountdown,
} from '~/timer';

test('reports elapsed time while running', () => {
  const countdown = createCountdown(1000, 100);

  expect(countdownRemaining(countdown, 500)).toBe(600);
  expect(countdownRemaining(countdown, 1100)).toBe(0);
});

test('preserves remaining time while paused', () => {
  const countdown = createCountdown(1000, 100);

  pauseCountdown(countdown, 500);

  expect(countdownRemaining(countdown, 5000)).toBe(600);
});

test('resumes from the remaining duration', () => {
  const countdown = createCountdown(1000, 100);

  pauseCountdown(countdown, 500);
  resumeCountdown(countdown, 2000);

  expect(countdownRemaining(countdown, 2599)).toBe(1);
  expect(countdownRemaining(countdown, 2600)).toBe(0);
});
