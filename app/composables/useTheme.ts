import { computed, onScopeDispose, ref, watch } from 'vue';

import { resolveTheme, THEME_MEDIA_QUERY, type Theme } from '~/theme';
import { usePreferences } from './usePreferences';

export function useTheme() {
  const { theme, setTheme } = usePreferences();

  function set(theme: Theme) {
    setTheme(theme);
  }

  return {
    theme,
    set,
  };
}

export function useThemeSync() {
  const { theme } = useTheme();
  const media = window.matchMedia(THEME_MEDIA_QUERY);
  const systemDark = ref(media.matches);
  const resolved = computed(() => resolveTheme(theme.value, systemDark.value));

  function syncSystemTheme(event: MediaQueryListEvent) {
    systemDark.value = event.matches;
  }

  media.addEventListener('change', syncSystemTheme);
  watch(
    resolved,
    (value) => {
      document.documentElement.classList.toggle('dark', value === 'dark');
    },
    { immediate: true },
  );
  onScopeDispose(() => media.removeEventListener('change', syncSystemTheme));
}
