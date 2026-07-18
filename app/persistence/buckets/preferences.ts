import { defineBucket } from '~/persistence/storage';
import type { Theme } from '~/theme';
import { detectLocale, type LocaleSlug } from '~/translation';
import { bound } from '~/utility';
import { maxWorkers } from '~/workers/pool';

export type Preferences = {
  theme: Theme;
  locale: LocaleSlug;
  workers: number;
  cutoff: number;
  persistenceReminder: boolean;
};

export const defaultWorkers = bound(
  Math.floor(maxWorkers / 2),
  1,
  Math.min(maxWorkers, 4),
);

export const minCutoff = 5;
export const maxCutoff = 30;
export const defaultCutoff = 20;

export const bucket = defineBucket<Preferences>({
  key: 'bass:preferences',
  version: 0,
  initial: {
    theme: 'system',
    locale: detectLocale(),
    workers: defaultWorkers,
    cutoff: defaultCutoff,
    persistenceReminder: true,
  },
  migrate: function (version: number, stored: unknown) {
    return stored as Preferences;
  },
});
