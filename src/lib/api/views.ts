/// <reference types="@cloudflare/workers-types" />
import { isValidSlug } from './utils';

export async function handleViews(request: Request, db: D1Database): Promise<Response> {
  const url = new URL(request.url);

  // GET /api/views?slug=...
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!isValidSlug(slug)) {
      return Response.json({ error: 'Invalid slug' }, { status: 400 });
    }

    try {
      const statsRow = await db.prepare(
        'SELECT views FROM post_stats WHERE slug = ?'
      ).bind(slug).first<{ views: number }>();

      return Response.json({
        count: statsRow?.views ?? 0
      });
    } catch (err) {
      console.error('Error fetching view count:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  // POST /api/views (Increments post view count in post_stats)
  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { slug?: string };
      const slug = body?.slug;

      if (!isValidSlug(slug)) {
        return Response.json({ error: 'Invalid slug' }, { status: 400 });
      }

      await db.prepare(
        'INSERT INTO post_stats (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1'
      ).bind(slug).run();

      const statsRow = await db.prepare(
        'SELECT views FROM post_stats WHERE slug = ?'
      ).bind(slug).first<{ views: number }>();

      return Response.json({
        count: statsRow?.views ?? 1
      });
    } catch (err) {
      console.error('Error recording view:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}
