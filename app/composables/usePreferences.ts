import { computed } from 'vue';
import {
  bucket,
  maxCutoff,
  minCutoff,
  type Theme,
} from '~/persistence/buckets/preferences';
import type { LocaleSlug } from '~/translation';
import { bound } from '~/utility';
import { boundWorkers } from '~/workers/pool';

export function usePreferences() {
  const preferences = bucket.state('preferences');

  const theme = computed(() => preferences.value.theme);
  const locale = computed(() => preferences.value.locale);
  const workers = computed(() => preferences.value.workers);
  const cutoff = computed(() => preferences.value.cutoff);

  function setTheme(theme: Theme) {
    preferences.value.theme = theme;
    bucket.save(preferences.value);
  }

  function setLocale(locale: LocaleSlug) {
    preferences.value.locale = locale;
    bucket.save(preferences.value);
  }

  function setWorkers(workers: number) {
    preferences.value.workers = boundWorkers(workers);
    bucket.save(preferences.value);
  }

  function setCutoff(cutoff: number) {
    preferences.value.cutoff = bound(cutoff, minCutoff, maxCutoff);
    bucket.save(preferences.value);
  }

  return {
    theme,
    setTheme,
    locale,
    setLocale,
    workers,
    setWorkers,
    cutoff,
    setCutoff,
  };
}
