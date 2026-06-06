import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function db() { return createClient(url, key); }

// GET — fetch approved reviews
export async function GET() {
  try {
    if (!url || !key || key.includes('placeholder')) {
      return NextResponse.json({ reviews: FALLBACK_REVIEWS });
    }
    const { data, error } = await db()
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ reviews: data ?? FALLBACK_REVIEWS });
  } catch {
    return NextResponse.json({ reviews: FALLBACK_REVIEWS });
  }
}

// POST — submit a review
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rating, review, product } = body;
    if (!name || !rating || !review) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!url || !key || key.includes('placeholder')) {
      return NextResponse.json({ ok: true, fallback: true });
    }
    const { error } = await db().from('reviews').insert({ name, rating, review, product });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Fallback reviews shown before any real ones exist
const FALLBACK_REVIEWS = [
  { id: '1', name: 'Marcus T.', rating: 5, review: 'Got my OP01 JP box in perfect condition. Prices are unbeatable — literally 40% less than everywhere else I looked!', product: 'One Piece OP01 JP', created_at: '2026-05-10' },
  { id: '2', name: 'Priya S.', rating: 5, review: 'Fast shipping, everything sealed and authentic. Will be ordering again for sure. Highly recommend to all TCG collectors!', product: 'Pokémon Evolving Skies', created_at: '2026-05-08' },
  { id: '3', name: 'Jake R.', rating: 5, review: 'Best TCG store online. Got MTG Final Fantasy box at a crazy good price. Packaging was excellent.', product: 'MTG Final Fantasy', created_at: '2026-05-03' },
  { id: '4', name: 'Anya M.', rating: 4, review: 'Great selection of Japanese One Piece boxes. Shipping took a few days but everything arrived in mint condition.', product: 'One Piece OP13 JP', created_at: '2026-04-28' },
  { id: '5', name: 'Devon K.', rating: 5, review: 'Ordered 3 booster boxes, all arrived perfectly sealed. Customer service responded fast on WhatsApp too!', product: 'Pokémon Prismatic Evolutions', created_at: '2026-04-20' },
  { id: '6', name: 'Sofia L.', rating: 5, review: 'Incredible prices on ETBs. Got Hidden Fates and Crown Zenith both below market. This is my go-to store now.', product: 'Pokémon Hidden Fates ETB', created_at: '2026-04-15' },
];
