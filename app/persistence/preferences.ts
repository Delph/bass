import type { LanguageSlug } from "~/translation";

export type Theme = 'system' | 'light' | 'dark';

export type Preferences = {
  theme: Theme;
  language: LanguageSlug;
};
