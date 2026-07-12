import { computed } from 'vue';
import {
  bucket,
  type Theme,
} from '~/persistence/buckets/preferences';
import type { LocaleSlug } from '~/translation';

export function usePreferences() {
  const preferences = bucket.state('preferences');

  const theme = computed(() => preferences.value.theme);
  const locale = computed(() => preferences.value.locale);

  function setTheme(theme: Theme) {
    preferences.value.theme = theme;
    bucket.save(preferences.value);
  }

  function setLocale(locale: LocaleSlug) {
    preferences.value.locale = locale;
    bucket.save(preferences.value);
  }

  return {
    theme,
    setTheme,
    locale,
    setLocale,
  };
}
