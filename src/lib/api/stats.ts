/// <reference types="@cloudflare/workers-types" />
import { getClientIpHash, isValidSlug } from './utils';

export async function handleStats(request: Request, db: D1Database, salt: string): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!isValidSlug(slug)) {
    return Response.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    const ipHash = await getClientIpHash(request, salt);

    // Check if this IP recorded a view for this post in the last 24 hours
    const recentView = await db.prepare(
      "SELECT 1 FROM activity_logs WHERE slug = ? AND action = 'view' AND ip_hash = ? AND created_at > datetime('now', '-24 hours')"
    ).bind(slug, ipHash).first();

    if (!recentView) {
      // Record view log & increment view count in 1 batched DB call
      await db.batch([
        db.prepare(
          "INSERT INTO activity_logs (slug, action, ip_hash, created_at) VALUES (?, 'view', ?, CURRENT_TIMESTAMP) ON CONFLICT(slug, action, ip_hash) DO UPDATE SET created_at = CURRENT_TIMESTAMP"
        ).bind(slug, ipHash),
        db.prepare(
          'INSERT INTO post_stats (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1'
        ).bind(slug)
      ]);
    }

    // Fetch upvotes, views, and upvote status
    const [statsResult, voteResult] = await db.batch([
      db.prepare('SELECT upvotes, views FROM post_stats WHERE slug = ?').bind(slug),
      db.prepare("SELECT 1 FROM activity_logs WHERE slug = ? AND action = 'upvote' AND ip_hash = ?").bind(slug, ipHash)
    ]);

    const stats = statsResult.results[0] as { upvotes: number; views: number } | undefined;
    const hasVoted = voteResult.results.length > 0;

    return Response.json({
      upvotes: stats?.upvotes ?? 0,
      views: stats?.views ?? 0,
      hasVoted
    });
  } catch (err) {
    console.error('Error fetching post stats:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
