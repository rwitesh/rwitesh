# Project Guide

Technical context for agents and contributors.

## Stack

- Astro 7 (static), TypeScript, pure CSS (`src/styles/global.css`)
- Cloudflare Workers serving `dist/`
- Markdown content in `src/content/`, schema in `src/content.config.ts`
- Sveltia CMS at `/_edit/index.html` (GitHub PAT, not indexed)

## Content collections

**Pages** — `src/content/pages/`

| Field | Type |
|-------|------|
| `title` | string |
| `description` | string, optional |

Entry: `home.md` (homepage body).

**Posts** — `src/content/posts/`

| Field | Type |
|-------|------|
| `title` | string |
| `date` | date (`YYYY-MM-DD`) |
| `description` | string, optional — SEO, RSS |
| `tags` | string[], optional |
| `draft` | boolean, default `false` — hidden in production |

## Key files

| File | Purpose |
|------|---------|
| `src/config/site.ts` | Site meta, nav, social |
| `astro.config.mjs` | Site URL, sitemap, markdown |
| `wrangler.jsonc` | Cloudflare Workers config |
| `public/_edit/` | Sveltia CMS (`index.html`, `config.yml`) |
| `public/robots.txt` | Crawler rules |

Change `site` in `astro.config.mjs` and `url` in `src/config/site.ts` together when updating the domain.

## CMS

`https://rwitesh.com/_edit/index.html` — unlinked, `noindex`, excluded from sitemap and `robots.txt`.

- Auth: GitHub PAT (repo write)
- Config: `public/_edit/config.yml` mirrors `src/content.config.ts`
- Media: `public/images/` → `/images/<file>`

## Deploy

Push to `main` → Cloudflare Workers Builds: `npm ci` → `npm run build` → `npx wrangler deploy`.

## Layout

```
src/
  config/site.ts
  content/{posts,pages}/
  components/
  layouts/
  lib/              # remark plugins (reading-time)
  pages/
  styles/global.css
content.config.ts
astro.config.mjs
wrangler.jsonc
public/
```

Reading time: `src/lib/reading-time.ts`. Dark mode: `prefers-color-scheme` only, no JS toggle.
