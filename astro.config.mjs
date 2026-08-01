import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import { remarkReadingTime } from './src/lib/reading-time.ts';
import { rehypeExternalLinks } from './src/lib/external-links.ts';
import { rehypeHeadingAnchors } from './src/lib/heading-anchors.ts';

export default defineConfig({
  site: 'https://rwitesh.com',
  integrations: [
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/_edit'),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['100 800'],
      styles: ['normal'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      weights: ['400 700'],
      styles: ['normal'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [
        rehypeSlug,
        rehypeHeadingAnchors,
        rehypeExternalLinks,
      ],
    }),
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'min-dark',
      },
      defaultColor: false,
    },
  },
});