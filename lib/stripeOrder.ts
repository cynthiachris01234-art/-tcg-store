// Server-only: turn a PAID Stripe Checkout session into a recorded order.
// Used by both the success-page confirmation and the Stripe webhook; whichever
// runs first records the order, the other is a no-op (see recordOrder saveFirst).
import type Stripe from 'stripe';
import { recordOrder } from '@/lib/orderRecord';
import { forgetPendingCheckout } from '@/lib/pendingCheckout';

export async function recordPaidSession(
  session: Stripe.Checkout.Session,
  fallback?: { customer?: any; items?: any[] },
) {
  const m = session.metadata ?? {};
  const orderId = m.order_id;
  if (!orderId) return { recorded: false, reason: 'no order id' };
  if (session.payment_status !== 'paid') return { recorded: false, reason: session.payment_status };

  // Items: Stripe's copy first (can't be tampered with), browser copy as backup.
  let items: any[] = fallback?.items ?? [];
  if (m.items) {
    try {
      items = (JSON.parse(m.items) as [string, number][]).map(([productId, quantity]) => ({ productId, quantity }));
    } catch { /* keep fallback */ }
  }

  const fb = fallback?.customer ?? {};
  const pick = (metaKey: string, fbKey: string) => (m[metaKey] || fb[fbKey] || '') as string;
  const customer = {
    name:        pick('c_name', 'name') || session.customer_details?.name || '',
    email:       pick('c_email', 'email') || session.customer_details?.email || '',
    phone:       pick('c_phone', 'phone') || session.customer_details?.phone || '',
    line1:       pick('c_line1', 'line1'),
    line2:       pick('c_line2', 'line2') || undefined,
    city:        pick('c_city', 'city'),
    state:       pick('c_state', 'state'),
    postal_code: pick('c_postal', 'postal_code'),
    country:     pick('c_country', 'country') || m.country || 'US',
    stripe_session:        session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    amount_paid_usd:       (session.amount_total ?? 0) / 100,
  };

  await forgetPendingCheckout(orderId);
  const res = await recordOrder(
    { id: orderId, status: 'paid', paymentMethod: 'stripe', customer, items },
    // Price as of when checkout started, so a flash sale that ends while the
    // customer is paying is still honoured in the record.
    { saveFirst: true, at: (session.created ?? 0) * 1000 || undefined, freeShipping: m.free_ship === '1' },
  );
  return { recorded: !res.duplicate, duplicate: res.duplicate, orderId };
}
