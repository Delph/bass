export const languages = {
  en: {
    name: "English"
  },
  fr: {
    name: "Français"
  }
} as const;

/// the two character language code, e.g., "en", "fr", or "jp"
export type LanguageSlug = keyof typeof languages;

export type PluralTranslation = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;
export type Translations = Record<string, string | PluralTranslation>;
export type TranslationVariables = Record<string, any>;

export function translate(
  language: LanguageSlug,
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

    const rule = count === 0 && message.zero ? 'zero' : new Intl.PluralRules(language).select(count);
    message = message[rule] ?? message.other ?? key;
  }

  for (const [from, to] of Object.entries(variables)) {
    message = message.replaceAll(`{${from}}`, String(to));
  }

  return message;
}
