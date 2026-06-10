'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { BRAND_META, BRANDS, LANGUAGE_META, LANGUAGES } from '@/lib/brands';
import { cn } from '@/lib/utils';
import type { Brand, Language, ProductType } from '@/types';

export function FilterBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const activeBrand   = searchParams.get('brand')   as Brand   | null;
  const activeLang    = searchParams.get('lang')     as Language| null;
  const activeType    = searchParams.get('type')     as ProductType | null;
  const activeSort    = searchParams.get('sort')     || 'newest';
  const inStockOnly   = searchParams.get('stock')    === '1';

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 p-4 card">
      {/* Brand */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Brand</p>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => {
            const meta = BRAND_META[b];
            const active = activeBrand === b;
            return (
              <button key={b} onClick={() => update('brand', b)}
                className={cn('badge transition-all text-xs px-3 py-1.5 border', active
                  ? 'text-white border-opacity-100'
                  : 'text-muted border-bg-border hover:border-opacity-60'
                )}
                style={active ? { background: meta.primaryColor + '33', borderColor: meta.primaryColor, color: meta.primaryColor } : {}}>
                {meta.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Language</p>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => {
            const meta  = LANGUAGE_META[l];
            const active = activeLang === l;
            return (
              <button key={l} onClick={() => update('lang', l)}
                className={cn('badge border transition-all px-3 py-1.5',
                  active ? 'bg-accent/20 border-accent text-accent' : 'border-bg-border text-muted hover:border-accent/50'
                )}>
                {meta.flag} {meta.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {([
            ['booster_box',        'Booster Box'],
            ['case',               'Case'],
            ['etb',                'ETB'],
            ['upc',                'UPC'],
            ['spc',                'SPC'],
            ['premium_collection', 'PC / PC-ETB'],
            ['display_case',       'Display Case'],
            ['poster_collection',  'Poster Coll.'],
          ] as [ProductType, string][]).map(([t, label]) => {
            const active = activeType === t;
            return (
              <button key={t} onClick={() => update('type', t)}
                className={cn('badge border transition-all px-3 py-1.5',
                  active ? 'bg-accent/20 border-accent text-accent' : 'border-bg-border text-muted hover:border-accent/50'
                )}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort + In stock */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Sort by</p>
          <select value={activeSort} onChange={(e) => update('sort', e.target.value)}
            className="bg-bg border border-bg-border text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="release_date">Release Date</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input type="checkbox" checked={inStockOnly} onChange={() => update('stock', inStockOnly ? null : '1')}
            className="w-4 h-4 accent-accent rounded" />
          <span className="text-sm text-gray-300">In stock only</span>
        </label>
      </div>
    </div>
  );
}
