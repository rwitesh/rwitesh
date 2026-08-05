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

      // Single batched DB call for count + user vote status
      const [countResult, voteResult] = await db.batch([
        db.prepare("SELECT COUNT(*) as count FROM activity_logs WHERE slug = ? AND action = 'upvote'").bind(slug),
        db.prepare("SELECT 1 FROM activity_logs WHERE slug = ? AND action = 'upvote' AND ip_hash = ?").bind(slug, ipHash)
      ]);

      const countRow = countResult.results[0] as { count: number } | undefined;
      const hasVoted = voteResult.results.length > 0;

      return Response.json({
        count: countRow?.count ?? 0,
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

      // Single batched DB call for insert + updated total count
      const [insertResult, countResult] = await db.batch([
        db.prepare("INSERT INTO activity_logs (slug, action, ip_hash) VALUES (?, 'upvote', ?) ON CONFLICT DO NOTHING").bind(slug, ipHash),
        db.prepare("SELECT COUNT(*) as count FROM activity_logs WHERE slug = ? AND action = 'upvote'").bind(slug)
      ]);

      const wasInserted = insertResult.meta.changes > 0;
      const countRow = countResult.results[0] as { count: number } | undefined;
      const totalCount = countRow?.count ?? 0;

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
