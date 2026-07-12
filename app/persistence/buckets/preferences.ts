import { defineBucket } from '~/persistence/storage';
import { defaultLocale, type LocaleSlug } from '~/translation';

export type Theme = 'system' | 'light' | 'dark';

export type Preferences = {
  theme: Theme;
  locale: LocaleSlug;
};

export const bucket = defineBucket<Preferences>({
  key: 'bass:preferences',
  version: 0,
  initial: {
    theme: 'system',
    locale: defaultLocale,
  },
  migrate: function (version: number, stored: unknown) {
    return stored as Preferences;
  },
});
