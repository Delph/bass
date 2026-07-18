export type Countdown = {
  remaining: number;
  startedAt: number | null;
};

export function createCountdown(duration: number, time: number): Countdown {
  return {
    remaining: Math.max(0, duration),
    startedAt: time,
  };
}

export function countdownRemaining(countdown: Countdown, time: number) {
  if (countdown.startedAt === null) return countdown.remaining;

  const elapsed = Math.max(0, time - countdown.startedAt);
  return Math.max(0, countdown.remaining - elapsed);
}

export function pauseCountdown(countdown: Countdown, time: number) {
  if (countdown.startedAt === null) return;

  countdown.remaining = countdownRemaining(countdown, time);
  countdown.startedAt = null;
}

export function resumeCountdown(countdown: Countdown, time: number) {
  if (countdown.startedAt !== null || countdown.remaining === 0) return;

  countdown.startedAt = time;
}
