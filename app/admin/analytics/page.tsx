'use client';

import { useEffect, useState } from 'react';
import { loadOrders } from '@/lib/orders';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { BRAND_META } from '@/lib/brands';
import type { Brand } from '@/types';
import { BarChart2, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<ReturnType<typeof loadOrders>>([]);
  useEffect(() => setOrders(loadOrders()), []);

  const brands = (['pokemon','onepiece','mtg','yugioh'] as Brand[]).map(b => {
    const products  = MOCK_PRODUCTS.filter(p => p.brand === b);
    const totalMV   = products.reduce((s, p) => s + p.market_price_usd, 0);
    const totalOurs = products.reduce((s, p) => s + p.our_price_usd, 0);
    const inStock   = products.filter(p => p.stock_quantity > 0).length;
    return { brand: b, meta: BRAND_META[b], count: products.length, totalMV, totalOurs, inStock };
  });

  const langs = ['en','jp','kr'].map(l => ({
    lang: l,
    count: MOCK_PRODUCTS.filter(p => p.language === l).length,
    flag: l === 'en' ? '🇺🇸' : l === 'jp' ? '🇯🇵' : '🇰🇷',
  }));

  const types = Object.entries(
    MOCK_PRODUCTS.reduce<Record<string,number>>((acc, p) => {
      acc[p.product_type] = (acc[p.product_type] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const TYPE_LABEL: Record<string,string> = {
    booster_box: 'Booster Box', case: 'Case', etb: 'ETB', upc: 'UPC',
    spc: 'SPC', bundle: 'Bundle', premium_collection: 'PC',
    display_case: 'Display', poster_collection: 'Poster',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-muted text-sm mt-1">Catalog and sales breakdown.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand breakdown */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent" /> Products by Brand
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left text-xs text-muted pb-2">Brand</th>
                <th className="text-right text-xs text-muted pb-2">Products</th>
                <th className="text-right text-xs text-muted pb-2">In Stock</th>
                <th className="text-right text-xs text-muted pb-2">Catalog Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {brands.map(({ brand, meta, count, totalOurs, inStock }) => (
                <tr key={brand} className="hover:bg-white/5">
                  <td className="py-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.primaryColor}20`, color: meta.primaryColor }}>
                      {meta.name}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-white">{count}</td>
                  <td className="py-2.5 text-right text-green-400">{inStock}</td>
                  <td className="py-2.5 text-right text-accent">${totalOurs.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Language split */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Products by Language
          </h2>
          <div className="space-y-4">
            {langs.map(({ lang, count, flag }) => (
              <div key={lang} className="flex items-center gap-3">
                <span className="text-lg">{flag}</span>
                <span className="text-sm text-white uppercase font-mono w-6">{lang}</span>
                <div className="flex-1 bg-bg-border rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(count / MOCK_PRODUCTS.length) * 100}%` }}
                  />
                </div>
                <span className="text-muted text-xs w-12 text-right">{count} ({Math.round((count/MOCK_PRODUCTS.length)*100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product types */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent" /> Products by Type
          </h2>
          <div className="space-y-2">
            {types.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-muted w-28 flex-shrink-0">{TYPE_LABEL[type] ?? type}</span>
                <div className="flex-1 bg-bg-border rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(count / MOCK_PRODUCTS.length) * 100}%`, background: '#C8962A' }}
                  />
                </div>
                <span className="text-muted text-xs w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders summary */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" /> Orders Summary
          </h2>
          {orders.length === 0 ? (
            <p className="text-muted text-sm">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b border-bg-border pb-2">
                <span className="text-muted text-sm">Total Orders</span>
                <span className="text-white font-bold">{orders.length}</span>
              </div>
              <div className="flex justify-between border-b border-bg-border pb-2">
                <span className="text-muted text-sm">Total Revenue</span>
                <span className="text-accent font-bold">${orders.reduce((s,o)=>s+o.total,0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted text-sm">Avg Order Value</span>
                <span className="text-white font-bold">
                  ${(orders.reduce((s,o)=>s+o.total,0)/orders.length).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
