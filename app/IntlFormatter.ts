export class IntlFormatter {
  private readonly dateTimeFormats: Map<string, Intl.DateTimeFormat>;
  private readonly numberFormats: Map<string, Intl.NumberFormat>;

  constructor() {
    this.dateTimeFormats = new Map<string, Intl.DateTimeFormat>();
    this.numberFormats = new Map<string, Intl.NumberFormat>();
  }

  private cacheKey(locale: string, options: object) {
    return `${locale}:${JSON.stringify(
      Object.entries(options).toSorted(([a], [b]) => a.localeCompare(b)),
    )}`;
  }

  datetime(locale: string, options: Intl.DateTimeFormatOptions) {
    const key = this.cacheKey(locale, options);
    let formatter = this.dateTimeFormats.get(key);

    if (formatter === undefined) {
      formatter = new Intl.DateTimeFormat(locale, options);
      this.dateTimeFormats.set(key, formatter);
    }

    return formatter;
  }

  number(locale: string, options: Intl.NumberFormatOptions) {
    const key = this.cacheKey(locale, options);
    let formatter = this.numberFormats.get(key);

    if (formatter === undefined) {
      formatter = new Intl.NumberFormat(locale, options);
      this.numberFormats.set(key, formatter);
    }

    return formatter;
  }
}
