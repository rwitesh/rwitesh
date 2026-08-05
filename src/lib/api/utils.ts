/// <reference types="@cloudflare/workers-types" />

export async function getClientIpHash(request: Request, salt: string): Promise<string> {
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${clientIp}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.trim().length > 0 && slug.length <= 150;
}
