import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { paypalApi, paypalConfigured, paypalMerchantId } from '@/lib/paypal';
import { sweepAbandonedCheckouts } from '@/lib/pendingCheckout';

// Paid PayPal orders from our own order list. PayPal's transaction history
// lags by up to a few hours, so these fill the gap until it catches up.
async function recentPayPalOrders(sinceIso: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const base = () => supabase.from('store_orders')
    .select('id,created_at,status,total_usd,customer,payment_method')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false });
  let { data, error } = await base();
  if (error && /payment_method/i.test(error.message ?? '')) {
    const retry: { data: any; error: any } = await supabase.from('store_orders')
      .select('id,created_at,status,total_usd,customer')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });
    data = retry.data;
    error = retry.error;
  }
  if (error) console.error('PayPal order lookup:', error.message);
  return (data ?? []).filter((o: any) => {
    const c = o.customer ?? {};
    return o.payment_method === 'paypal' || c.payment_method === 'paypal' || c.paypal_capture;
  });
}

export const dynamic = 'force-dynamic';

// GET /api/admin/paypal?days=30 — PayPal payments for the admin dashboard
// (admin-only; protected by middleware). Uses PayPal's transaction search,
// which can lag real time by up to ~3 hours, plus the live balance.
// PayPal rejects milliseconds and an end date even a second in the future.
const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

// PayPal event codes → plain words
function kind(code: string): string {
  if (code === 'T0006' || code === 'T0003' || code === 'T0000' || code === 'T0001') return 'Payment';
  if (code === 'T0011' || code === 'T0013') return 'Payment';
  if (code.startsWith('T11')) return 'Refund';
  if (code.startsWith('T12')) return 'Dispute / reversal';
  if (code.startsWith('T04')) return 'Withdrawal to bank';
  if (code.startsWith('T03')) return 'Bank deposit';
  if (code.startsWith('T02')) return 'Currency conversion';
  if (code.startsWith('T07')) return 'Card funding';
  if (code.startsWith('T15')) return 'Hold / release';
  if (code.startsWith('T01')) return 'Fee';
  return code;
}

const STATUS: Record<string, string> = { S: 'Completed', P: 'Pending', D: 'Denied', V: 'Reversed', F: 'Partially refunded' };

export async function GET(req: NextRequest) {
  try {
    if (!paypalConfigured()) return NextResponse.json({ configured: false, transactions: [], balances: [] });
    await sweepAbandonedCheckouts().catch(() => {});
    const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days') ?? 30), 1), 90);

    // Transaction search allows at most 31 days per request, and the end
    // date must be in the past. Walk back in 30-day windows.
    const now = Date.now();
    const endCap = now - 2 * 60 * 1000;
    const earliest = endCap - days * 864e5;
    const windows: [Date, Date][] = [];
    for (let end = endCap; end - earliest > 1000;) {
      const start = Math.max(earliest, end - 30 * 864e5);
      windows.push([new Date(start), new Date(end)]);
      if (start <= earliest) break;
      end = start;
    }
    // Some keys aren't allowed to read the account's history/balance
    // (PayPal "Transaction Search" permission); track that for the dashboard.
    let reportingAvailable = true;
    let reportingError = '';
    const searchWindow = async (s: Date, e: Date) => {
      const details: any[] = [];
      for (let page = 1; page <= 10; page++) {
        const data = await paypalApi(`/v1/reporting/transactions?start_date=${encodeURIComponent(iso(s))}&end_date=${encodeURIComponent(iso(e))}&fields=all&page_size=500&page=${page}`);
        details.push(...(data.transaction_details ?? []));
        if (page >= Number(data.total_pages ?? 1)) break;
      }
      return details;
    };
    const pages = await Promise.all(windows.map(([s, e]) =>
      searchWindow(s, e)
        .catch((err: any) => { reportingAvailable = false; reportingError ||= String(err?.message ?? err); return []; })));

    const transactions: any[] = pages.flat().map((t: any) => {
      const ti = t.transaction_info ?? {};
      const pi = t.payer_info ?? {};
      const code = ti.transaction_event_code ?? '';
      const amount = Number(ti.transaction_amount?.value ?? 0);
      const fee = Number(ti.fee_amount?.value ?? 0);
      const orderId = [ti.custom_field, ti.invoice_id].find((v: string) => typeof v === 'string' && v.startsWith('APX-')) ?? null;
      return {
        id: ti.transaction_id,
        date: ti.transaction_initiation_date,
        type: kind(code),
        code,
        status: STATUS[ti.transaction_status] ?? ti.transaction_status,
        amount, fee, net: +(amount + fee).toFixed(2),
        currency: ti.transaction_amount?.currency_code ?? 'USD',
        orderId,
        fromApex: !!orderId,
        payerName: pi.payer_name?.alternate_full_name ?? [pi.payer_name?.given_name, pi.payer_name?.surname].filter(Boolean).join(' ') ?? null,
        payerEmail: pi.email_address ?? null,
        note: ti.transaction_subject || ti.transaction_note || null,
      };
    })
    // Hide PayPal's internal funding/conversion legs; keep money in and out.
    .filter((t: any) => !['Card funding', 'Currency conversion'].includes(t.type));

    // Add store orders PayPal hasn't listed yet (matched on the capture id).
    const listed = new Set(transactions.map((t: any) => t.id));
    const listedOrders = new Set(transactions.map((t: any) => t.orderId).filter(Boolean));
    const currentMerchant = paypalMerchantId();
    for (const o of await recentPayPalOrders(new Date(now - days * 864e5).toISOString())) {
      const c = o.customer ?? {};
      if ((c.paypal_capture && listed.has(c.paypal_capture)) || listedOrders.has(o.id)) continue;
      // Orders from before payee tracking went to the previous PayPal account.
      const payee = c.paypal_payee || 'NCHBGFJGXSUVQ';
      const previousAccount = !!currentMerchant && payee !== currentMerchant;
      const amount = Number(c.amount_paid_usd ?? o.total_usd ?? 0);
      transactions.push({
        id: c.paypal_capture || o.id, date: o.created_at, type: 'Payment', code: 'APEX',
        status: o.status === 'paid' ? 'Completed' : 'Pending', amount, fee: 0, net: amount, currency: 'USD',
        orderId: o.id, fromApex: true,
        payerName: c.name ?? null, payerEmail: c.paypal_payer ?? c.email ?? null,
        note: previousAccount ? 'Paid to a previous PayPal account' : 'From your order records',
        justIn: reportingAvailable && !previousAccount && o.status === 'paid', previousAccount,
      });
    }
    transactions.sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));

    const payments = transactions.filter((t: any) => t.type === 'Payment' && t.amount > 0 && t.currency === 'USD');
    const balance = await paypalApi('/v1/reporting/balances?currency_code=USD').catch(() => ({ balances: [] }));

    return NextResponse.json({
      configured: true,
      reportingAvailable,
      reportingError: reportingError || undefined,
      merchantId: currentMerchant,
      days,
      transactions,
      balances: (balance.balances ?? []).map((b: any) => ({
        currency: b.currency,
        available: Number(b.available_balance?.value ?? 0),
        withheld: Number(b.withheld_balance?.value ?? 0),
        total: Number(b.total_balance?.value ?? 0),
      })),
      meta: {
        // Totals cover the current PayPal account only.
        received: +payments.filter((t: any) => !t.previousAccount).reduce((s: number, t: any) => s + t.amount, 0).toFixed(2),
        fees: +payments.reduce((s: number, t: any) => s + t.fee, 0).toFixed(2),
        count: payments.filter((t: any) => !t.previousAccount).length,
        apexCount: payments.filter((t: any) => t.fromApex && !t.previousAccount).length,
        apexReceived: +payments.filter((t: any) => t.fromApex && !t.previousAccount).reduce((s: number, t: any) => s + t.amount, 0).toFixed(2),
        refunds: +transactions.filter((t: any) => t.type === 'Refund').reduce((s: number, t: any) => s + t.amount, 0).toFixed(2),
      },
    });
  } catch (err: any) {
    console.error('Admin PayPal error:', err?.message ?? err);
    return NextResponse.json({ configured: paypalConfigured(), transactions: [], balances: [], error: 'Could not load PayPal payments' }, { status: 500 });
  }
}
