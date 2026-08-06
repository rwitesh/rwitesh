/// <reference types="@cloudflare/workers-types" />

async function getClientIpHash(request: Request, salt: string): Promise<string> {
  const cfIp = request.headers.get('cf-connecting-ip');
  let clientIp = cfIp;

  if (!clientIp) {
    const xForwarded = request.headers.get('x-forwarded-for');
    if (xForwarded) {
      clientIp = xForwarded.split(',')[0].trim();
    }
  }

  if (!clientIp) {
    clientIp = '127.0.0.1';
  }

  if (clientIp.includes(':') && !clientIp.includes('[')) {
    clientIp = clientIp.split(':')[0];
  }

  const data = new TextEncoder().encode(`${clientIp}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.trim().length > 0 && slug.length <= 150;
}

export async function handleUpvote(request: Request, db: D1Database, salt: string): Promise<Response> {
  try {
    if (request.method === 'GET') {
      const slug = new URL(request.url).searchParams.get('slug');

      if (slug !== null) {
        if (!isValidSlug(slug)) {
          return Response.json({ error: 'Invalid slug' }, { status: 400 });
        }

        const ipHash = await getClientIpHash(request, salt);
        const [countResult, voteResult] = await db.batch([
          db.prepare('SELECT COUNT(*) AS count FROM activity_logs WHERE slug = ? AND action = ?').bind(slug, 'upvote'),
          db.prepare('SELECT 1 FROM activity_logs WHERE slug = ? AND action = ? AND ip_hash = ?').bind(slug, 'upvote', ipHash)
        ]);

        const countRow = countResult.results[0] as { count: number } | undefined;

        return Response.json({
          slug,
          upvotes: countRow?.count ?? 0,
          hasVoted: voteResult.results.length > 0
        });
      }

      const result = await db.prepare(
        'SELECT slug, COUNT(*) AS upvotes FROM activity_logs WHERE action = ? GROUP BY slug ORDER BY slug'
      ).bind('upvote').all<{ slug: string; upvotes: number }>();

      return Response.json({ posts: result.results ?? [] });
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as { slug?: string };
      const slug = body?.slug;

      if (!isValidSlug(slug)) {
        return Response.json({ error: 'Invalid slug' }, { status: 400 });
      }

      const ipHash = await getClientIpHash(request, salt);
      const logInsert = await db.prepare(
        'INSERT INTO activity_logs (slug, action, ip_hash) VALUES (?, ?, ?) ON CONFLICT DO NOTHING'
      ).bind(slug, 'upvote', ipHash).run();

      const countResult = await db.prepare(
        'SELECT COUNT(*) AS count FROM activity_logs WHERE slug = ? AND action = ?'
      ).bind(slug, 'upvote').first<{ count: number }>();

      const count = countResult?.count ?? 0;

      if (logInsert.meta.changes === 0) {
        return Response.json({
          success: false,
          message: 'Already upvoted',
          hasVoted: true,
          count
        }, { status: 409 });
      }

      return Response.json({ success: true, hasVoted: true, count });
    }

    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  } catch (err) {
    console.error('Upvote API error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
