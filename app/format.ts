export type DateTimeFormatOptions = Intl.DateTimeFormatOptions & {
  /// custom formatter option, either "locale", to format to whatever the locale says or "iso8601" which is not quite standard
  format?: 'locale' | 'iso8601';
};

const dateTimeFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

function formatKey(locale: string, options: object) {
  return `${locale}:${JSON.stringify(
    Object.entries(options).toSorted(([a], [b]) => a.localeCompare(b)),
  )}`;
}

function dateTimeFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = formatKey(locale, options);
  let formatter = dateTimeFormats.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormats.set(key, formatter);
  }

  return formatter;
}

function numberFormat(locale: string, options: Intl.NumberFormatOptions) {
  const key = formatKey(locale, options);
  let formatter = numberFormats.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormats.set(key, formatter);
  }

  return formatter;
}

/**
 * Formats a date into a readable date time string
 * By default has the format of DD/MM/YYYY, HH:MM:SS
 * Format can be configured, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 */
export function formatDateTime(
  locale: string,
  date: Date,
  options?: DateTimeFormatOptions,
): string {
  const configured = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // timeZone: config.config.timezone,
    format: 'locale',
    ...options,
  } satisfies DateTimeFormatOptions;
  const { format, ...intlOptions } = configured;
  const formatter = dateTimeFormat(locale, intlOptions);

  switch (format) {
    case 'locale':
      return formatter.format(date);
    case 'iso8601': {
      const parts = formatter.formatToParts(date);
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
  locale: string,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return numberFormat(locale, options ?? {}).format(value);
}

/**
 * Formats a number as a percentage (e.g., 0.05 becomes 5%)
 * Essentially just a convenience function for formatNumber with the options of style: "percent" and setting the minimum and maximumFractionDigits.
 */
export function formatPercent(
  locale: string,
  value: number,
  dp: number = 0,
  options?: Intl.NumberFormatOptions,
): string {
  return formatNumber(locale, value, {
    style: 'percent',
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
    ...options,
  });
}
