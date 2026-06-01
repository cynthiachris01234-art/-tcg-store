import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { fetchTCGPlayerPrice, calcOurPrice } from '@/lib/pricing';

/**
 * Weekly price sync endpoint.
 * Triggered by a cron job (Vercel Cron / GitHub Actions / Supabase pg_cron).
 *
 * POST /api/pricing/sync
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch all products
  const { data: products, error } = await admin.from('products').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  const errors: string[] = [];

  for (const product of products ?? []) {
    try {
      let marketPrice: number | null = null;

      // Pick price source based on language
      if (product.language === 'en') {
        marketPrice = await fetchTCGPlayerPrice(`${product.set_name} Booster Box`);
      }
      // JP and KR prices are managed manually or via separate scrapers

      if (marketPrice && marketPrice > 0) {
        const ourPrice = calcOurPrice(marketPrice, product.product_type === 'case');
        await admin
          .from('products')
          .update({
            market_price_usd: marketPrice,
            our_price_usd:    ourPrice,
            last_price_sync:  new Date().toISOString(),
          })
          .eq('id', product.id);
        updated++;
      }
    } catch (e: any) {
      errors.push(`${product.id}: ${e.message}`);
    }
  }

  return NextResponse.json({ updated, errors, total: products?.length ?? 0 });
}
