import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { isComingSoon, formatDate } from '@/lib/utils';
import { rebuildOrderPricing } from '@/lib/orderRecord';
import { KKIA, kkiapayConfigured, usdToXofRate, usdToXof, signQuote, type KkiaQuote } from '@/lib/kkiapay';

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// GET — lets the checkout page know whether Kkiapay is fully set up.
export async function GET() {
  return NextResponse.json({ configured: kkiapayConfigured() });
}

// POST — price the cart on the server and issue a signed payment quote.
// The dollar total is converted to CFA francs for Kkiapay; the site itself
// only shows dollars.
export async function POST(req: NextRequest) {
  try {
    if (!kkiapayConfigured()) {
      return NextResponse.json({ error: 'This payment method is not available yet.' }, { status: 503 });
    }
    const body = await req.json();
    const cartItems: { product: { id: string }; quantity: number }[] = body?.cart?.items ?? [];
    if (!cartItems.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const unreleased = cartItems
      .map(i => MOCK_PRODUCTS.find(p => p.id === i.product.id))
      .filter((p): p is NonNullable<typeof p> => !!p && isComingSoon(p));
    if (unreleased.length) {
      const list = unreleased.map(p => `${p.set_name} (available ${formatDate(p.release_date)})`).join(', ');
      return NextResponse.json({ error: `Not released yet — please remove from your cart: ${list}` }, { status: 400 });
    }

    const items = cartItems.map(i => ({ productId: i.product.id, quantity: Math.max(1, Math.floor(i.quantity || 1)) }));
    const priced = rebuildOrderPricing(items, body.country ?? 'US');
    if (priced.minimumError) return NextResponse.json({ error: priced.minimumError }, { status: 400 });
    if (priced.total <= 0) return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });

    const rate = await usdToXofRate();
    const quote: KkiaQuote = {
      orderId: generateOrderId(),
      items: items.map(i => [i.productId, i.quantity]),
      amountUsd: priced.total,
      amountXof: usdToXof(priced.total, rate),
      exp: Date.now() + 24 * 3600_000,
    };

    return NextResponse.json({
      orderId: quote.orderId,
      amountUsd: quote.amountUsd,
      amountXof: quote.amountXof,        // passed to the Kkiapay window only — never displayed on the site
      publicKey: KKIA.publicKey,
      sandbox: KKIA.sandbox,
      quote,
      sig: signQuote(quote),
    });
  } catch (err: any) {
    console.error('Kkiapay checkout error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 500 });
  }
}
