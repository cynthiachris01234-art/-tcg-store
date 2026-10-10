// Server-only PayPal helpers (Orders v2 REST API). The customer approves the
// payment on PayPal's own page; we capture it when they come back, and only a
// COMPLETED capture for the full amount becomes a PAID order.

// Values pasted into Vercel can pick up stray spaces, quotes or line breaks
// (e.g. when entered from PowerShell), which PayPal then rejects. Clean them.
const clean = (v?: string) => (v ?? '').replace(/^[\s"']+|[\s"']+$/g, '');
const CLIENT_ID = () => clean(process.env.PAYPAL_CLIENT_ID);
const CLIENT_SECRET = () => clean(process.env.PAYPAL_CLIENT_SECRET);
export const paypalMerchantId = () => clean(process.env.PAYPAL_MERCHANT_ID);

const ENV  = (clean(process.env.PAYPAL_ENV) || 'live').toLowerCase();
export const PAYPAL_BASE = ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

export const paypalConfigured = () => !!(CLIENT_ID() && CLIENT_SECRET());

let tokenCache: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.exp) return tokenCache.token;
  const basic = Buffer.from(`${CLIENT_ID()}:${CLIENT_SECRET()}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const d = await res.json();
  if (!res.ok || !d.access_token) throw new Error(`PayPal auth failed: ${d.error_description || res.status}`);
  tokenCache = { token: d.access_token, exp: Date.now() + (Number(d.expires_in ?? 300) - 60) * 1000 };
  return d.access_token;
}

/** Call the PayPal REST API; throws with PayPal's own message on failure. */
export async function paypalApi(path: string, init: { method?: string; body?: unknown; requestId?: string } = {}, retried = false): Promise<any> {
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.requestId ? { 'PayPal-Request-Id': init.requestId } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  // A cached token keeps the permissions it was issued with. If the account
  // owner has since enabled a feature (e.g. Transaction search), get a fresh
  // token and try once more.
  if (!retried && (res.status === 401 || res.status === 403 || data?.name === 'NOT_AUTHORIZED')) {
    tokenCache = null;
    return paypalApi(path, init, true);
  }
  if (!res.ok) {
    const detail = data?.details?.[0];
    const err: any = new Error(`PayPal ${res.status}: ${detail?.issue || data?.name || ''} ${detail?.description || data?.message || ''}`.trim());
    err.status = res.status;
    err.issue = detail?.issue || data?.name;
    throw err;
  }
  return data;
}

export const cents = (usd: number) => Math.round(usd * 100);
export const money = (c: number) => (c / 100).toFixed(2);
