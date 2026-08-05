/// <reference types="@cloudflare/workers-types" />
import { getClientIpHash, isValidSlug } from './utils';

export async function handleViews(request: Request, db: D1Database, salt: string): Promise<Response> {
  const url = new URL(request.url);

  // GET /api/views?slug=...
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!isValidSlug(slug)) {
      return Response.json({ error: 'Invalid slug' }, { status: 400 });
    }

    try {
      const stats = await db.prepare(
        'SELECT views FROM post_stats WHERE slug = ?'
      ).bind(slug).first<{ views: number }>();

      return Response.json({
        count: stats?.views ?? 0
      });
    } catch (err) {
      console.error('Error fetching view count:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  // POST /api/views (Increments post view count with 24-hour IP deduplication)
  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { slug?: string };
      const slug = body?.slug;

      if (!isValidSlug(slug)) {
        return Response.json({ error: 'Invalid slug' }, { status: 400 });
      }

      const ipHash = await getClientIpHash(request, salt);

      // Check if this IP recorded a view for this post in the last 24 hours
      const recentView = await db.prepare(
        "SELECT 1 FROM activity_logs WHERE slug = ? AND action = 'view' AND ip_hash = ? AND created_at > datetime('now', '-24 hours')"
      ).bind(slug, ipHash).first();

      if (!recentView) {
        // Record view log & increment view count in 1 batched call using RETURNING
        const [, updateBatch] = await db.batch([
          db.prepare(
            "INSERT INTO activity_logs (slug, action, ip_hash, created_at) VALUES (?, 'view', ?, CURRENT_TIMESTAMP) ON CONFLICT(slug, action, ip_hash) DO UPDATE SET created_at = CURRENT_TIMESTAMP"
          ).bind(slug, ipHash),
          db.prepare(
            'INSERT INTO post_stats (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1 RETURNING views'
          ).bind(slug)
        ]);

        const stats = updateBatch.results[0] as { views: number } | undefined;
        return Response.json({ count: stats?.views ?? 1 });
      }

      // If already viewed in the last 24h, return current count without DB write
      const stats = await db.prepare(
        'SELECT views FROM post_stats WHERE slug = ?'
      ).bind(slug).first<{ views: number }>();

      return Response.json({
        count: stats?.views ?? 0
      });
    } catch (err) {
      console.error('Error recording view:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}
