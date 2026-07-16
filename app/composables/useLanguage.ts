import { useState } from '#app';

import {
  type LocaleSlug,
  type Translations,
  type TranslationVariables,
  translate as tr,
} from '~/translation';
import {
  formatDateTime as formatDateTimeForLocale,
  formatNumber as formatNumberForLocale,
  formatPercent as formatPercentForLocale,
  type DateTimeFormatOptions,
} from '~/format';
import { useGame } from './useGame';
import { usePreferences } from './usePreferences';

export function useLanguage() {
  const { data } = useGame();
  const { locale, setLocale } = usePreferences();
  const translations = useState<Translations>(
    'translation-messages',
    () => ({}),
  );
  const pending = useState('translation-pending', () => false);
  const ready = useState('translation-ready', () => false);

  async function set(slug: LocaleSlug) {
    if (locale.value === slug && ready.value) return;

    pending.value = true;

    try {
      translations.value = await $fetch<Translations>(
        `/translations/${encodeURIComponent(slug)}.json`,
      );
      setLocale(slug);
      ready.value = true;
    } finally {
      pending.value = false;
    }
  }

  function translate(key: string, variables: TranslationVariables = {}) {
    if (translations.value[key] !== undefined)
      return tr(locale.value, translations.value, key, variables);

    if (data.value?.translations[key] !== undefined)
      return tr(locale.value, data.value.translations, key, variables);

    return key;
  }

  function formatDateTime(date: Date, options?: DateTimeFormatOptions): string {
    return formatDateTimeForLocale(locale.value, date, options);
  }

  function formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    return formatNumberForLocale(locale.value, value, options);
  }

  function formatPercent(
    value: number,
    dp: number = 0,
    options?: Intl.NumberFormatOptions,
  ): string {
    return formatPercentForLocale(locale.value, value, dp, options);
  }

  set(locale.value);

  return {
    locale,
    pending,
    ready,
    set,
    translate,

    formatDateTime,
    formatNumber,
    formatPercent,
  };
}
