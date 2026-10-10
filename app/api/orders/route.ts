import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { recordOrder, rebuildOrderPricing } from '@/lib/orderRecord';
import { envOff } from '@/lib/env';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Payment methods customers can choose. Orders are placed on the site and
// confirmed on WhatsApp, where the store sends the payment details.
const MANUAL_METHODS = ['wise', 'venmo', 'applepay'];

function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'APX-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// POST /api/orders — place an order (awaiting payment) + notify the store.
// The server creates the order number and prices everything from the live
// catalog; the client's prices and status are never trusted.
export async function POST(req: Request) {
  let body: any = null;
  try {
    // Wise / Venmo / Apple Pay orders are on. Set MANUAL_ORDERS_ENABLED=false
    // to switch them off.
    if (envOff('MANUAL_ORDERS_ENABLED')) {
      return NextResponse.json({ ok: false, error: 'Ordering is paused right now. Please WhatsApp us.' }, { status: 403 });
    }
    body = await req.json();
    const method = String(body.paymentMethod ?? '');
    if (!MANUAL_METHODS.includes(method)) {
      return NextResponse.json({ ok: false, error: 'Please choose Wise, Venmo or Apple Pay.' }, { status: 400 });
    }
    const c = body.customer ?? {};
    if (!c.name || !(c.email || c.phone) || !c.line1 || !c.city) {
      return NextResponse.json({ ok: false, error: 'Please fill in your name, contact details and shipping address.' }, { status: 400 });
    }
    const items = (body.items ?? []).slice(0, 50);
    const check = rebuildOrderPricing(items, c.country ?? 'US');
    if (!check.items.length || check.total <= 0) return NextResponse.json({ ok: false, error: 'Your cart is empty.' }, { status: 400 });
    if (check.minimumError) return NextResponse.json({ ok: false, error: check.minimumError }, { status: 400 });

    const id = generateOrderId();
    const { priced, dbError } = await recordOrder({
      id, status: 'awaiting_payment', paymentMethod: method,
      customer: { ...c, confirm_via: 'whatsapp' }, items,
    });
    return NextResponse.json({
      ok: true, orderId: id, totalUsd: priced.total, dbError,
      items: priced.items.map(i => ({ setName: i.setName, quantity: i.quantity })),
    });
  } catch (err: any) {
    console.error('Order save error:', err);
    return NextResponse.json({ ok: false, error: 'Could not place your order. Please try again or WhatsApp us.' }, { status: 500 });
  }
}

// DELETE /api/orders — wipe all orders (admin use only)
export async function DELETE() {
  try {
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return NextResponse.json({ ok: true });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from('store_orders').delete().neq('id', '');
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Order delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/orders — fetch all orders for admin panel
export async function GET() {
  try {
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return NextResponse.json({ orders: [] });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('store_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] });
  } catch (err: any) {
    console.error('Order fetch error:', err);
    return NextResponse.json({ orders: [] });
  }
}
