import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { isComingSoon, formatDate } from '@/lib/utils';
import { rebuildOrderPricing } from '@/lib/orderRecord';
import { verifyComebackToken } from '@/lib/comeback';
import { paypalApi, paypalConfigured, paypalMerchantId, cents, money } from '@/lib/paypal';
import { envOff } from '@/lib/env';
import { savePendingCheckout } from '@/lib/pendingCheckout';

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// GET — lets the checkout page know whether PayPal is set up.
// Live when PayPal keys are set. PAYPAL_CHECKOUT_ENABLED=false turns it off.
const paypalCheckoutOn = () => paypalConfigured() && !envOff('PAYPAL_CHECKOUT_ENABLED');

export async function GET() {
  return NextResponse.json({ configured: paypalCheckoutOn() });
}

// POST — price the cart on the server and create a PayPal order. Returns the
// PayPal approval link; the customer pays there and comes back to the success
// page, which captures the payment (/api/paypal/capture).
export async function POST(req: NextRequest) {
  try {
    if (!paypalCheckoutOn()) return NextResponse.json({ error: 'PayPal is not available. Please choose Wise, Venmo or Apple Pay.' }, { status: 503 });
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
    const freeShipping = verifyComebackToken(body.comeback);
    const priced = rebuildOrderPricing(items, body.country ?? 'US', { freeShipping });
    if (priced.minimumError) return NextResponse.json({ error: priced.minimumError }, { status: 400 });

    // PayPal checks that the breakdown adds up exactly, so work in cents.
    const itemTotal = priced.items.reduce((s, i) => s + cents(i.unitPrice) * i.quantity, 0);
    const discount  = cents(priced.discount);
    const shipping  = cents(priced.shipping);
    const total     = itemTotal - discount + shipping;
    if (total <= 0) return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });

    const orderId = generateOrderId();
    const origin = new URL(req.url).origin;
    const c = body.customer ?? {};

    const order = await paypalApi('/v2/checkout/orders', {
      method: 'POST',
      requestId: orderId,
      body: {
        intent: 'CAPTURE',
        purchase_units: [{
          ...(paypalMerchantId() ? { payee: { merchant_id: paypalMerchantId() } } : {}),
          reference_id: orderId,
          custom_id: orderId,
          invoice_id: orderId,
          description: `Apex TCG order ${orderId}`,
          soft_descriptor: 'APEXTCG',
          amount: {
            currency_code: 'USD',
            value: money(total),
            breakdown: {
              item_total: { currency_code: 'USD', value: money(itemTotal) },
              shipping:   { currency_code: 'USD', value: money(shipping) },
              ...(discount > 0 ? { discount: { currency_code: 'USD', value: money(discount) } } : {}),
            },
          },
          items: priced.items.map(i => ({
            name: i.setName.slice(0, 127),
            sku: i.productId.slice(0, 127),
            quantity: String(i.quantity),
            unit_amount: { currency_code: 'USD', value: money(cents(i.unitPrice)) },
            category: 'PHYSICAL_GOODS',
          })),
          ...(c.line1 ? {
            shipping: {
              name: { full_name: String(c.name ?? '').slice(0, 300) },
              address: {
                address_line_1: String(c.line1).slice(0, 300),
                ...(c.line2 ? { address_line_2: String(c.line2).slice(0, 300) } : {}),
                admin_area_2: String(c.city ?? '').slice(0, 120),
                ...(c.state ? { admin_area_1: String(c.state).slice(0, 300) } : {}),
                ...(c.postal_code ? { postal_code: String(c.postal_code).slice(0, 60) } : {}),
                country_code: String(c.country ?? body.country ?? 'US').slice(0, 2).toUpperCase(),
              },
            },
          } : {}),
        }],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'Apex TCG',
              user_action: 'PAY_NOW',
              shipping_preference: c.line1 ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
              // Open on the PayPal login page (pay with a PayPal account), not the guest card form.
              landing_page: 'LOGIN',
              return_url: `${origin}/checkout/success?order=${orderId}&method=paypal`,
              cancel_url: `${origin}/checkout?cancelled=1`,
            },
          },
        },
      },
    });

    const approve = (order.links ?? []).find((l: any) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
    if (!approve) throw new Error('PayPal did not return an approval link');
    await savePendingCheckout({
      orderId,
      method: 'paypal',
      paypalOrderId: order.id,
      country: body.country ?? 'US',
      customer: c,
      items: priced.items,
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping,
      total: priced.total,
    });
    return NextResponse.json({ orderId, paypalOrderId: order.id, url: approve, totalUsd: total / 100 });
  } catch (err: any) {
    console.error('PayPal checkout error:', err?.message ?? err);
    const msg = /ADDRESS|POSTAL|COUNTRY|STATE/i.test(err?.issue ?? '')
      ? 'PayPal could not accept that shipping address. Please check it and try again.'
      : 'Could not start PayPal. Please try again or pay by card.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
