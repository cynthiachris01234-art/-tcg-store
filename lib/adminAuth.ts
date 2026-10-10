// Admin session token. The cookie holds a signature derived from the admin
// password, never the password itself, so a leaked cookie can't reveal it.
// Uses Web Crypto so it runs in middleware (Edge) as well as in API routes.

const SESSION_LABEL = 'apex-admin-session-v1';

export const adminSecret = () => process.env.ADMIN_SECRET ?? '';

export async function adminSessionToken(secret = adminSecret()): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(SESSION_LABEL));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  const secret = adminSecret();
  if (!secret || !value) return false;          // no password configured = nobody gets in
  return safeEqual(value, await adminSessionToken(secret));
}
