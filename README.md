# Rwitesh Bera — Portfolio & Blog

A minimal, content-first personal blog built with **Astro + TypeScript**. Designed to feel like a programmer's notebook: JetBrains Mono typography, small fonts, dark/light mode via system preference, and zero unnecessary JavaScript.

Markdown is the single source of truth. Drop a `.md` file in `src/content/blog/` and it appears everywhere — homepage, blog listing, RSS, sitemap. No manual registration.

---

## Quick Start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs static site to dist/
npm run preview  # preview production build
npm run typecheck # type-check .astro files
```

## Tech Stack

| Purpose           | Tool                          |
|-------------------|-------------------------------|
| Framework         | Astro v7 (static output)      |
| Language          | TypeScript                    |
| Content           | Content Collections + glob loader |
| Styling           | Plain CSS with variables      |
| Typography        | JetBrains Mono (Google Fonts) |
| Syntax highlighting | Shiki (built-in, dual theme) |
| RSS               | `@astrojs/rss`                |
| Sitemap           | `@astrojs/sitemap`            |
| Reading time      | `reading-time` + remark plugin|

No React. No Tailwind. No component libraries.

---

## Project Structure

```
src/
  config/
    site.ts              # ← ALL site config: title, nav, social links, etc.
  content/
    blog/                # Blog posts (markdown)
      *.md
    pages/               # Static page content (markdown)
      about.md
  components/
    SEO.astro            # Meta tags, OG, Twitter cards, canonical, RSS link
    Header.astro         # Top navigation (left/center/right)
    Footer.astro         # Minimal footer
    PostCard.astro       # Blog post preview card (used in listings)
    FormattedDate.astro  # Date formatter component
  layouts/
    BaseLayout.astro     # Shell: seo + header + main + footer
    BlogPostLayout.astro # Article wrapper: title, date, tags, reading time
  lib/
    reading-time.ts      # Remark plugin + standalone reading time utility
  pages/
    index.astro          # Home: hero, about, recent posts
    blog/
      index.astro        # Blog listing (all posts, newest first)
      [slug].astro       # Individual blog post route
    404.astro            # Not found page
    rss.xml.ts           # RSS feed endpoint
  styles/
    global.css          # Global CSS: resets, variables, typography
content.config.ts        # Content collection schemas (blog + pages)
astro.config.mjs         # Astro config: sitemap, markdown processor, shiki
public/
  robots.txt             # Robots + sitemap reference
  favicon.svg
```

---

## Configuration

Everything is in **`src/config/site.ts`**:

```ts
export const SITE = {
  title: 'Rwitesh Bera',
  description: '...',
  author: 'Rwitesh Bera',
  url: 'https://rwitesh.dev',
  email: 'rwiteshbera@gmail.com',
  social: {
    github: 'https://github.com/rwitesh',
    x: 'https://x.com/rwiteshbera',
    linkedin: 'https://www.linkedin.com/in/rwiteshbera',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Blogs', href: '/blog' },
  ],
  // ...
};
```

Also set your production URL in `astro.config.mjs` (`site` field) — this drives canonical URLs, RSS links, and sitemap.

---

## Adding a New Blog Post

1. Create a markdown file in `src/content/blog/`:

   ```
   src/content/blog/my-new-post.md
   ```

2. Add frontmatter:

   ```yaml
   ---
   title: "My New Post"
   description: "A short summary for SEO and listings."
   pubDate: 2026-01-15
   tags: ["tag1", "tag2"]
   draft: false
   ---
   ```

3. Write your content in markdown below the frontmatter.

4. That's it. The post automatically appears on:
   - Homepage (under "recent posts", latest 5)
   - `/blog` listing
   - RSS feed (`/rss.xml`)
   - Sitemap (`/sitemap-index.xml`)

### Frontmatter Reference

| Field         | Type       | Required | Notes                              |
|---------------|------------|----------|------------------------------------|
| `title`       | string     | yes      | Post title                         |
| `description` | string     | no       | Used in listings, SEO, RSS         |
| `pubDate`     | date       | yes      | Publication date (YYYY-MM-DD)      |
| `updatedDate` | date       | no       | Shows "updated" badge              |
| `tags`        | string[]   | no       | Defaults to empty array            |
| `draft`       | boolean    | no       | Hidden in production, visible in dev |

### Supported Markdown Features

- Headings (h1–h6) with auto-generated anchor IDs
- Tables (GFM)
- Code blocks with syntax highlighting (Shiki, dual light/dark)
- Images
- Footnotes
- Blockquotes
- Ordered/unordered lists
- Inline code
- Horizontal rules

---

## Editing the About Section

The homepage "About" section content lives in:

```
src/content/pages/about.md
```

Edit that file to update your bio. The frontmatter needs `title` and optionally `description`.

---

## Updating Navigation

Nav links are defined in `src/config/site.ts` under `SITE.nav`. Add or remove entries there — the header renders them automatically.

---

## SEO

Each page includes:
- Canonical URL
- Meta description
- Open Graph tags (title, description, url, site_name, image)
- Twitter card tags
- RSS auto-discovery `<link>`
- Sitemap reference

Blog posts additionally include:
- `article:published_time`
- `article:tag` for each tag
- `og:type = "article"`

**robots.txt** is at `public/robots.txt` and references the sitemap.

---

## Dark Mode

The site uses `prefers-color-scheme` — no toggle, no JS. Colors are defined as CSS variables in `src/styles/global.css` and automatically switch when the OS theme changes.

---

## Deployment

The build output is fully static (`dist/`), so it works on any static host.

### Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Dashboard → Pages → Create project → Connect to Git.
3. Settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment:** Node 18+
4. Deploy.

### Netlify

1. Push this repo to GitHub.
2. In Netlify → Add new site → Import from Git.
3. Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy.

### Vercel

1. Push this repo to GitHub.
2. In Vercel → New Project → Import.
3. Vercel auto-detects Astro. Defaults are correct:
   - **Build command:** `astro build` (or `npm run build`)
   - **Output directory:** `dist`
4. Deploy.

> **Important:** After deploying, update `site` in `astro.config.mjs` and `SITE.url` in `src/config/site.ts` to your final domain. This ensures canonical URLs, RSS, and sitemap are correct.

---

## Architecture Notes

- **Content Collections** (`src/content.config.ts`): Uses the `glob()` loader from `astro/loaders` with Zod schemas for type-safe frontmatter validation.
- **Reading time**: Computed via a remark plugin (`src/lib/reading-time.ts`) for article pages, and via a standalone utility from raw body text for listing pages (avoids rendering every post on the homepage).
- **Zero JS**: Astro ships no JavaScript by default. The site is pure HTML + CSS.
- **Fonts**: JetBrains Mono loaded from Google Fonts with `preconnect` for performance.

---

## License

MIT