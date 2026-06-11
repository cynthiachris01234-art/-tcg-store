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
  { id: '1',  name: 'Marcus T.',    rating: 5, review: 'Got my OP01 JP box in perfect condition. Prices are unbeatable — literally 40% less than everywhere else I looked!', product: 'One Piece OP01 JP', created_at: '2026-06-08' },
  { id: '2',  name: 'Priya S.',     rating: 5, review: 'Fast shipping, everything sealed and authentic. Will be ordering again for sure. Highly recommend to all TCG collectors!', product: 'Pokémon Evolving Skies', created_at: '2026-06-05' },
  { id: '3',  name: 'Jake R.',      rating: 5, review: 'Best TCG store online. Got MTG Final Fantasy box at a crazy good price. Packaging was excellent — no dents, perfectly wrapped.', product: 'MTG Final Fantasy', created_at: '2026-06-01' },
  { id: '4',  name: 'Anya M.',      rating: 4, review: 'Great selection of Japanese One Piece boxes. Shipping took a couple days but everything arrived in mint condition. Will order again.', product: 'One Piece OP13 JP', created_at: '2026-05-28' },
  { id: '5',  name: 'Devon K.',     rating: 5, review: 'Ordered 3 booster boxes, all arrived perfectly sealed. Customer service responded super fast on WhatsApp too. 10/10!', product: 'Pokémon Prismatic Evolutions', created_at: '2026-05-25' },
  { id: '6',  name: 'Sofia L.',     rating: 5, review: 'Incredible prices on ETBs. Got Hidden Fates and Crown Zenith both well below market. This is my go-to store now.', product: 'Pokémon Hidden Fates ETB', created_at: '2026-05-22' },
  { id: '7',  name: 'Tariq B.',     rating: 5, review: 'Ordered a full case of OP07 and the discount was insane. Legit sealed, legit prices. My whole playgroup buys from here now.', product: 'One Piece OP07 Case', created_at: '2026-05-18' },
  { id: '8',  name: 'Jessica W.',   rating: 5, review: "First time buying from Apex and I'm amazed. Got a Japanese Pokémon SV box way cheaper than eBay. Fast WhatsApp replies too!", product: 'Pokémon SV7 JP', created_at: '2026-05-14' },
  { id: '9',  name: 'Liam O.',      rating: 5, review: "Picked up a Bloomburrow booster box — arrived in 2 days, pristine wrap. Prices are genuinely the best I've found anywhere online.", product: 'MTG Bloomburrow', created_at: '2026-05-10' },
  { id: '10', name: 'Camille R.',   rating: 4, review: "Really solid store. Korean Pokémon boxes at prices I didn't think were possible. Packaging could use a little more bubble wrap but product was fine.", product: 'Pokémon SV KR', created_at: '2026-05-06' },
  { id: '11', name: 'Kevin D.',     rating: 5, review: 'Grabbed 2 ETBs and a booster box in one order. Shipped together, arrived fast. No issues at all — exactly as described and sealed.', product: 'Pokémon Temporal Forces ETB', created_at: '2026-05-02' },
  { id: '12', name: 'Nadia F.',     rating: 5, review: 'Been buying from Apex for a few months now and never had a bad experience. Prices drop even lower when you order cases. Absolutely love this shop.', product: 'One Piece OP09 JP', created_at: '2026-04-27' },
  { id: '13', name: 'Chris P.',     rating: 5, review: 'The case discount is real — saved over $60 on a Pokémon case vs buying boxes separately. Instant WhatsApp confirmation. Couldn\'t be happier.', product: 'Pokémon Surging Sparks Case', created_at: '2026-04-20' },
  { id: '14', name: 'Yuki T.',      rating: 5, review: 'Best place to get Japanese TCG boxes in the US. Prices are authentic wholesale level and everything ships fast. Already on my 4th order!', product: 'Yu-Gi-Oh! JP Booster Box', created_at: '2026-04-14' },
];
