export type Theme = 'system' | 'light' | 'dark';
export type ResolvedTheme = Exclude<Theme, 'system'>;

export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemDark ? 'dark' : 'light';

  return theme;
}
