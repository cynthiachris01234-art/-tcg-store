import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Send restock notification emails.
 * Called from a Supabase database trigger or cron job after stock is updated.
 *
 * POST /api/restock
 * Body: { product_id: string }
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { product_id }: { product_id: string } = await req.json();
  const admin = createAdminClient();

  // Get product
  const { data: product } = await admin.from('products').select('*').eq('id', product_id).single();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Get all subscribers
  const { data: alerts } = await admin
    .from('restock_alerts')
    .select('email')
    .eq('product_id', product_id)
    .is('notified_at', null);

  if (!alerts?.length) return NextResponse.json({ sent: 0 });

  const emails = alerts.map((a: any) => a.email);
  let sent = 0;

  // Send via Resend
  for (const email of emails) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `🎉 ${product.set_name} is back in stock!`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
              <h1 style="color:#C8962A">Apex TCG</h1>
              <p>Great news! <strong>${product.set_name}</strong> is back in stock.</p>
              <p>Don't miss out — grab it at 30% below market price before it sells out again.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}"
                style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
                Shop Now — $${product.our_price_usd}
              </a>
            </div>
          `,
        }),
      });
      sent++;
    } catch { /* log and continue */ }
  }

  // Mark as notified
  await admin
    .from('restock_alerts')
    .update({ notified_at: new Date().toISOString() })
    .eq('product_id', product_id)
    .in('email', emails);

  return NextResponse.json({ sent });
}
