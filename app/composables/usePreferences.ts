import { computed } from 'vue';
import { bucket, maxCutoff, minCutoff } from '~/buckets/preferences';
import type { Theme } from '~/theme';
import type { LocaleSlug } from '~/translation';
import { bound } from '~/utility';
import { boundWorkers } from '~/workers/pool';

export function usePreferences() {
  const preferences = bucket.state;

  const theme = computed(() => preferences.value.theme);
  const locale = computed(() => preferences.value.locale);
  const workers = computed(() => preferences.value.workers);
  const cutoff = computed(() => preferences.value.cutoff);
  const persistenceReminder = computed(
    () => preferences.value.persistenceReminder,
  );

  function setTheme(theme: Theme) {
    preferences.value.theme = theme;
    bucket.save();
  }

  function setLocale(locale: LocaleSlug) {
    preferences.value.locale = locale;
    bucket.save();
  }

  function setWorkers(workers: number) {
    preferences.value.workers = boundWorkers(workers);
    bucket.save();
  }

  function setCutoff(cutoff: number) {
    preferences.value.cutoff = bound(cutoff, minCutoff, maxCutoff);
    bucket.save();
  }

  function setPersistenceReminder(reminder: boolean) {
    preferences.value.persistenceReminder = reminder;
    bucket.save();
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
    persistenceReminder,
    setPersistenceReminder,
  };
}
