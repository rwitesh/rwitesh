import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/reading-time.ts';
import { rehypeExternalLinks } from './src/lib/external-links.ts';

import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://rwitesh.com',
  integrations: [
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  fonts: [{
    provider: fontProviders.fontsource(),
    name: "Lora",
    cssVariable: "--font-lora",
  }],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [rehypeExternalLinks],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});