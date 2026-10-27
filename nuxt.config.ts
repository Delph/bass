// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite';
import lucidePackage from '@iconify-json/lucide/package.json';
import licensePlugin from 'rollup-plugin-license';
import lucideNotice from './licenses/lucide.json';
import packageJson from './package.json';
import { SITE } from './app/metadata';
import { pick } from './app/utility';

if (lucideNotice.version !== lucidePackage.version) {
  throw new Error(
    `Lucide license notice targets ${lucideNotice.version}, but ${lucidePackage.version} is installed`,
  );
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    head: {
      htmlAttrs: { lang: SITE.locale },
      title: SITE.title,
      link: [
        { rel: 'canonical', href: SITE.url },
        { rel: 'license', href: '/licenses.json' },
      ],
      script: [
        {
          src: 'https://umami.delph.dev/script.js',
          defer: true,
          'data-website-id': '1163a06d-48e2-4dc3-917b-562ec19f45dc',
        },
      ],
      meta: [
        { name: 'description', content: SITE.description },
        { name: 'application-name', content: SITE.name },
        { name: 'robots', content: SITE.robots },
        {
          name: 'theme-color',
          content: SITE.themeColor.light,
          media: '(prefers-color-scheme: light)',
        },
        {
          name: 'theme-color',
          content: SITE.themeColor.dark,
          media: '(prefers-color-scheme: dark)',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE.name },
        { property: 'og:title', content: SITE.title },
        { property: 'og:description', content: SITE.description },
        { property: 'og:url', content: SITE.url },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: SITE.twitterCard },
        { name: 'twitter:title', content: SITE.title },
        { name: 'twitter:description', content: SITE.description },
      ],
    },
  },

  components: false,
  imports: {
    autoImport: false,
    dirs: [],
  },
  modules: ['@nuxt/icon'],
  runtimeConfig: {
    public: {
      appVersion: packageJson.version,
      rollbarAccessToken: process.env.ROLLBAR_CLIENT_TOKEN ?? '',
    },
  },
  sourcemap: {
    client: 'hidden',
    server: false,
  },
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (!isClient) return;

      config.plugins?.push(
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
                return JSON.stringify(
                  [
                    ...dependencies.map((dependency) => ({
                      ...pick(dependency, [
                        'name',
                        'version',
                        'license',
                        'licenseText',
                        'noticeText',
                      ]),
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
