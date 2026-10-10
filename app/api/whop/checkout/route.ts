import { NextRequest, NextResponse } from 'next/server';
import Whop from '@whop/sdk';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { isComingSoon, formatDate } from '@/lib/utils';
import { CASE_BUNDLE_RATE } from '@/lib/pricing';
import { computeShippingCents, type ShipItem } from '@/lib/shipping';

const whopApiKey    = process.env.WHOP_API_KEY ?? '';
const whopCompanyId = process.env.WHOP_COMPANY_ID ?? '';

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Recompute the order total server-side from authoritative product prices.
// Never trust the total sent by the client.
function computeVerifiedTotal(
  cartItems: { product: { id: string }; quantity: number }[],
  country: string,
): {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
} {
  let subtotalCents = 0;
  let hasCase = false;
  const shipItems: ShipItem[] = [];

  for (const item of cartItems) {
    const product = MOCK_PRODUCTS.find(p => p.id === item.product.id);
    if (!product) continue;
    subtotalCents += Math.round(product.our_price_usd * 100) * item.quantity;
    if (product.product_type === 'case') hasCase = true;
    shipItems.push({ product_type: product.product_type, quantity: item.quantity });
  }

  const discountCents = hasCase ? Math.round(subtotalCents * CASE_BUNDLE_RATE) : 0;
  const shippingCents = computeShippingCents(shipItems, subtotalCents - discountCents, country);
  const totalCents = subtotalCents - discountCents + shippingCents;

  return { subtotalCents, discountCents, shippingCents, totalCents };
}

function isConfigured(): boolean {
  return !!(whopApiKey && whopCompanyId && !whopApiKey.includes('placeholder') && !whopCompanyId.includes('placeholder'));
}

// GET /api/whop/checkout — lets the checkout page know whether to show the card option
export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}

export async function POST(req: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { error: 'Whop is not configured. Set WHOP_API_KEY and WHOP_COMPANY_ID.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    if (!body?.cart?.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Block products that haven't been released yet ("Coming Soon"), even if
    // they were added to the cart before being blocked.
    const unreleased = body.cart.items
      .map((i: { product: { id: string } }) => MOCK_PRODUCTS.find(p => p.id === i.product.id))
      .filter((p: any) => p && isComingSoon(p));
    if (unreleased.length) {
      const list = unreleased.map((p: any) => `${p.set_name} (available ${formatDate(p.release_date)})`).join(', ');
      return NextResponse.json({ error: `Not released yet — please remove from your cart: ${list}` }, { status: 400 });
    }

    const orderId = generateOrderId();
    const country = body.country ?? body.cart?.country ?? 'US';
    const { subtotalCents, discountCents, shippingCents, totalCents } = computeVerifiedTotal(body.cart.items, country);

    if (totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    // Note: the API key is company-scoped — company_id goes inside plan only
    const client = new Whop({ apiKey: whopApiKey });
    const checkoutConfig = await client.checkoutConfigurations.create({
      plan: {
        company_id: whopCompanyId,
        currency: 'usd',
        initial_price: totalCents / 100,
        plan_type: 'one_time',
      },
      metadata: {
        order_id: orderId,
        subtotal_usd: (subtotalCents / 100).toFixed(2),
        discount_usd: (discountCents / 100).toFixed(2),
        shipping_usd: (shippingCents / 100).toFixed(2),
        total_usd:    (totalCents    / 100).toFixed(2),
      },
    });

    return NextResponse.json({
      orderId,
      sessionId: checkoutConfig.id,
      planId: checkoutConfig.plan?.id ?? null,
      verifiedSubtotalUsd: subtotalCents / 100,
      verifiedDiscountUsd: discountCents / 100,
      verifiedShippingUsd: shippingCents / 100,
      verifiedTotalUsd:    totalCents    / 100,
    });
  } catch (err: any) {
    console.error('Whop checkout error:', err);
    return NextResponse.json({ error: 'Could not create Whop checkout' }, { status: 500 });
  }
}
