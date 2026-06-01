'use client';

import type { Cart } from '@/types';

export interface StoredOrder {
  id: string;
  createdAt: string;
  status: 'demo' | 'paid' | 'pending';
  customer: {
    name: string;
    email: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    productId: string;
    setName: string;
    brand: string;
    language: string;
    productType: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
}

const ORDERS_KEY = 'apex-tcg-orders';

// Save order to Supabase via API route
async function saveToSupabase(order: StoredOrder): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id:           order.id,
        status:       order.status,
        customer:     order.customer,
        items:        order.items,
        subtotal_usd: order.subtotal,
        discount_usd: order.discount,
        total_usd:    order.total,
      }),
    });
  } catch (err) {
    console.warn('Supabase save failed, using localStorage only', err);
  }
}

export function saveOrder(
  orderId: string,
  cart: Cart,
  customer: StoredOrder['customer'],
  status: StoredOrder['status'] = 'demo'
): StoredOrder {
  const order: StoredOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status,
    customer,
    items: cart.items.map((i) => ({
      productId:   i.product.id,
      setName:     i.product.set_name,
      brand:       i.product.brand,
      language:    i.product.language,
      productType: i.product.product_type,
      imageUrl:    i.product.image_url,
      quantity:    i.quantity,
      unitPrice:   i.product.our_price_usd,
      total:       +(i.product.our_price_usd * i.quantity).toFixed(2),
    })),
    subtotal: cart.subtotal_usd,
    discount: cart.bundle_discount,
    total:    cart.total_usd,
  };

  // Save to localStorage
  try {
    const existing = loadOrders();
    existing.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
  } catch {}

  return order;
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ORDERS_KEY);
}
