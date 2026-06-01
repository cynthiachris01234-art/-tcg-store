import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { notifyNewOrder } from '@/lib/notify';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// POST /api/orders — save a new order
export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();

    // Always send notifications first — regardless of DB
    await notifyNewOrder(body);

    // Save to DB if configured
    if (supabaseUrl && serviceRoleKey && !serviceRoleKey.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from('store_orders').insert({
        id:           body.id,
        status:       body.status,
        customer:     body.customer,
        items:        body.items,
        subtotal_usd: body.subtotal_usd,
        discount_usd: body.discount_usd,
        total_usd:    body.total_usd,
      });
      if (error) console.error('Supabase insert error:', error);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (body) try { await notifyNewOrder(body); } catch {}
    console.error('Order save error:', err);
    return NextResponse.json({ ok: true });
  }
}

// GET /api/orders — fetch all orders for admin
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
