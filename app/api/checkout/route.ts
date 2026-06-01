import { NextRequest, NextResponse } from 'next/server';
import type { Cart } from '@/types';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const isStripeConfigured = Boolean(STRIPE_KEY && !STRIPE_KEY.includes('placeholder'));
const isSupabaseConfigured = Boolean(SUPABASE_URL && !SUPABASE_URL.includes('placeholder'));

export async function POST(req: NextRequest) {
  try {
    const { cart, shippingAddress }: { cart: Cart; shippingAddress: any } = await req.json();

    if (!cart?.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // ── Demo mode: no Stripe or Supabase configured ─────────────────────────
    if (!isStripeConfigured) {
      const demoOrderId = `DEMO-${Date.now().toString(36).toUpperCase()}`;
      return NextResponse.json({ demo: true, orderId: demoOrderId });
    }

    // ── Live mode ────────────────────────────────────────────────────────────
    const { createPaymentIntent } = await import('@/lib/stripe');
    const intent = await createPaymentIntent(cart.total_usd, {
      item_count: String(cart.items.length),
    });

    let orderId = `order-${Date.now()}`;
    if (isSupabaseConfigured) {
      const { createAdminClient } = await import('@/lib/supabase');
      const admin = createAdminClient();
      const { data: order, error } = await admin
        .from('orders')
        .insert({
          stripe_payment_intent_id: intent.id,
          email: shippingAddress?.email || '',
          status: 'pending',
          items: cart.items.map((i) => ({
            product_id: i.product.id,
            product_snapshot: {
              set_name: i.product.set_name,
              brand: i.product.brand,
              language: i.product.language,
              product_type: i.product.product_type,
              image_url: i.product.image_url,
            },
            quantity: i.quantity,
            unit_price_usd: i.product.our_price_usd,
          })),
          subtotal_usd: cart.subtotal_usd,
          discount_usd: cart.bundle_discount,
          total_usd: cart.total_usd,
          shipping_address: shippingAddress,
        })
        .select('id')
        .single();
      if (!error && order) orderId = order.id;
    }

    return NextResponse.json({ clientSecret: intent.client_secret, orderId });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
