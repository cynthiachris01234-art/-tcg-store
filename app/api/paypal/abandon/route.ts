import { NextRequest, NextResponse } from 'next/server';
import { remindPendingCheckout } from '@/lib/pendingCheckout';

// POST /api/paypal/abandon — the customer came back from PayPal without paying.
// Notifies the store once. The order id must already be a checkout we started.
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json().catch(() => ({}));
    if (typeof orderId !== 'string' || !orderId.startsWith('APX-')) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const result = await remindPendingCheckout(orderId, true);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('PayPal abandon error:', err?.message ?? err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
