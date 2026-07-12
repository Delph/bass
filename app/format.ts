import { useTranslation } from '~/composables/useTranslation';

type DateTimeFormatOptions = Intl.DateTimeFormatOptions & {
  /// custom formatter option, either "locale", to format to whatever the locale says or "iso8601" which is not quite standard
  format?: 'locale' | 'iso8601';
};

/**
 * Formats a date into a readable date time string
 * By default has the format of DD/MM/YYYY, HH:MM:SS
 * Format can be configured, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 */
export function formatDateTime(
  date: Date,
  options?: DateTimeFormatOptions,
  locale?: string,
): string {
  const translation = useTranslation();
  options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // timeZone: config.config.timezone,
    format: 'locale',
    ...options,
  };
  locale ??= translation.locale.value;

  const format = new Intl.DateTimeFormat(locale, options);
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
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  const translation = useTranslation();
  locale ??= translation.locale.value;

  const format = new Intl.NumberFormat(locale, { ...options });
  return format.format(value);
}

/**
 * Formats a number as a percentage (e.g., 0.05 becomes 5%)
 * Essentially just a convenience function for formatNumber with the options of style: "percent" and setting the minimum and maximumFractionDigits.
 */
export function formatPercent(
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
