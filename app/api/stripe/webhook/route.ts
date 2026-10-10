import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { recordPaidSession } from '@/lib/stripeOrder';
import { handleExpiredSession } from '@/lib/abandoned';
import { remindPendingCheckout } from '@/lib/pendingCheckout';

// POST /api/stripe/webhook — Stripe calls this when a checkout is paid.
// Records the order even if the customer closed the tab before returning.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  const sig = req.headers.get('stripe-signature');
  if (!secret || !sig) return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();   // must be the exact raw body for signature checks
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error('Stripe webhook signature failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      const res = await recordPaidSession(session);
      console.log(`Stripe webhook ${event.type}:`, JSON.stringify(res));
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const fromDb = orderId ? await remindPendingCheckout(orderId, true) : { skipped: 'no order id' };
      const res = fromDb && 'skipped' in fromDb && (fromDb.skipped === 'not pending' || fromDb.skipped === 'unavailable')
        ? await handleExpiredSession(session)
        : fromDb;
      console.log('Stripe webhook checkout.session.expired:', JSON.stringify(res));
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook handling error:', err?.message ?? err);
    // 500 makes Stripe retry later, so a temporary failure never loses a paid order.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
