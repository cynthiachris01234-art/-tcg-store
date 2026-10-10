// A checkout that was started but not paid. Stored as a store_orders row with
// status checkout_started so it never looks like a placed order. When they
// leave (cancel, expire, or sit unpaid for an hour) the store gets a Telegram
// alert and the customer gets one free-shipping reminder email.
import { createClient } from '@supabase/supabase-js';
import { paypalApi, paypalConfigured } from '@/lib/paypal';
import { notifyAbandonedCheckout } from '@/lib/abandoned';

const WAIT_MS = 60 * 60 * 1000;

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface PendingCheckout {
  orderId: string;
  method?: 'paypal' | 'stripe';
  paypalOrderId?: string;
  stripeSessionId?: string;
  country: string;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  items: { productId: string; quantity: number; setName?: string; unitPrice?: number; total?: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export async function savePendingCheckout(p: PendingCheckout) {
  const method = p.method || (p.stripeSessionId ? 'stripe' : 'paypal');
  const supabase = db();
  const row: Record<string, unknown> = {
    id: p.orderId,
    status: 'checkout_started',
    payment_method: method,
    customer: {
      ...p.customer,
      country: p.customer.country || p.country,
      ...(p.paypalOrderId ? { paypal_order: p.paypalOrderId } : {}),
      ...(p.stripeSessionId ? { stripe_session: p.stripeSessionId } : {}),
    },
    items: p.items,
    subtotal_usd: p.subtotal,
    discount_usd: p.discount,
    shipping_usd: p.shipping,
    total_usd: p.total,
  };
  if (supabase) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const { error } = await supabase.from('store_orders').insert(row);
      if (!error) break;
      const missing = error.message.match(/Could not find the '([^']+)' column/);
      if (!missing || !(missing[1] in row)) {
        console.error('Could not save pending checkout:', error.message);
        break;
      }
      const folded = row.customer as Record<string, unknown>;
      folded[missing[1]] = row[missing[1]];
      delete row[missing[1]];
    }
  }
}

/** Remove a started checkout once it is paid, so the paid order can use the same id. */
export async function forgetPendingCheckout(orderId: string) {
  const supabase = db();
  if (!supabase) return;
  await supabase.from('store_orders').delete().eq('id', orderId).eq('status', 'checkout_started');
}

async function paypalStillOpen(paypalOrderId: string): Promise<boolean> {
  if (!paypalConfigured() || !paypalOrderId) return true;
  try {
    const order = await paypalApi(`/v2/checkout/orders/${paypalOrderId}`);
    return order?.status !== 'COMPLETED';
  } catch {
    return true;
  }
}

async function stripeStillOpen(sessionId?: string): Promise<boolean> {
  if (!sessionId) return true;
  try {
    const { stripe } = await import('@/lib/stripe');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status !== 'paid';
  } catch {
    return true;
  }
}

/** Notify once. `force` is for an explicit cancel; otherwise wait an hour. */
export async function remindPendingCheckout(orderId: string, force = false) {
  const supabase = db();
  if (!supabase || !orderId?.startsWith('APX-')) return { skipped: 'unavailable' };
  const { data: row } = await supabase.from('store_orders').select('*').eq('id', orderId).maybeSingle();
  if (!row || row.status !== 'checkout_started') return { skipped: 'not pending' };
  const customer = row.customer ?? {};
  if (customer.abandoned_notified) return { skipped: 'already sent' };
  const age = Date.now() - Date.parse(row.created_at ?? '');
  if (!force && !(age > WAIT_MS)) return { skipped: 'too soon' };
  if (!(await paypalStillOpen(customer.paypal_order))) return { skipped: 'paid at paypal' };
  if (!(await stripeStillOpen(customer.stripe_session))) return { skipped: 'paid at stripe' };

  const items = (row.items ?? []).map((i: any) => ({
    productId: i.productId ?? i.sku ?? i.product_id,
    quantity: Number(i.quantity) || 1,
  })).filter((i: { productId: string }) => i.productId);

  const result = await notifyAbandonedCheckout({
    orderId,
    email: customer.email || '',
    name: customer.name,
    phone: customer.phone,
    country: customer.country,
    items,
  });
  if ('skipped' in result && result.skipped) return result;

  await supabase.from('store_orders').update({
    customer: { ...customer, abandoned_notified: true },
  }).eq('id', orderId).eq('status', 'checkout_started');
  return result;
}

/** Alert on checkouts that were started over an hour ago and never paid. */
export async function sweepAbandonedCheckouts() {
  const supabase = db();
  if (!supabase) return { reminded: 0 };
  const cutoff = new Date(Date.now() - WAIT_MS).toISOString();
  const { data } = await supabase.from('store_orders')
    .select('id')
    .eq('status', 'checkout_started')
    .lt('created_at', cutoff)
    .limit(20);
  let reminded = 0;
  for (const row of data ?? []) {
    const res = await remindPendingCheckout(row.id, false);
    if (res && 'emailed' in res) reminded++;
  }
  return { reminded };
}
