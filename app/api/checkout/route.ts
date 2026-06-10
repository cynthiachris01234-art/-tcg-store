import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { CASE_BUNDLE_RATE } from '@/lib/pricing';

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Recompute the order total server-side from authoritative product prices.
// Never trust the total sent by the client.
function computeVerifiedTotal(cartItems: { product: { id: string }; quantity: number }[]): {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
} {
  let subtotalCents = 0;
  let hasCase = false;

  for (const item of cartItems) {
    const product = MOCK_PRODUCTS.find(p => p.id === item.product.id);
    if (!product) continue;
    subtotalCents += Math.round(product.our_price_usd * 100) * item.quantity;
    if (product.product_type === 'case') hasCase = true;
  }

  const discountCents = hasCase ? Math.round(subtotalCents * CASE_BUNDLE_RATE) : 0;
  const totalCents = subtotalCents - discountCents;

  return { subtotalCents, discountCents, totalCents };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.cart?.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderId = generateOrderId();

    // Always recompute from server-side prices — ignore client-sent total
    const { subtotalCents, discountCents, totalCents } = computeVerifiedTotal(body.cart.items);

    if (totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    if (body.paymentMethod === 'card') {
      const pi = await stripe.paymentIntents.create({
        amount: totalCents, // exact cents, server-verified
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId,
          subtotal_usd: (subtotalCents / 100).toFixed(2),
          discount_usd: (discountCents / 100).toFixed(2),
          total_usd:    (totalCents / 100).toFixed(2),
        },
      });
      return NextResponse.json({
        orderId,
        clientSecret: pi.client_secret,
        verifiedTotalUsd: totalCents / 100,
      });
    }

    // Manual payment methods — no Stripe involved
    return NextResponse.json({ orderId });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
