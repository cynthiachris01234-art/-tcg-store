import { NextResponse } from 'next/server';

// Retired. Orders are placed through POST /api/orders (Wise / Venmo / Apple Pay,
// confirmed on WhatsApp) and nobody can pay directly on the site. This route
// used to create Stripe card payments, so it is closed rather than left open.
export async function POST() {
  return NextResponse.json(
    { error: 'Direct payment is not available. Please choose Wise, Venmo or Apple Pay and confirm on WhatsApp.' },
    { status: 410 },
  );
}
