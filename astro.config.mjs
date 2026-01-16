// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://erickchan.dev',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-MX',
          en: 'en-US',
        },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  vite: {
    css: {
      devSourcemap: true,
    },
    build: {
      cssCodeSplit: true,
    },
  },

  security: {
    checkOrigin: true,
  },
});
