import { defineBucket } from '~/persistence/storage';
import { defaultLocale, type LocaleSlug } from '~/translation';
import { bound } from '~/utility';
import { boundWorkers, maxWorkers } from '~/workers/pool';

export type Theme = 'system' | 'light' | 'dark';

export type Preferences = {
  theme: Theme;
  locale: LocaleSlug;
  workers: number;
};

export const defaultWorkers = bound(
  Math.floor(maxWorkers / 2),
  1,
  Math.min(maxWorkers, 4),
);

export const bucket = defineBucket<Preferences>({
  key: 'bass:preferences',
  version: 0,
  initial: {
    theme: 'system',
    locale: defaultLocale,
    workers: defaultWorkers,
  },
  migrate: function (version: number, stored: unknown) {
    return stored as Preferences;
  },
});
