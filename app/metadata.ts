type Translate = (key: string) => string;

export const SITE = {
  name: 'BASS',
  url: 'https://bass.bobbo.dev/',
  title: 'BASS - Monster Hunter Armor Set Search',
  description:
    'Search and save armor sets for Monster Hunter Freedom and Monster Hunter Freedom Unite directly in your browser.',
  locale: 'en-US',
  robots: 'noindex, nofollow',
  twitterCard: 'summary',
  themeColor: {
    light: '#047857',
    dark: '#064e3b',
  },
} as const;

export function canonicalUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

export function documentTitle({
  gameSlug,
  path,
  ready,
  setName,
  translate,
}: {
  gameSlug?: string;
  path: string;
  ready: boolean;
  setName?: string;
  translate: Translate;
}): string {
  if (!ready) return SITE.title;
  if (!gameSlug) return `${translate('bass-title-full')} | ${SITE.name}`;

  const [, section, child] = path.split('/').filter(Boolean);
  if (!section)
    return `${translate(`game-${gameSlug}-title-full`)} | ${SITE.name}`;

  let pageTitle: string;
  if (section === 'search') {
    const key =
      child === 'skills'
        ? 'search-skills'
        : child === 'results'
          ? 'navigation-tab-results'
          : 'navigation-tab-search';
    pageTitle = translate(key);
  } else if (section === 'history') {
    pageTitle = translate('navigation-tab-history');
  } else if (section === 'sets') {
    pageTitle =
      child && setName?.trim()
        ? setName.trim()
        : translate('navigation-tab-sets');
  } else if (section === 'settings') {
    pageTitle = translate('settings');
  } else {
    pageTitle = translate('navigation-tab-home');
  }

  const gameTitle = translate(`game-${gameSlug}-title-short`);
  return `${pageTitle} | ${gameTitle} | ${SITE.name}`;
}
