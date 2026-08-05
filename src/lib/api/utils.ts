/// <reference types="@cloudflare/workers-types" />

export async function getClientIpHash(request: Request, salt: string): Promise<string> {
  const cfIp = request.headers.get('cf-connecting-ip');
  let clientIp = cfIp;

  if (!clientIp) {
    const xForwarded = request.headers.get('x-forwarded-for');
    if (xForwarded) {
      // Extract original client IP if x-forwarded-for is comma-separated
      clientIp = xForwarded.split(',')[0].trim();
    }
  }

  if (!clientIp) {
    clientIp = '127.0.0.1';
  }

  // Strip ephemeral client port if present (e.g. 127.0.0.1:54321 -> 127.0.0.1)
  if (clientIp.includes(':') && !clientIp.includes('[')) {
    clientIp = clientIp.split(':')[0];
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`${clientIp}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.trim().length > 0 && slug.length <= 150;
}
