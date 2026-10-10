import { NextRequest, NextResponse } from 'next/server';
import { sweepAbandonedCheckouts } from '@/lib/pendingCheckout';

export const dynamic = 'force-dynamic';

// GET /api/cron/abandoned — catch PayPal checkouts where the customer closed
// the tab instead of pressing cancel. Vercel Cron calls this once a day.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization') ?? '';
  const fromCron = req.headers.get('user-agent')?.toLowerCase().includes('vercel-cron');
  if (secret) {
    if (header !== `Bearer ${secret}`) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  } else if (!fromCron) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const result = await sweepAbandonedCheckouts();
  return NextResponse.json({ ok: true, ...result });
}
