'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadOrders } from '@/lib/orders';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { BRAND_META } from '@/lib/brands';
import type { Brand } from '@/types';
import {
  Package, ShoppingBag, DollarSign, TrendingUp,
  AlertTriangle, Star, ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<ReturnType<typeof loadOrders>>([]);

  useEffect(() => { setOrders(loadOrders()); }, []);

  const totalRevenue   = orders.reduce((s, o) => s + o.total, 0);
  const totalProducts  = MOCK_PRODUCTS.length;
  const outOfStock     = MOCK_PRODUCTS.filter(p => p.stock_quantity === 0 && !p.is_pre_order).length;
  const preOrders      = MOCK_PRODUCTS.filter(p => p.is_pre_order).length;
  const inStock        = MOCK_PRODUCTS.filter(p => p.stock_quantity > 0).length;

  // Brand breakdown
  const brandCounts = (['pokemon','onepiece','mtg','yugioh'] as Brand[]).map(b => ({
    brand: b,
    meta: BRAND_META[b],
    count: MOCK_PRODUCTS.filter(p => p.brand === b).length,
    revenue: orders.filter(o => o.items.some(i => i.brand === b)).reduce((s, o) => s + o.total, 0),
  }));

  const STATS = [
    { label: 'Total Products',  value: totalProducts,            icon: Package,     color: '#C8962A' },
    { label: 'Total Orders',    value: orders.length,            icon: ShoppingBag, color: '#3B82F6' },
    { label: 'Total Revenue',   value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22C55E' },
    { label: 'In Stock',        value: inStock,                  icon: TrendingUp,  color: '#A855F7' },
  ];

  // Low stock (1–3 units)
  const lowStock = MOCK_PRODUCTS
    .filter(p => p.stock_quantity > 0 && p.stock_quantity <= 3)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back — here's what's happening in your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand breakdown */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" /> Products by Brand
          </h2>
          <div className="space-y-3">
            {brandCounts.map(({ brand, meta, count }) => (
              <div key={brand} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.primaryColor }} />
                <span className="text-sm text-white flex-1">{meta.name}</span>
                <div className="flex-1 bg-bg-border rounded-full h-1.5 mx-2">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${(count / totalProducts) * 100}%`, background: meta.primaryColor }}
                  />
                </div>
                <span className="text-muted text-xs w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/products" className="mt-4 flex items-center gap-1 text-accent text-xs hover:underline">
            Manage products <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Low stock alert */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-muted text-sm">All products are well stocked.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-bg-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.set_name}</p>
                    <p className="text-muted text-xs">{BRAND_META[p.brand]?.name} · {p.language.toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.stock_quantity === 1 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats row */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'In Stock',     value: inStock,      color: '#22C55E' },
              { label: 'Out of Stock', value: outOfStock,   color: '#EF4444' },
              { label: 'Pre-Orders',   value: preOrders,    color: '#3B82F6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ background: `${color}0d` }}>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-muted text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
