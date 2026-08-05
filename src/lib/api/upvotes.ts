/// <reference types="@cloudflare/workers-types" />
import { getClientIpHash, isValidSlug } from './utils';

export async function handleUpvote(request: Request, db: D1Database, salt: string): Promise<Response> {
  const url = new URL(request.url);

  // GET /api/upvote?slug=...
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!isValidSlug(slug)) {
      return Response.json({ error: 'Invalid slug' }, { status: 400 });
    }

    try {
      const ipHash = await getClientIpHash(request, salt);

      const [statsResult, voteResult] = await db.batch([
        db.prepare('SELECT upvotes FROM post_stats WHERE slug = ?').bind(slug),
        db.prepare("SELECT 1 FROM activity_logs WHERE slug = ? AND action = 'upvote' AND ip_hash = ?").bind(slug, ipHash)
      ]);

      const statsRow = statsResult.results[0] as { upvotes: number } | undefined;
      const hasVoted = voteResult.results.length > 0;

      return Response.json({
        count: statsRow?.upvotes ?? 0,
        hasVoted
      });
    } catch (err) {
      console.error('Error fetching upvote count:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  // POST /api/upvote (UPVOTE ONLY: 1 vote per unique IP)
  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { slug?: string };
      const slug = body?.slug;

      if (!isValidSlug(slug)) {
        return Response.json({ error: 'Invalid slug' }, { status: 400 });
      }

      const ipHash = await getClientIpHash(request, salt);

      // Record upvote log
      const logInsert = await db.prepare(
        "INSERT INTO activity_logs (slug, action, ip_hash) VALUES (?, 'upvote', ?) ON CONFLICT DO NOTHING"
      ).bind(slug, ipHash).run();

      const wasInserted = logInsert.meta.changes > 0;

      if (wasInserted) {
        // Increment upvotes count in post_stats
        await db.prepare(
          'INSERT INTO post_stats (slug, upvotes) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET upvotes = upvotes + 1'
        ).bind(slug).run();
      }

      // Fetch current total upvotes
      const statsRow = await db.prepare(
        'SELECT upvotes FROM post_stats WHERE slug = ?'
      ).bind(slug).first<{ upvotes: number }>();

      const totalCount = statsRow?.upvotes ?? (wasInserted ? 1 : 0);

      if (!wasInserted) {
        return Response.json({
          success: false,
          message: 'Already upvoted',
          hasVoted: true,
          count: totalCount
        }, { status: 409 });
      }

      return Response.json({
        success: true,
        hasVoted: true,
        count: totalCount
      });
    } catch (err) {
      console.error('Error processing upvote:', err);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}
