import { NextRequest, NextResponse } from 'next/server';
import { recordOrder, rebuildOrderPricing } from '@/lib/orderRecord';
import { paypalApi, paypalConfigured } from '@/lib/paypal';
import { forgetPendingCheckout } from '@/lib/pendingCheckout';
import { envOff } from '@/lib/env';

// POST /api/paypal/capture — called from the success page after PayPal sends
// the customer back. Captures the approved payment, checks PayPal says it is
// COMPLETED for the full amount, then records the order as PAID and notifies
// the store. Safe to call twice: a second capture is detected and ignored.
export async function POST(req: NextRequest) {
  try {
    // Checkout is off. Never capture an order that was already opened.
    if (!paypalConfigured() || envOff('PAYPAL_CHECKOUT_ENABLED')) {
      return NextResponse.json({ paid: false, status: 'cancelled', error: 'PayPal is closed. This payment was not taken.' }, { status: 503 });
    }
    const { token, order: fallback } = await req.json();
    if (!token || typeof token !== 'string' || !/^[A-Z0-9]{5,40}$/.test(token)) {
      return NextResponse.json({ error: 'Missing PayPal order' }, { status: 400 });
    }

    // Capture (already-captured is fine), then read the full order back from
    // PayPal, which includes the line items and the capture result.
    try {
      await paypalApi(`/v2/checkout/orders/${token}/capture`, { method: 'POST', requestId: `cap-${token}` });
    } catch (err: any) {
      if (['INSTRUMENT_DECLINED', 'PAYER_ACTION_REQUIRED', 'ORDER_NOT_APPROVED'].includes(err.issue)) {
        return NextResponse.json({ paid: false, status: 'declined', retry: true });
      }
      if (err.issue !== 'ORDER_ALREADY_CAPTURED') throw err;
    }
    const ppOrder: any = await paypalApi(`/v2/checkout/orders/${token}`);

    const unit    = ppOrder.purchase_units?.[0] ?? {};
    const capture = unit.payments?.captures?.[0];
    const orderId = unit.custom_id || unit.reference_id;
    if (!orderId?.startsWith('APX-')) return NextResponse.json({ error: 'Unknown order' }, { status: 400 });
    if (fallback?.id && fallback.id !== orderId) return NextResponse.json({ error: 'Payment does not match this order' }, { status: 400 });
    if (ppOrder.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED') {
      // PENDING captures (e.g. eCheck) are paid later; record them as awaiting payment.
      return NextResponse.json({ paid: false, status: capture?.status ?? ppOrder.status });
    }

    const items = (unit.items ?? []).map((i: any) => ({ productId: i.sku, quantity: Number(i.quantity) || 1 }));
    const country = unit.shipping?.address?.country_code || fallback?.customer?.country || 'US';
    const freeShipping = Number(unit.amount?.breakdown?.shipping?.value ?? 1) === 0;
    const at = Date.parse(ppOrder.create_time ?? '') || undefined;
    const paid = Number(capture.amount?.value ?? 0);

    // The amount PayPal took must cover what this cart costs.
    const expected = rebuildOrderPricing(items, country, { at, freeShipping }).total;
    if (capture.amount?.currency_code !== 'USD' || paid + 0.01 < expected) {
      console.error(`PayPal amount mismatch for ${orderId}: paid ${paid}, expected ${expected}`);
      return NextResponse.json({ error: 'Payment amount does not match this order. Please contact us.' }, { status: 400 });
    }

    const fb = fallback?.customer ?? {};
    const addr = unit.shipping?.address ?? {};
    const customer = {
      name:        fb.name || unit.shipping?.name?.full_name || [ppOrder.payer?.name?.given_name, ppOrder.payer?.name?.surname].filter(Boolean).join(' '),
      email:       fb.email || ppOrder.payer?.email_address || '',
      phone:       fb.phone || ppOrder.payer?.phone?.phone_number?.national_number || '',
      line1:       fb.line1 || addr.address_line_1 || '',
      line2:       fb.line2 || addr.address_line_2 || undefined,
      city:        fb.city || addr.admin_area_2 || '',
      state:       fb.state || addr.admin_area_1 || '',
      postal_code: fb.postal_code || addr.postal_code || '',
      country,
      paypal_order:   ppOrder.id,
      paypal_capture: capture.id,
      paypal_payer:   ppOrder.payer?.email_address,
      paypal_payee:   unit.payee?.merchant_id,   // which PayPal account was paid
      amount_paid_usd: paid,
    };

    await forgetPendingCheckout(orderId);
    const res = await recordOrder(
      { id: orderId, status: 'paid', paymentMethod: 'paypal', customer, items },
      { saveFirst: true, at, freeShipping },
    );
    return NextResponse.json({ paid: true, orderId, amount: paid, duplicate: res.duplicate });
  } catch (err: any) {
    console.error('PayPal capture error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not confirm your PayPal payment. If you were charged, contact us — your payment is safe.' }, { status: 500 });
  }
}
