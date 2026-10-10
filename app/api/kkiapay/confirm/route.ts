import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { recordOrder } from '@/lib/orderRecord';
import { kkiapayConfigured, kkiaClient, quoteValid, type KkiaQuote } from '@/lib/kkiapay';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** True if another order was already paid with this Kkiapay transaction. */
async function txnAlreadyUsed(txn: string, orderId: string): Promise<boolean> {
  if (!supabaseUrl || !serviceRoleKey) return false;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('store_orders').select('id')
    .filter('customer->>kkiapay_txn', 'eq', txn).neq('id', orderId).limit(1);
  return !!(data && data.length);
}

// POST /api/kkiapay/confirm — called after the Kkiapay window reports success.
// Asks Kkiapay directly whether the transaction really succeeded for the full
// amount; only then is the order recorded as PAID and the store notified.
export async function POST(req: NextRequest) {
  try {
    if (!kkiapayConfigured()) return NextResponse.json({ error: 'Not available' }, { status: 503 });
    const { transactionId, quote, sig, customer } = await req.json() as {
      transactionId: string; quote: KkiaQuote; sig: string; customer: any;
    };
    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json({ error: 'Missing transaction' }, { status: 400 });
    }
    if (!quoteValid(quote, sig)) {
      return NextResponse.json({ error: 'Payment session expired — please contact us with your receipt.' }, { status: 400 });
    }

    const tx = await kkiaClient().verify(transactionId);
    const status = String(tx?.status ?? '').toUpperCase();
    if (status !== 'SUCCESS') {
      return NextResponse.json({ paid: false, status: status || 'UNKNOWN' });
    }
    if (Number(tx?.amount ?? 0) < quote.amountXof) {
      console.error(`Kkiapay underpaid: ${transactionId} paid ${tx?.amount}, expected ${quote.amountXof}`);
      return NextResponse.json({ error: 'Payment amount does not match this order. Please contact us.' }, { status: 400 });
    }
    if (tx?.partnerId && tx.partnerId !== quote.orderId) {
      return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 });
    }
    if (await txnAlreadyUsed(transactionId, quote.orderId)) {
      return NextResponse.json({ error: 'This payment was already used for another order.' }, { status: 400 });
    }

    const res = await recordOrder({
      id: quote.orderId,
      status: 'paid',
      paymentMethod: 'kkiapay',
      customer: {
        ...(customer ?? {}),
        kkiapay_txn: transactionId,
        amount_paid_usd: quote.amountUsd,
      },
      items: quote.items.map(([productId, quantity]) => ({ productId, quantity })),
    }, { saveFirst: true });

    return NextResponse.json({ paid: true, orderId: quote.orderId, amount: quote.amountUsd, duplicate: res.duplicate });
  } catch (err: any) {
    console.error('Kkiapay confirm error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not confirm payment. If you were charged, contact us with your receipt.' }, { status: 500 });
  }
}
