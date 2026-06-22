import { useState } from "#app";

import { type LanguageSlug, type Translations, type TranslationVariables, translate as tr } from "~/translation";
import { usePreferences } from "./usePreferences";


export function useTranslation() {
  const { language, setLanguage } = usePreferences();
  const locale = "en-GB"; // TODO: hook this up properly
  const translations = useState<Translations>("translation-messages", () => ({}));
  const pending = useState("translation-pending", () => false);
  const ready = useState("translation-ready", () => false);

  async function set(slug: LanguageSlug) {
    if (language.value === slug && ready.value)
      return;

    pending.value = true;

    try {
      translations.value = await $fetch<Translations>(`/translations/${encodeURIComponent(slug)}.json`);
      setLanguage(slug);
      ready.value = true;
    } finally {
      pending.value = false;
    }
  }

  function translate(key: string, variables: TranslationVariables = {}) {
    return tr(language.value, translations.value, key, variables)
  }

  set(language.value);

  return {
    language,
    locale,
    pending,
    ready,
    set,
    translate
  };
}
