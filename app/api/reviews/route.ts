import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function db() { return createClient(url, key); }

// GET — fetch approved reviews
export async function GET() {
  try {
    if (!url || !key || key.includes('placeholder')) {
      return NextResponse.json({ reviews: [] });
    }
    const { data, error } = await db()
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ reviews: data ?? [] });
  } catch {
    return NextResponse.json({ reviews: [] });
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
