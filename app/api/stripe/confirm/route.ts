import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { recordPaidSession } from '@/lib/stripeOrder';

// POST /api/stripe/confirm — called from the success page after Stripe
// redirects back. Asks Stripe directly whether the session was paid; only then
// is the order recorded (as PAID) and the store notified. The Stripe webhook
// does the same thing; whichever arrives first records it, the other no-ops.
export async function POST(req: NextRequest) {
  try {
    const { sessionId, order } = await req.json();
    if (!sessionId || !order?.id) return NextResponse.json({ error: 'Missing session' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.order_id !== order.id) {
      return NextResponse.json({ error: 'Session does not match this order' }, { status: 400 });
    }
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ paid: false, status: session.payment_status });
    }

    await recordPaidSession(session, { customer: order.customer, items: order.items });
    return NextResponse.json({ paid: true, amount: (session.amount_total ?? 0) / 100 });
  } catch (err: any) {
    console.error('Stripe confirm error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not confirm payment' }, { status: 500 });
  }
}
