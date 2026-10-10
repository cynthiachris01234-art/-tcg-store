// Server-only: signed "welcome back" tokens for the abandoned-checkout offer.
// A token grants free shipping until it expires; the signature stops anyone
// from making their own.
import crypto from 'crypto';
import { COMEBACK } from '@/lib/promos';

const key = () => process.env.COMEBACK_SECRET || process.env.ADMIN_SECRET || 'apex-comeback';
const b64url = (s: string) => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sign = (body: string) => crypto.createHmac('sha256', key()).update(body).digest('hex').slice(0, 32);

export function makeComebackToken(orderId: string): string {
  const body = b64url(JSON.stringify({ o: orderId, e: Date.now() + COMEBACK.hours * 3600_000 }));
  return `${body}.${sign(body)}`;
}

export function verifyComebackToken(token: unknown): boolean {
  if (typeof token !== 'string' || token.length > 300) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { e } = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    return typeof e === 'number' && Date.now() < e;
  } catch { return false; }
}
