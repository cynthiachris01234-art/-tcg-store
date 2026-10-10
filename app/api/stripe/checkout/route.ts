import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { isComingSoon, formatDate } from '@/lib/utils';
import { rebuildOrderPricing } from '@/lib/orderRecord';
import { verifyComebackToken } from '@/lib/comeback';
import { FREE_GIFT } from '@/lib/promos';
import { stripeCheckoutStatus } from '@/lib/stripeGuard';
import { encodeCartItems } from '@/lib/abandoned';
import { savePendingCheckout } from '@/lib/pendingCheckout';

// GET — tells the checkout page whether card checkout can be offered.
export async function GET() {
  const s = await stripeCheckoutStatus();
  return NextResponse.json({ available: s.available });
}

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// POST /api/stripe/checkout — create a Stripe-hosted payment page for the cart.
// The amount comes from server-side pricing (never the client), so the
// customer just pays; nothing to type.
export async function POST(req: NextRequest) {
  try {
    // Card checkout runs when a Stripe key is set. STRIPE_CHECKOUT_ENABLED=false switches it off.
    const status = await stripeCheckoutStatus();
    if (!status.available) {
      console.warn('Stripe checkout unavailable:', status.reason);
      return NextResponse.json({ error: 'Card checkout is not available right now. Please choose Wise, Venmo or Apple Pay.' }, { status: 503 });
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
    const freeShipping = verifyComebackToken(body.comeback);   // welcome-back email offer
    const priced = rebuildOrderPricing(items, body.country ?? 'US', { freeShipping });
    if (priced.minimumError) return NextResponse.json({ error: priced.minimumError }, { status: 400 });
    const totalCents = Math.round(priced.total * 100);
    if (totalCents <= 0) return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });

    const orderId = generateOrderId();
    const origin = new URL(req.url).origin;

    // Itemised lines when possible; a single line when a case discount applies
    // (Stripe line items can't be negative).
    const lineItems = priced.discount > 0
      ? [{
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: totalCents,
            product_data: {
              name: `Apex TCG order ${orderId}`,
              description: priced.items.map(i => `${i.quantity}× ${i.setName}`).join(', ').slice(0, 500),
            },
          },
        }]
      : [
          ...priced.items.map(i => ({
            quantity: i.quantity,
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(i.unitPrice * 100),
              product_data: { name: i.setName.slice(0, 250), ...(i.imageUrl ? { images: [i.imageUrl] } : {}) },
            },
          })),
          ...(priced.shipping > 0 ? [{
            quantity: 1,
            price_data: { currency: 'usd', unit_amount: Math.round(priced.shipping * 100), product_data: { name: 'Shipping' } },
          }] : []),
        ];

    // Shipping details travel with the payment so the webhook can record the
    // order even if the customer never returns to the site.
    const c = body.customer ?? {};
    const cut = (v: unknown) => String(v ?? '').slice(0, 480);
    const customerMeta: Record<string, string> = {
      c_name: cut(c.name), c_email: cut(c.email), c_phone: cut(c.phone),
      c_line1: cut(c.line1), c_line2: cut(c.line2), c_city: cut(c.city),
      c_state: cut(c.state), c_postal: cut(c.postal_code), c_country: cut(c.country ?? body.country),
    };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: body.customer?.email || undefined,
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        country: String(body.country ?? 'US'),
        ...encodeCartItems(items),
        ...customerMeta,
        ...(freeShipping ? { free_ship: '1' } : {}),
        ...(priced.freeGift ? { free_gift: '1' } : {}),
      },
      // Unpaid checkouts expire after an hour. Stripe emails a recovery link,
      // and our webhook sends a free-shipping reminder (lib/abandoned.ts).
      expires_at: Math.floor(Date.now() / 1000) + 90 * 60,
      after_expiration: { recovery: { enabled: true } },
      ...(priced.freeGift ? { custom_text: { submit: { message: `🎁 A free booster pack is included with this order (orders over $${FREE_GIFT.thresholdUsd}).` } } } : {}),
      payment_intent_data: { metadata: { order_id: orderId } },
      success_url: `${origin}/checkout/success?order=${orderId}&method=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
    });

    // Sanity check: Stripe's total must equal our server-side total.
    if (session.amount_total !== totalCents) {
      console.error('Stripe total mismatch', session.amount_total, totalCents);
    }

    await savePendingCheckout({
      orderId,
      method: 'stripe',
      stripeSessionId: session.id,
      country: body.country ?? 'US',
      customer: c,
      items: priced.items,
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping,
      total: priced.total,
    });

    return NextResponse.json({ orderId, url: session.url, totalUsd: priced.total });
  } catch (err: any) {
    console.error('Stripe checkout error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not start card payment. Please try another method.' }, { status: 500 });
  }
}
