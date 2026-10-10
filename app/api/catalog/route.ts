import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

// POST { ids: string[] } — return those catalog rows. Used by the cart so the
// browser never has to download the full product list.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.slice(0, 80).map(String) : [];
    if (!ids.length) return NextResponse.json({ products: [] });
    const want = new Set(ids);
    const products = MOCK_PRODUCTS.filter(p => want.has(p.id));
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
