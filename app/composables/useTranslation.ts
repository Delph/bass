import { useState } from '#app';

import {
  type LocaleSlug,
  type Translations,
  type TranslationVariables,
  translate as tr,
} from '~/translation';
import { useGame } from './useGame';
import { usePreferences } from './usePreferences';
import type { Identity } from '~/types';

export type DateTimeFormatOptions = Identity<
  Intl.DateTimeFormatOptions & {
    /// custom formatter option, either "locale", to format to whatever the locale says or "iso8601" which is not quite standard
    format?: 'locale' | 'iso8601';
  }
>;

export function useTranslation() {
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

  /**
   * Formats a date into a readable date time string
   * By default has the format of DD/MM/YYYY, HH:MM:SS
   * Format can be configured, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
   */
  function formatDateTime(date: Date, options?: DateTimeFormatOptions): string {
    options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',

      format: 'locale',
      ...options,
    };

    const format = new Intl.DateTimeFormat(locale.value, options);
    switch (options.format) {
      case 'locale':
        return format.format(date);
      case 'iso8601': {
        const parts = format.formatToParts(date);
        const datestr = ['year', 'month', 'day']
          .map((f) => parts.find((p) => p.type === f)?.value)
          .join('-');
        const timestr = ['hour', 'minute', 'second']
          .map((f) => parts.find((p) => p.type === f)?.value)
          .join(':');
        return `${datestr} ${timestr}`;
      }
    }
    return date.toISOString();
  }

  /**
   * Formats a number nicely for reading
   * By default adds thousands separators
   */
  function formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    const format = new Intl.NumberFormat(locale.value, { ...options });
    return format.format(value);
  }

  function formatPercent(
    value: number,
    dp: number = 0,
    options?: Intl.NumberFormatOptions,
  ): string {
    return formatNumber(value, {
      style: 'percent',
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
      ...options,
    });
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
