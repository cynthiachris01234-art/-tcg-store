'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loadOrders, clearOrders, type StoredOrder } from '@/lib/orders';
import { Package, Trash2, ChevronDown, ChevronUp, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { BRAND_META } from '@/lib/brands';
import type { Brand, ProductType } from '@/types';

function typeLabel(t: ProductType | string): string {
  const map: Record<string, string> = {
    case: 'Case', etb: 'ETB', upc: 'UPC', spc: 'SPC',
    bundle: 'Bundle', premium_collection: 'PC',
    display_case: 'Display', poster_collection: 'Poster',
    booster_box: 'Booster Box',
  };
  return map[t] ?? t;
}

function statusPill(status: StoredOrder['status']) {
  const styles: Record<string, string> = {
    awaiting_payment: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    pending:          'bg-blue-500/20 text-blue-300 border-blue-500/30',
    paid:             'bg-green-500/20 text-green-400 border-green-500/30',
  };
  const labels: Record<string, string> = {
    awaiting_payment: 'AWAITING PAYMENT',
    pending:          'PENDING',
    paid:             'PAID',
  };
  return (
    <span className={`badge border text-xs px-2 py-0.5 ${styles[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {labels[status] ?? status.toUpperCase()}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function OrderRow({ order }: { order: StoredOrder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
          {/* Order ID + date */}
          <div>
            <p className="text-white font-mono text-sm font-semibold truncate">{order.id}</p>
            <p className="text-muted text-xs mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          {/* Customer */}
          <div className="hidden sm:block">
            <p className="text-white text-sm font-medium truncate">{order.customer.name}</p>
            <p className="text-muted text-xs truncate">{order.customer.email}</p>
          </div>
          {/* Items */}
          <div className="hidden sm:block">
            <p className="text-white text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
            <p className="text-muted text-xs">
              {order.items.slice(0, 2).map(i => i.setName).join(', ')}
              {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
            </p>
          </div>
          {/* Total + status */}
          <div className="text-right">
            <p className="text-white font-bold text-sm">${order.total.toFixed(2)}</p>
            <div className="flex justify-end mt-1">{statusPill(order.status)}</div>
          </div>
        </div>
        <div className="text-muted flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-bg-border px-4 pb-4 pt-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer info */}
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-2">Customer</p>
              <div className="card p-3 space-y-1 text-sm">
                <p className="text-white font-semibold">{order.customer.name}</p>
                <p className="text-muted">📧 {order.customer.email}</p>
                {order.customer.phone && <p className="text-muted">📱 {order.customer.phone}</p>}
                <p className="text-muted">{order.customer.line1}{order.customer.line2 ? `, ${order.customer.line2}` : ''}</p>
                <p className="text-muted">{order.customer.city}, {order.customer.state} {order.customer.postal_code}</p>
                <p className="text-muted">{order.customer.country}</p>
                {order.paymentMethod && (
                  <div className="mt-2 pt-2 border-t border-bg-border flex items-center gap-2">
                    <span className="text-accent text-xs font-bold uppercase tracking-widest">Payment:</span>
                    <span className="text-white text-xs font-semibold">
                      {({ card: 'Credit / Debit Card', wise: 'Wise Transfer', applepay: 'Apple Pay', cashapp: 'Cash App' } as Record<string,string>)[order.paymentMethod] ?? order.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order totals */}
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-2">Totals</p>
              <div className="card p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-white">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-success">Case discount</span>
                    <span className="text-success">−${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-bg-border pt-2 font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-muted uppercase tracking-widest mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const brand = BRAND_META[item.brand as Brand];
                return (
                  <div key={idx} className="card p-3 flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-bg rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl || '/placeholder-box.png'}
                        alt={item.setName}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{item.setName}</p>
                      <p className="text-xs" style={{ color: brand?.primaryColor ?? '#888' }}>
                        {brand?.name ?? item.brand} · {typeLabel(item.productType)} · {item.language.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-sm font-bold">${item.total.toFixed(2)}</p>
                      <p className="text-muted text-xs">${item.unitPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<'db' | 'local'>('local');

  async function refresh() {
    // Try Supabase first
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders && data.orders.length > 0) {
        // Map Supabase shape → StoredOrder shape
        const mapped: StoredOrder[] = data.orders.map((o: any) => ({
          id:            o.id,
          createdAt:     o.created_at,
          status:        o.status ?? 'awaiting_payment',
          paymentMethod: o.payment_method ?? o.paymentMethod,
          customer:      o.customer,
          items:         o.items,
          subtotal:      o.subtotal_usd,
          discount:      o.discount_usd,
          total:         o.total_usd,
        }));
        setOrders(mapped);
        setSource('db');
        return;
      }
    } catch {}
    // Fallback to localStorage
    setOrders(loadOrders());
    setSource('local');
  }

  useEffect(() => {
    refresh().finally(() => setLoaded(true));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-muted text-sm mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} · ${totalRevenue.toFixed(2)} total revenue
              {loaded && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${source === 'db' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {source === 'db' ? '● Live database' : '● Local only'}
              </span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </button>
          {orders.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm('Delete all orders? This cannot be undone.')) return;
                await fetch('/api/orders', { method: 'DELETE' });
                clearOrders();
                refresh();
              }}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors px-3 py-2 rounded-lg hover:bg-danger/10"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {loaded && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders',   value: orders.length,                            suffix: '' },
            { label: 'Total Revenue',  value: `$${totalRevenue.toFixed(2)}`,             suffix: '' },
            { label: 'Avg Order Value',value: `$${(totalRevenue / orders.length).toFixed(2)}`, suffix: '' },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-muted text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      {!loaded ? (
        <div className="text-center py-20 text-muted">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
          <p className="text-white text-lg font-semibold mb-2">No orders yet</p>
          <p className="text-muted text-sm mb-6">Orders placed in your store will appear here.</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            <Package className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="mt-8 card p-4 border border-blue-500/20 bg-blue-500/5">
        <p className="text-blue-300 text-xs font-semibold mb-1">💡 How orders work</p>
        <p className="text-muted text-xs">
          New orders arrive here and on your WhatsApp. Card orders (Stripe) are paid instantly — check the{' '}
          <span className="text-white font-semibold">Payments</span> tab for card transactions. For manual orders,
          send the customer their payment details via{' '}
          <span className="text-white font-semibold">Wise, Apple Pay, or Cash App</span>, then mark them as paid once received.
        </p>
      </div>
    </div>
  );
}
