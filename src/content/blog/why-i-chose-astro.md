---
title: "Why I Chose Astro for This Blog"
description: "A short note on engineering choices: static-first, content-first, zero JS by default."
pubDate: 2026-06-07
tags: ["astro", "web", "tooling"]
draft: false
---

I rebuild my blog occasionally. Each time I try a different framework. This time I chose [Astro](https://astro.build).

## Why Astro

The requirements were simple:

- Markdown as the source of truth
- Static generation, no server needed
- Zero JavaScript by default
- Content collections with type safety
- Good enough DX to make writing pleasant

Astro hits all of these. Content collections give me a Zod schema for frontmatter, type-safe queries, and automatic routing. The build is fast. The output is HTML.

## What I Avoided

- No React. Not every site needs a SPA. This one certainly doesn't.
- No Tailwind. For a site this small, a single CSS file with variables is cleaner and more maintainable.
- No component library. The aesthetic is deliberately minimal — there's nothing for a library to solve.

## The Result

A site that loads instantly, builds in seconds, and where adding a post is literally just dropping a `.md` file into a directory. That's the right level of complexity for a personal blog.