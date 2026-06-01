import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_payment_intent_id', pi.id);

      // Decrement stock
      const { data: order } = await admin
        .from('orders')
        .select('items')
        .eq('stripe_payment_intent_id', pi.id)
        .single();

      if (order?.items) {
        for (const item of order.items as any[]) {
          await admin.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      await admin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_intent_id', pi.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
