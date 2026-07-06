import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/reading-time.ts';
import { rehypeExternalLinks } from './src/lib/external-links.ts';

export default defineConfig({
  site: 'https://rwitesh.com',
  integrations: [sitemap()],
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