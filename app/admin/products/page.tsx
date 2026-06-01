'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { BRAND_META } from '@/lib/brands';
import type { Brand, ProductType } from '@/types';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Filter, ExternalLink, Package,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  booster_box: 'Booster Box', case: 'Case', etb: 'ETB', upc: 'UPC',
  spc: 'SPC', bundle: 'Bundle', premium_collection: 'PC',
  display_case: 'Display', poster_collection: 'Poster',
};

function StockBadge({ qty, pre }: { qty: number; pre: boolean }) {
  if (pre)    return <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30">Pre-Order</span>;
  if (qty === 0) return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">Out of Stock</span>;
  if (qty <= 3)  return <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">{qty} left</span>;
  return <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">{qty} in stock</span>;
}

type SortKey = 'set_name' | 'brand' | 'language' | 'product_type' | 'market_price_usd' | 'our_price_usd' | 'stock_quantity' | 'release_date';
type SortDir = 'asc' | 'desc';

// ── component ─────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [search,  setSearch]  = useState('');
  const [brand,   setBrand]   = useState<Brand | ''>('');
  const [lang,    setLang]    = useState<'en' | 'jp' | 'kr' | ''>('');
  const [type,    setType]    = useState<ProductType | ''>('');
  const [stock,   setStock]   = useState<'in_stock' | 'out' | 'pre' | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('brand');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const rows = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    if (search)           list = list.filter(p => p.set_name.toLowerCase().includes(search.toLowerCase()) || p.set_code.toLowerCase().includes(search.toLowerCase()));
    if (brand)            list = list.filter(p => p.brand === brand);
    if (lang)             list = list.filter(p => p.language === lang);
    if (type)             list = list.filter(p => p.product_type === type);
    if (stock === 'in_stock') list = list.filter(p => p.stock_quantity > 0 && !p.is_pre_order);
    if (stock === 'out')  list = list.filter(p => p.stock_quantity === 0 && !p.is_pre_order);
    if (stock === 'pre')  list = list.filter(p => p.is_pre_order);

    list.sort((a, b) => {
      const va = a[sortKey] as any;
      const vb = b[sortKey] as any;
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [search, brand, lang, type, stock, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3.5 h-3.5 text-accent" />
      : <ChevronDown className="w-3.5 h-3.5 text-accent" />;
  }

  const th = 'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap';
  const thBtn = `${th} cursor-pointer hover:text-white transition-colors select-none`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-muted text-sm mt-1">{rows.length} of {MOCK_PRODUCTS.length} products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search set name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg border border-bg-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>

        <Filter className="w-4 h-4 text-muted flex-shrink-0" />

        {/* Brand */}
        <select value={brand} onChange={e => setBrand(e.target.value as any)}
          className="bg-bg border border-bg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
          <option value="">All Brands</option>
          <option value="pokemon">Pokémon</option>
          <option value="onepiece">One Piece</option>
          <option value="mtg">Magic</option>
          <option value="yugioh">Yu-Gi-Oh!</option>
        </select>

        {/* Language */}
        <select value={lang} onChange={e => setLang(e.target.value as any)}
          className="bg-bg border border-bg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
          <option value="">All Languages</option>
          <option value="en">🇺🇸 EN</option>
          <option value="jp">🇯🇵 JP</option>
          <option value="kr">🇰🇷 KR</option>
        </select>

        {/* Type */}
        <select value={type} onChange={e => setType(e.target.value as any)}
          className="bg-bg border border-bg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {/* Stock */}
        <select value={stock} onChange={e => setStock(e.target.value as any)}
          className="bg-bg border border-bg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="out">Out of Stock</option>
          <option value="pre">Pre-Order</option>
        </select>

        {(search || brand || lang || type || stock) && (
          <button onClick={() => { setSearch(''); setBrand(''); setLang(''); setType(''); setStock(''); }}
            className="text-xs text-muted hover:text-white underline">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-border bg-bg/40">
              <tr>
                <th className={th}>Image</th>
                <th className={thBtn} onClick={() => toggleSort('set_name')}>
                  <span className="flex items-center gap-1">Set Name <SortIcon col="set_name" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('brand')}>
                  <span className="flex items-center gap-1">Brand <SortIcon col="brand" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('language')}>
                  <span className="flex items-center gap-1">Lang <SortIcon col="language" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('product_type')}>
                  <span className="flex items-center gap-1">Type <SortIcon col="product_type" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('release_date')}>
                  <span className="flex items-center gap-1">Release <SortIcon col="release_date" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('market_price_usd')}>
                  <span className="flex items-center gap-1">Market <SortIcon col="market_price_usd" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('our_price_usd')}>
                  <span className="flex items-center gap-1">Our Price <SortIcon col="our_price_usd" /></span>
                </th>
                <th className={thBtn} onClick={() => toggleSort('stock_quantity')}>
                  <span className="flex items-center gap-1">Stock <SortIcon col="stock_quantity" /></span>
                </th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No products match your filters.
                  </td>
                </tr>
              )}
              {rows.map(p => {
                const brand = BRAND_META[p.brand];
                const savings = Math.round((1 - p.our_price_usd / p.market_price_usd) * 100);
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-bg flex-shrink-0">
                        <Image src={p.image_url} alt={p.set_name} fill unoptimized className="object-contain p-0.5" />
                      </div>
                    </td>

                    {/* Set name */}
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold leading-tight">{p.set_name}</p>
                      <p className="text-muted text-xs mt-0.5 font-mono">{p.set_code}</p>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${brand?.primaryColor}20`, color: brand?.primaryColor }}>
                        {brand?.name ?? p.brand}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-white font-mono uppercase bg-bg-border px-2 py-0.5 rounded-full">
                        {p.language === 'jp' ? '🇯🇵' : p.language === 'kr' ? '🇰🇷' : '🇺🇸'} {p.language.toUpperCase()}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{TYPE_LABEL[p.product_type] ?? p.product_type}</span>
                    </td>

                    {/* Release date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted whitespace-nowrap">{p.release_date}</span>
                    </td>

                    {/* Market price */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted line-through">${p.market_price_usd.toFixed(2)}</span>
                    </td>

                    {/* Our price */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-accent">${p.our_price_usd.toFixed(2)}</p>
                      <p className="text-xs text-green-400">−{savings}% off</p>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge qty={p.stock_quantity} pre={p.is_pre_order} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors inline-flex"
                        title="View on store"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {rows.length > 0 && (
          <div className="px-4 py-3 border-t border-bg-border text-xs text-muted">
            Showing {rows.length} product{rows.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
