// Server-only Kkiapay helpers. Kkiapay charges in West African CFA francs
// (XOF), so every order total (priced in USD) is converted here. Customers
// only ever see dollars on the site.
import crypto from 'crypto';
import { kkiapay } from '@kkiapay-org/nodejs-sdk';

export const KKIA = {
  publicKey:  process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? '',
  privateKey: process.env.KKIAPAY_PRIVATE_KEY ?? '',
  secretKey:  process.env.KKIAPAY_SECRET_KEY ?? '',
  sandbox:    process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === 'true',
};

/** All three keys are required: the public key opens the payment window, the
 *  private + secret keys let the server confirm each payment is real. */
export const kkiapayConfigured = () => !!(KKIA.publicKey && KKIA.privateKey && KKIA.secretKey);

export const kkiaClient = () => kkiapay({
  publickey: KKIA.publicKey, privatekey: KKIA.privateKey, secretkey: KKIA.secretKey, sandbox: KKIA.sandbox,
});

// ── USD → XOF ────────────────────────────────────────────────────────────────
let rateCache: { rate: number; at: number } | null = null;
const FALLBACK_XOF_PER_USD = 600;

export async function usdToXofRate(): Promise<number> {
  if (rateCache && Date.now() - rateCache.at < 6 * 3600_000) return rateCache.rate;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    const x = Number((await r.json())?.rates?.XOF);
    if (x > 300 && x < 1500) { rateCache = { rate: x, at: Date.now() }; return x; }   // sanity band
  } catch { /* use cache/fallback */ }
  return rateCache?.rate ?? FALLBACK_XOF_PER_USD;
}

/** Round UP to a whole franc so the shop is never short-changed. */
export const usdToXof = (usd: number, rate: number) => Math.ceil(usd * rate);

// ── Signed quotes ────────────────────────────────────────────────────────────
// The checkout route issues a quote (order id, items, amount) signed with a
// server secret. The confirm route only accepts a payment that matches a quote
// it signed, so the browser can't lower the amount or swap the items.
export interface KkiaQuote {
  orderId: string;
  items: [string, number][];   // [productId, quantity]
  amountUsd: number;
  amountXof: number;
  exp: number;                 // ms epoch
}
const quoteKey = () => KKIA.secretKey || process.env.ADMIN_SECRET || 'kkia-quote';

export function signQuote(q: KkiaQuote): string {
  return crypto.createHmac('sha256', quoteKey()).update(JSON.stringify(q)).digest('hex');
}
export function quoteValid(q: KkiaQuote, sig: string): boolean {
  if (!q || !sig || typeof sig !== 'string') return false;
  const expected = signQuote(q);
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)) && Date.now() < q.exp;
}
