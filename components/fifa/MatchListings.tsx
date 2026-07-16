'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Listing, Match, SectionCategory } from '@/lib/fifa/types';
import { SECTION_CATEGORIES } from '@/lib/fifa/listings';
import { formatPrice } from '@/lib/fifa/format';
import { SeatingMap } from './SeatingMap';
import { ListingCard } from './ListingCard';
import { CategoryDot } from './Badges';

type Sort = 'lowest' | 'best' | 'closest' | 'vip';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'lowest', label: 'Lowest Price' },
  { id: 'best', label: 'Best Value' },
  { id: 'closest', label: 'Closest Seats' },
  { id: 'vip', label: 'VIP First' },
];

export function MatchListings({ match, listings }: { match: Match; listings: Listing[] }) {
  const [selected, setSelected] = useState<SectionCategory | null>(null);
  const [sort, setSort] = useState<Sort>('lowest');
  const [qty, setQty] = useState<number>(0); // 0 = any

  // availability summary per category for the map + legend
  const available = useMemo(() => {
    const map: Record<string, { from: number; tickets: number }> = {};
    for (const l of listings) {
      const cur = map[l.category];
      const from = cur ? Math.min(cur.from, l.pricePerTicket) : l.pricePerTicket;
      map[l.category] = { from, tickets: (cur?.tickets ?? 0) + l.ticketsRemaining };
    }
    return map;
  }, [listings]);

  const categoriesPresent = SECTION_CATEGORIES.filter((c) => available[c]);

  const visible = useMemo(() => {
    let out = listings.filter((l) => (!selected || l.category === selected) && (qty === 0 || l.quantity >= qty));
    switch (sort) {
      case 'lowest': out = [...out].sort((a, b) => a.pricePerTicket - b.pricePerTicket); break;
      case 'best': out = [...out].sort((a, b) => (b.tag === 'Best Value' ? 1 : 0) - (a.tag === 'Best Value' ? 1 : 0) || a.pricePerTicket - b.pricePerTicket); break;
      case 'closest': out = [...out].sort((a, b) => a.distanceFromPitch - b.distanceFromPitch); break;
      case 'vip': out = [...out].sort((a, b) => b.pricePerTicket - a.pricePerTicket); break;
    }
    return out;
  }, [listings, selected, qty, sort]);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8">
      {/* Seating map + legend */}
      <div className="lg:sticky lg:top-28 self-start">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">Interactive Seating Map</h3>
            {selected && (
              <button onClick={() => setSelected(null)} className="text-xs text-fifa-blue-light hover:underline">
                Clear selection
              </button>
            )}
          </div>
          <p className="text-xs text-muted mb-3">Tap a section to filter listings. Colours show the seating tier.</p>
          <SeatingMap available={available} selected={selected} onSelect={setSelected} />

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {categoriesPresent.map((c) => (
              <button
                key={c}
                onClick={() => setSelected(selected === c ? null : c)}
                className={`flex items-center justify-between gap-2 text-left px-2 py-1.5 rounded-lg transition-colors ${
                  selected === c ? 'bg-fifa-blue/15 ring-1 ring-fifa-blue/40' : 'hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <CategoryDot category={c} />
                  <span className="text-xs text-gray-200 truncate">{c}</span>
                </span>
                <span className="text-xs text-fifa-gold font-semibold whitespace-nowrap">{formatPrice(available[c].from)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-fifa-blue-light" />
            <span className="font-bold text-white">{visible.length}</span>
            <span className="text-muted">listings{selected ? ` · ${selected}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="bg-surface border border-bg-border rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-fifa-blue"
            >
              <option value={0}>Any quantity</option>
              <option value={1}>1+ ticket</option>
              <option value={2}>2+ together</option>
              <option value={3}>3+ together</option>
              <option value={4}>4+ together</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-surface border border-bg-border rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-fifa-blue"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>Sort: {s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {visible.map((l) => (
            <ListingCard key={l.id} listing={l} match={match} />
          ))}
          {visible.length === 0 && (
            <div className="card p-8 text-center text-muted text-sm">No listings match these filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
