/// <reference types="@cloudflare/workers-types" />
import { handleUpvote } from './lib/api';

export interface Env {
  DB?: D1Database;
  ASSETS: Fetcher;
  HASH_SALT?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Router
    if (url.pathname.startsWith('/api/')) {
      // Environment Config Guard
      if (!env.HASH_SALT || !env.DB) {
        console.error('[API Config Error] HASH_SALT secret or DB binding is missing in Worker environment.');
        return Response.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }

      // GET /api/upvote — all posts; GET /api/upvote?slug=... — one post; POST — upvote
      if (url.pathname === '/api/upvote') {
        return handleUpvote(request, env.DB, env.HASH_SALT);
      }

      return Response.json({ error: 'Route not found' }, { status: 404 });
    }

    // Static Asset fallback (Astro static pages from ./dist)
    return env.ASSETS.fetch(request);
  }
};
