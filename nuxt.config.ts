// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite';
import lucidePackage from '@iconify-json/lucide/package.json';
import licensePlugin from 'rollup-plugin-license';
import colors from 'tailwindcss/colors';
import lucideNotice from './licenses/lucide.json';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from './app/metadata';

if (lucideNotice.version !== lucidePackage.version) {
  throw new Error(
    `Lucide license notice targets ${lucideNotice.version}, but ${lucidePackage.version} is installed`,
  );
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    head: {
      htmlAttrs: { lang: 'en-US' },
      title: SITE_TITLE,
      link: [
        { rel: 'canonical', href: SITE_URL },
        { rel: 'license', href: '/licenses.json', type: 'application/json' },
      ],
      meta: [
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'application-name', content: SITE_NAME },
        { name: 'robots', content: 'noindex, nofollow' },
        {
          name: 'theme-color',
          content: colors.emerald[700],
          media: '(prefers-color-scheme: light)',
        },
        {
          name: 'theme-color',
          content: colors.emerald[900],
          media: '(prefers-color-scheme: dark)',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:title', content: SITE_TITLE },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: SITE_TITLE },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
      ],
    },
  },

  components: false,
  imports: {
    autoImport: false,
    dirs: [],
  },
  modules: ['@nuxt/icon'],
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (!isClient) return;

      config.plugins ??= [];
      config.plugins.push(
        licensePlugin({
          thirdParty: {
            includeSelf: true,
            multipleVersions: true,
            allow: {
              test: (dependency) =>
                Boolean(dependency.licenseText) &&
                !dependency.license?.toUpperCase().includes('GPL'),
              failOnUnlicensed: true,
              failOnViolation: true,
            },
            output: {
              file: 'public/licenses.json',
              template: (dependencies) => {
                if (
                  dependencies.some(
                    (dependency) => dependency.name === lucideNotice.name,
                  )
                ) {
                  throw new Error(
                    'Lucide is now detected automatically; remove its explicit license notice',
                  );
                }

                return JSON.stringify(
                  [
                    ...dependencies.map((dependency) => ({
                      name: dependency.name,
                      version: dependency.version,
                      license: dependency.license,
                      licenseText: dependency.licenseText,
                      noticeText: dependency.noticeText,
                      author: dependency.author?.text() ?? null,
                      source:
                        typeof dependency.repository === 'string'
                          ? dependency.repository
                          : (dependency.repository?.url ?? dependency.homepage),
                    })),
                    {
                      ...lucideNotice,
                      licenseText: lucideNotice.licenseText.join('\n'),
                      noticeText: null,
                    },
                  ].sort((a, b) =>
                    `${a.name}@${a.version}`.localeCompare(
                      `${b.name}@${b.version}`,
                    ),
                  ),
                  null,
                  2,
                );
              },
            },
          },
        }),
      );
    },
  },
  icon: {
    provider: 'none',
    fallbackToApi: false,
    clientBundle: {
      scan: {
        globInclude: ['app/**/*.{ts,vue}'],
      },
    },
  },
  $development: {
    icon: {
      provider: 'server',
    },
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  vite: {
    build: {
      target: ['chrome114', 'firefox128', 'safari17'],
    },
    plugins: [tailwindcss()],
  },
  ssr: false,
});
