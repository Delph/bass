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
    clientBundle: {
      scan: true,
      icons: [
        'lucide:bookmark-check',
        'lucide:bookmark-plus',
        'lucide:bow-arrow',
        'lucide:check',
        'lucide:circle-help',
        'lucide:component',
        'lucide:copy',
        'lucide:pause',
        'lucide:play',
        'lucide:save',
        'lucide:search',
        'lucide:shield',
        'lucide:shovel',
        'lucide:sword',
        'lucide:swords',
        'lucide:tag',
        'lucide:tractor',
        'lucide:triangle-alert',
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  vite: {
    build: {
      target: ['chrome111', 'firefox128', 'safari16.4'],
    },
    plugins: [tailwindcss()],
  },
  ssr: false,
});
