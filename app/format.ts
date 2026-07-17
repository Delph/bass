import { IntlFormatter } from './IntlFormatter';
import { bound } from './utility';

const intlformatter = new IntlFormatter();

/**
 * Format options for formatBytes
 */
type ByteFormatOptions = {
  /// number format options, a-la formatNumber
  number: Intl.NumberFormatOptions;
  /// if true, use SI units (megabytes, multiplies of 1,000 vs mibibytes, multiples of 1,024)
  si: boolean;
};

/**
 * Formats a number of bytes into a nice representation with the size of the unit calculated.
 * The magnitude of the unit (e.g., Kilo, Mega, Giga) is calculated and then the number is formatted using formatNumber with the `number` object from `options`. The default number format options are `{}`.
 * `options.si` defauls to true, and if so formats the number as an SI value. e.g.
 *    si == true: 1,000,000,000 => 1 GB
 *    si == false: 1,024 => 1 KiB
 */
export function formatBytes(
  locale: string,
  bytes: number,
  options?: Partial<ByteFormatOptions>,
): string {
  const defaults: ByteFormatOptions = {
    number: {},
    si: true,
  };
  if (isNaN(bytes)) return 'NaN';

  options = { ...defaults, ...options };

  const units = ['K', 'M', 'G', 'T', 'P'] as const;
  const [base, log, divider, suffix] = options.si
    ? [1000, Math.log10, 3, 'B']
    : [1024, Math.log2, 10, 'iB'];
  const absolute = Math.abs(bytes);

  if (absolute < base) {
    return `${bytes} B`;
  }
  const exponent = Math.min(Math.floor(log(absolute) / divider), units.length);

  const n = formatNumber(locale, absolute / base ** exponent, options.number);
  return `${bytes < 0 ? '-' : ''}${n} ${units[exponent - 1]}${suffix}`;
}

export type DateTimeFormatOptions = Intl.DateTimeFormatOptions & {
  /// custom formatter option, either "locale", to format to whatever the locale says or "iso8601" which is not quite standard
  format?: 'locale' | 'iso8601';
};

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

  switch (format) {
    case 'locale':
      const formatter = intlformatter.datetime(locale, intlOptions);
      return formatter.format(date);
    case 'iso8601': {
      const formatter = intlformatter.datetime(locale, {
        ...intlOptions,
        hour12: false,
      });
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
  return intlformatter.number(locale, options ?? {}).format(value);
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

/**
 * Formats a number as an ordinal (e.g., 1st, 2nd, 3rd, etc)
 * Calls formatNumber under the hood to format nicely (e.g., 1,001st).
 */
export function formatOrdinal(locale: string, value: number): string {
  const formatted = formatNumber(locale, value);
  const h = value % 100;
  if (h >= 11 && h <= 13) return `${formatted}th`;
  const d = value % 10;
  if (d > 0 && d < 4) return `${formatted}${['st', 'nd', 'rd'][d - 1]}`;
  return `${formatted}th`;
}

/**
 * Format options for formatSI
 */
type SIFormatOptions = {
  /// number format options, a-la formatNumber
  number: Intl.NumberFormatOptions;

  /// use the symbol (e.g., k) or the name (e.g., kilo) for the unit
  prefix: 'symbol' | 'name';

  minimumExponent: number;
  maximumExponent: number;
};

/**
 * Formats a unit into a nice representation with the proper SI prefix on the unit.
 * The magnitude of the unit (e.g., kilo) is calculated and then the number is formatted using formatNumber with the `number` object from `options`. The default number format options are `{}`.
 */
export function formatSI(
  locale: string,
  value: number | undefined,
  unit?: string,
  options?: Partial<SIFormatOptions>,
): string {
  const defaults: SIFormatOptions = {
    number: {},
    prefix: 'symbol',
    minimumExponent: -Infinity,
    maximumExponent: Infinity,
  };
  const opts = { ...defaults, ...options } as SIFormatOptions;
  if (value === undefined || isNaN(value)) return 'NaN';

  const absolute = Math.abs(value);

  const units = [
    { name: 'pico', symbol: 'p' },
    { name: 'nano', symbol: 'n' },
    { name: 'micro', symbol: 'u' },
    { name: 'milli', symbol: 'm' },
    { name: '', symbol: '' },
    { name: 'kilo', symbol: 'k' },
    { name: 'mega', symbol: 'M' },
    { name: 'giga', symbol: 'G' },
    { name: 'tera', symbol: 'T' },
    { name: 'peta', symbol: 'P' },
  ] as const;
  const offset = units.findIndex((u) => u.name === '');
  const exponent = bound(
    Math.floor(Math.log10(absolute) / 3), // compute the exponent
    Math.max(0 - offset, opts.minimumExponent), // clamp to the provided min exponent, or the first array entry
    Math.min(units.length - offset - 1, opts.maximumExponent), // clamp to the provided max exponent, or the last array entry
  );
  const prefix =
    absolute === Infinity || absolute === 0.0
      ? '' // no prefix for inf or 0 value
      : units[exponent + offset]![opts.prefix];

  let formatted = '';
  if (value < 0) formatted += '-';
  formatted += formatNumber(locale, absolute / 1000 ** exponent, opts.number);
  const unitStr = `${prefix}${unit ?? ''}`;
  if (unitStr) formatted += ` ${unitStr}`;
  return formatted;
}
