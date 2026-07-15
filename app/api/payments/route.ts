import { NextRequest, NextResponse } from 'next/server';
import { gatewayById, isGatewayLive, GATEWAYS } from '@/lib/payments/gateways';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET → list available gateways (with live/demo status) for the checkout UI.
export async function GET() {
  return NextResponse.json({
    gateways: GATEWAYS.map((g) => ({
      id: g.id,
      name: g.name,
      blurb: g.blurb,
      provider: g.provider,
      live: isGatewayLive(g),
    })),
  });
}

function reference() {
  return 'WC26-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function demo(id: string, amount: number, currency: string) {
  return NextResponse.json({
    ok: true,
    mode: 'demo',
    gateway: id,
    reference: reference(),
    amount,
    currency,
    message:
      'Demo mode — no live payment was processed. Add this gateway’s API keys to enable real charges.',
  });
}

// POST → create a payment session for the selected gateway.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const gateway = String(body.gateway ?? '');
  const currency = String(body.currency ?? 'usd').toLowerCase();
  const description = String(body.description ?? 'FIFA World Cup 2026 tickets');
  const amount = Number(body.amount);

  const gw = gatewayById(gateway);
  if (!gw) return NextResponse.json({ ok: false, error: 'Unknown payment gateway' }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid amount' }, { status: 400 });
  }

  // No keys configured → safe demo response.
  if (!isGatewayLive(gw)) return demo(gw.id, amount, currency);

  try {
    switch (gw.id) {
      // ── Stripe-backed methods (cards, Apple Pay, Google Pay, Cash App Pay) ──
      case 'card':
      case 'applepay':
      case 'googlepay':
      case 'cashapp': {
        const { getServerStripe } = await import('@/lib/stripe');
        const intent = await getServerStripe().paymentIntents.create({
          amount: Math.round(amount * 100),
          currency,
          description,
          automatic_payment_methods: { enabled: true },
          metadata: { gateway: gw.id, event: 'FIFA World Cup 2026' },
        });
        return NextResponse.json({
          ok: true,
          mode: 'live',
          gateway: gw.id,
          clientSecret: intent.client_secret,
          reference: intent.id,
        });
      }

      // ── PayPal Orders API ──
      case 'paypal': {
        const base =
          process.env.PAYPAL_ENV === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
        const auth = Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
        ).toString('base64');

        const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
          method: 'POST',
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials',
        });
        const token = await tokenRes.json();

        const orderRes = await fetch(`${base}/v2/checkout/orders`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              { amount: { currency_code: currency.toUpperCase(), value: amount.toFixed(2) }, description },
            ],
          }),
        });
        const order = await orderRes.json();
        const approveUrl = (order.links ?? []).find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;
        return NextResponse.json({
          ok: true,
          mode: 'live',
          gateway: 'paypal',
          orderId: order.id,
          approveUrl,
          reference: order.id,
        });
      }

      // ── Coinbase Commerce (crypto) ──
      case 'crypto': {
        const res = await fetch('https://api.commerce.coinbase.com/charges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY as string,
            'X-CC-Version': '2018-03-22',
          },
          body: JSON.stringify({
            name: 'FIFA World Cup 2026 Tickets',
            description,
            pricing_type: 'fixed_price',
            local_price: { amount: amount.toFixed(2), currency: currency.toUpperCase() },
          }),
        });
        const charge = await res.json();
        return NextResponse.json({
          ok: true,
          mode: 'live',
          gateway: 'crypto',
          hostedUrl: charge?.data?.hosted_url,
          reference: charge?.data?.code,
        });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment provider error';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: false, error: 'Unhandled gateway' }, { status: 400 });
}
