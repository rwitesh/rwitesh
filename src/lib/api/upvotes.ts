/// <reference types="@cloudflare/workers-types" />
import { getClientIpHash, isValidSlug } from './utils';

export async function handleUpvote(request: Request, db: D1Database, salt: string): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

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
      await db.prepare(
        'INSERT INTO post_stats (slug, upvotes) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET upvotes = upvotes + 1'
      ).bind(slug).run();
    }

    const stats = await db.prepare(
      'SELECT upvotes FROM post_stats WHERE slug = ?'
    ).bind(slug).first<{ upvotes: number }>();

    const count = stats?.upvotes ?? (wasInserted ? 1 : 0);

    if (!wasInserted) {
      return Response.json({
        success: false,
        message: 'Already upvoted',
        hasVoted: true,
        count
      }, { status: 409 });
    }

    return Response.json({
      success: true,
      hasVoted: true,
      count
    });
  } catch (err) {
    console.error('Error processing upvote:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
