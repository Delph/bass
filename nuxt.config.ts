// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite';
import colors from 'tailwindcss/colors';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from './app/metadata';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    head: {
      htmlAttrs: { lang: 'en-US' },
      title: SITE_TITLE,
      link: [{ rel: 'canonical', href: SITE_URL }],
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
