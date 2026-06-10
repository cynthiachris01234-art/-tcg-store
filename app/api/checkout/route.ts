import { NextRequest, NextResponse } from 'next/server';

// Generate a human-readable order ID: APX-XXXXXX
function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.cart?.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderId = generateOrderId();
    return NextResponse.json({ orderId });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
