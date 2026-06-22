import { useState } from "#app";
import { computed } from "vue";
import type { Preferences, Theme } from "~/persistence/preferences";
import { defineBucket } from "~/persistence/storage";
import type { LanguageSlug } from "~/translation";


const bucket = defineBucket<Preferences>({
  key: "bass:preferences",
  version: 0,
  initial: {
    theme: 'system',
    language: 'en'
  },
  migrate: function (version: number, stored: unknown) {
    return stored as Preferences;
  }
})

export function usePreferences() {
  const preferences = useState<Preferences>('preferences', bucket.load);

  const theme = computed(() => preferences.value.theme);
  const language = computed(() => preferences.value.language);

  function setTheme(theme: Theme) {
    preferences.value.theme = theme;
    bucket.save(preferences.value);
  }

  function setLanguage(language: LanguageSlug) {
    preferences.value.language = language;
    bucket.save(preferences.value);
  }

  return {
    theme,
    setTheme,
    language,
    setLanguage
  }
}
