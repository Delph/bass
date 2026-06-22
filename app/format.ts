import { useTranslation } from "~/composables/useTranslation";

/**
 * Formats a number nicely for reading
 * By default adds thousands separators
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const translation = useTranslation();
  locale ??= translation.locale;

  const format = new Intl.NumberFormat(locale, { ...options });
  return format.format(value);
}
