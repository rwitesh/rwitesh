# Rwitesh Bera — Portfolio & Blog

Static personal site + blog built with **Astro 7** (static output) and TypeScript.
No JS framework, no Tailwind — pure HTML/CSS, Markdown is the source of truth for content.
Deployed to **Cloudflare Workers** (static assets) via Workers Builds on push to `main`.

Canonical domain: `https://rwitesh.com`.

## Commands

```bash
npm install
npm run dev        # local dev server (http://localhost:4321)
npm run build      # static build -> dist/
npm run typecheck  # type-check .astro files
npm run deploy     # build + wrangler deploy (manual; CI runs them separately)
```

## CMS (Sveltia CMS)

The project includes **Sveltia CMS**, a lightweight, React-free, Git-based CMS that runs entirely in the browser using the native **File System Access API**.

* **Access the CMS locally:** Start the dev server (`npm run dev`) and visit `http://localhost:4321/admin/`.
* **Local Editing:** Click **"Work with Local Repository"**, select the project directory, and grant permission. The CMS will edit markdown files in `src/content/` directly.
* **Production/Live:** You can configure Sveltia to authenticate with GitHub using a Personal Access Token (PAT) for remote editing.
* **No Dependencies:** Since Sveltia CMS is loaded via a CDN in `src/pages/admin.astro` and configured via `public/admin/config.yml`, it adds zero npm packages, zero bundle size, and zero React overhead to the production build.


## Content

- **Blog posts:** `src/content/blog/*.md` — drop a file and it appears on the homepage, `/blog`, RSS, and sitemap.
- **About page:** `src/content/pages/about.md`.
- **Schemas:** `src/content.config.ts` (Zod-validated frontmatter).

Post frontmatter:

```yaml
---
title: "Post title"        # required
pubDate: 2026-01-15        # required (YYYY-MM-DD)
description: "Summary"     # optional — listings, SEO, RSS
tags: ["x", "y"]           # optional
draft: false               # optional — hidden in prod, visible in dev
---
```

## Config

| File | Controls |
|------|----------|
| `src/config/site.ts` | title, description, author, url, social, nav |
| `astro.config.mjs` | `site` URL (drives canonical/RSS/sitemap), markdown + shiki |
| `wrangler.jsonc` | Cloudflare Worker: `./dist` as static assets, 404-page handling |
| `public/robots.txt` | robots + sitemap reference |

When changing the domain, update it in **both** `astro.config.mjs` (`site`) and `src/config/site.ts` (`url`).

## Deploy (Cloudflare Workers)

Workers Builds watches `main`. On push: `npm ci` → `npm run build` → `npx wrangler deploy`.
The Worker is named **`portfolio`**; `wrangler.jsonc` serves `dist/` as static assets.
Custom-domain route for `rwitesh.com` is documented (commented) in `wrangler.jsonc`.

## Layout

```
src/
  config/site.ts          # site config (title, url, social, nav)
  content/blog/*.md       # blog posts
  content/pages/about.md  # about section
  components/             # SEO, Header, Footer, PostCard, ...
  layouts/                # BaseLayout, BlogPostLayout
  lib/                    # reading-time remark plugin
  pages/                  # index, blog/index, blog/[slug], rss.xml.ts, 404, admin.astro (Sveltia CMS page)
  styles/global.css       # resets, CSS variables, typography
content.config.ts         # content collection schemas
astro.config.mjs          # site URL, markdown/shiki config
wrangler.jsonc            # Cloudflare Worker config
public/                   # robots.txt, favicon.svg, prompt.md, admin/ (Sveltia CMS)
```

## Notes

- Content via Astro Content Collections (`glob()` loader) with Zod schemas.
- Reading time: remark plugin (`src/lib/reading-time.ts`).
- Dark mode via `prefers-color-scheme` — no toggle, no JS.

License: MIT.
