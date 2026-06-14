import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { notifyNewOrder } from '@/lib/notify';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// POST /api/orders — save a new order + fire notifications
export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();

    // Normalise items: StoredOrder uses camelCase (unitPrice), notify expects it too
    const notifyPayload = {
      id:            body.id,
      status:        body.status,
      paymentMethod: body.paymentMethod,
      customer:      body.customer,
      items: (body.items ?? []).map((i: any) => ({
        setName:   i.setName   ?? i.set_name ?? '',
        brand:     i.brand     ?? '',
        language:  i.language  ?? '',
        quantity:  i.quantity  ?? 1,
        unitPrice: i.unitPrice ?? i.unit_price_usd ?? 0,
        total:     i.total     ?? 0,
      })),
      subtotal_usd:  body.subtotal_usd ?? 0,
      discount_usd:  body.discount_usd ?? 0,
      total_usd:     body.total_usd    ?? 0,
    };

    // Always send notifications first
    await notifyNewOrder(notifyPayload);

    // Save to Supabase if configured
    let dbError: string | null = null;
    if (supabaseUrl && serviceRoleKey && !serviceRoleKey.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from('store_orders').insert({
        id:             body.id,
        status:         body.status,
        payment_method: body.paymentMethod,
        customer:       body.customer,
        items:          body.items,
        subtotal_usd:   body.subtotal_usd,
        discount_usd:   body.discount_usd,
        total_usd:      body.total_usd,
      });
      if (error) {
        console.error('Supabase insert error:', error);
        dbError = error.message;
      }
    }

    return NextResponse.json({ ok: true, dbError });
  } catch (err: any) {
    // Best-effort fallback notification
    if (body) try { await notifyNewOrder(body); } catch {}
    console.error('Order save error:', err);
    return NextResponse.json({ ok: true });
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
