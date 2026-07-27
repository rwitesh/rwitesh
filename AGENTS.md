# Project Context & Agent Guide

This document contains full technical context, configuration options, directory structures, and deployment steps to help AI agents understand and edit the codebase safely.

## Core Stack
- **Framework:** Astro 7 (static HTML output)
- **Language:** TypeScript
- **Styling:** Pure CSS (no Tailwind, resets and variables in `src/styles/global.css`)
- **Hosting:** Cloudflare Workers (static assets)
- **CMS:** Sveltia CMS (CDNs in `src/pages/admin.astro`, config in `public/admin/config.yml`)

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

### 2. Blog Collection
- **Source:** `src/content/blog/`
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
| `public/robots.txt` | Search engine indexing & sitemap link |

> [!IMPORTANT]
> When changing the custom domain, update it in **both** `astro.config.mjs` (`site`) and `src/config/site.ts` (`url`).

---

## CMS (Sveltia CMS)

We use **Sveltia CMS** for Git-based browser editing via the native **File System Access API**.
- **Local Access:** Run the development server and visit `http://localhost:4321/admin/`.
- **Local Dev Editing:** Choose **"Work with Local Repository"**, select the root directory of this repository, and grand file permission. It writes changes directly to `src/content/`.
- **Zero Overhead:** Loaded via a CDN in `src/pages/admin.astro`. It has zero dependencies in `package.json`.

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
  content/blog/*.md       # blog posts
  content/pages/home.md   # home/about section content
  components/             # SEO, Header, Footer, PostCard, ...
  layouts/                # BaseLayout, BlogPostLayout
  lib/                    # reading-time remark plugin
  pages/                  # index, blog/index, blog/[slug], rss.xml.ts, 404, admin.astro
  styles/global.css       # resets, CSS variables, typography
content.config.ts         # content collection schemas
astro.config.mjs          # Astro settings (site URL, markdown config)
wrangler.jsonc            # Cloudflare Worker config
public/                   # robots.txt, favicon.svg, admin/ (Sveltia CMS config)
```

---

## Additional Tech Notes
- **Reading Time:** Calculated programmatically via a remark plugin at `src/lib/reading-time.ts`.
- **Dark Mode:** Implemented directly via CSS `prefers-color-scheme` media query. No JS or toggles are used.
