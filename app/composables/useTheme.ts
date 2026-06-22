import type { Theme } from "~/persistence/preferences";
import { usePreferences } from "./usePreferences";

export function useTheme() {
  const { theme, setTheme } = usePreferences();

  function resolve(): Theme {
    if (theme.value === 'system')
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return theme.value;
  }

  function apply() {
    document.documentElement.classList.toggle('dark', resolve() === 'dark');
  }

  function set(theme: Theme) {
    setTheme(theme);
    apply();
  }

  apply();

  return {
    theme,
    set
  };
}
