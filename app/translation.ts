export const defaultLocale = 'en-US';

export const locales = {
  'en-US': {
    name: 'English (US)',
  },
} as const;

export type LocaleSlug = keyof typeof locales;

export type PluralTranslation = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;
export type Translations = Record<string, string | PluralTranslation>;
export type TranslationVariables = Record<string, any>;

export function translate(
  locale: LocaleSlug,
  translations: Translations,
  key: string,
  variables: TranslationVariables = {}
) {
  let message = translations[key];

  if (message === undefined)
    return key;

  if (typeof message !== 'string') {
    const count = Number(variables.count);
    if (!Number.isFinite(count))
      throw new Error(`Plural translation "${key}" requires a finite numeric count variable.`);

    const rule = count === 0 && message.zero ? 'zero' : new Intl.PluralRules(locale).select(count);
    message = message[rule] ?? message.other ?? key;
  }

  for (const [from, to] of Object.entries(variables)) {
    message = message.replaceAll(`{${from}}`, String(to));
  }

  return message;
}
