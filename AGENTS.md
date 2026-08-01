# Project Context & Agent Guide

This document contains full technical context, configuration options, directory structures, and deployment steps to help AI agents understand and edit the codebase safely.

## Core Stack
- **Framework:** Astro 7 (static HTML output)
- **Language:** TypeScript
- **Styling:** Pure CSS (no Tailwind, resets and variables in `src/styles/global.css`)
- **Hosting:** Cloudflare Workers (static assets)
- **CMS:** Pages CMS (hosted GitHub app; config in `.pages.yml`, edited at https://app.pagescms.org)

---

## Content Collections & Schema

All content is managed through Astro Content Collections, defined in `src/content.config.ts`.

### 1. Pages Collection
- **Source:** `src/content/pages/`
- **Entries:**
  - `home.md`: Content rendered on the homepage (previously `about.md`).
- **Zod Schema:**
  ```typescript
  {
    title: z.string(),
    description: z.string().optional()
  }
  ```

### 2. Posts Collection
- **Source:** `src/content/posts/`
- **Zod Schema & Frontmatter Example:**
  ```yaml
  ---
  title: "Post title"        # required
  pubDate: 2026-01-15        # required (YYYY-MM-DD)
  description: "Summary"     # optional — listings, SEO, RSS
  tags: ["x", "y"]           # optional
  draft: false               # optional — hidden in prod, visible in dev
  ---
  ```

---

## Configuration Files

| File | Controls |
|------|----------|
| `src/config/site.ts` | Site meta: title, description, author, canonical URL, social handles, nav links |
| `astro.config.mjs` | Astro configuration (e.g. `site` URL, Markdown syntax highlighting with Shiki) |
| `wrangler.jsonc` | Cloudflare Workers configuration (specifies `./dist` static assets, 404 routing) |
| `.pages.yml` | Pages CMS configuration — collections, fields, media storage |
| `public/robots.txt` | Search engine indexing & sitemap link |

> [!IMPORTANT]
> When changing the custom domain, update it in **both** `astro.config.mjs` (`site`) and `src/config/site.ts` (`url`).

---

## CMS (Pages CMS)

We use **Pages CMS** for Git-based browser editing. It is a hosted GitHub app — no code runs in this repo.
- **Editor:** Visit https://app.pagescms.org and sign in with GitHub.
- **Config:** `.pages.yml` at the repo root defines the collections (`posts`, `pages`) and fields, mirroring the Zod schema in `src/content.config.ts`.
- **Storage:** All edits are committed straight to this repository as Markdown (Git is the source of truth), then redeployed by Cloudflare Workers Builds.
- **Media:** Images upload to `public/images` and are referenced in Markdown as `/images/<file>`.
- **No server/route needed:** There is no `/admin` route or CDN script — the entire admin UI is hosted by Pages CMS.

---

## Deployment (Cloudflare Workers)

Deployment is managed via **Workers Builds** connected to the GitHub repository:
1. Pushes to `main` trigger the build.
2. Build commands executed by Cloudflare: `npm ci` → `npm run build` → `npx wrangler deploy`.
3. The worker serves files from the `dist/` directory.

---

## Project Layout

```
src/
  config/site.ts          # site config (title, url, social, nav)
  content/posts/*.md      # posts
  content/pages/home.md   # home/about section content
  components/             # SEO, Header, Footer, PostCard, ...
  layouts/                # BaseLayout, PostLayout
  lib/                    # remark plugins (reading-time)
  pages/                  # index, post/index, post/[slug], rss.xml.ts, 404
  styles/global.css       # resets, CSS variables, typography
content.config.ts         # content collection schemas
astro.config.mjs          # Astro settings (site URL, markdown config)
wrangler.jsonc            # Cloudflare Worker config
public/                   # robots.txt, favicon.svg, images/
```

---

## Additional Tech Notes
- **Reading Time:** Calculated programmatically via a remark plugin at `src/lib/reading-time.ts`.
- **Dark Mode:** Implemented directly via CSS `prefers-color-scheme` media query. No JS or toggles are used.
