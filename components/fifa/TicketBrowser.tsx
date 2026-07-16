'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { SectionCategory } from '@/lib/fifa/types';
import { MATCHES, getStadium, getCityForStadium, HOST_CITIES } from '@/lib/fifa/world-cup';
import { getAllListings, SECTION_CATEGORIES } from '@/lib/fifa/listings';
import { formatMatchDateShort } from '@/lib/fifa/format';
import { ListingCard } from './ListingCard';

const MATCH_BY_ID = Object.fromEntries(MATCHES.map((m) => [m.id, m]));
const PRICE_BANDS = [
  { id: '', label: 'Any price' },
  { id: '0-500', label: 'Under $500' },
  { id: '500-1500', label: '$500 – $1,500' },
  { id: '1500-4000', label: '$1,500 – $4,000' },
  { id: '4000-100000', label: '$4,000+' },
];

type Sort = 'lowest' | 'highest' | 'best' | 'closest' | 'vip';

export function TicketBrowser() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [category, setCategory] = useState<string>(sp.get('category') ?? '');
  const [city, setCity] = useState(sp.get('city') ?? '');
  const [band, setBand] = useState('');
  const [qty, setQty] = useState(0);
  const [sort, setSort] = useState<Sort>('lowest');
  const [limit, setLimit] = useState(48);

  const all = useMemo(() => getAllListings(), []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const [lo, hi] = band ? band.split('-').map(Number) : [0, Infinity];
    let list = all.filter((l) => {
      const m = MATCH_BY_ID[l.matchId];
      if (!m) return false;
      if (category && l.category !== category) return false;
      if (qty && l.quantity < qty) return false;
      if (band && (l.pricePerTicket < lo || l.pricePerTicket > hi)) return false;
      const c = getCityForStadium(m.stadiumId);
      if (city && c?.name !== city) return false;
      if (term) {
        const st = getStadium(m.stadiumId);
        const hay = `${m.home.name} ${m.away.name} ${m.home.code} ${m.away.code} ${st?.name} ${c?.name} ${l.category} ${l.sectionCode} ${m.label ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    switch (sort) {
      case 'lowest': list = [...list].sort((a, b) => a.pricePerTicket - b.pricePerTicket); break;
      case 'highest': case 'vip': list = [...list].sort((a, b) => b.pricePerTicket - a.pricePerTicket); break;
      case 'closest': list = [...list].sort((a, b) => a.distanceFromPitch - b.distanceFromPitch); break;
      case 'best': list = [...list].sort((a, b) => (b.tag === 'Best Value' ? 1 : 0) - (a.tag === 'Best Value' ? 1 : 0) || a.pricePerTicket - b.pricePerTicket); break;
    }
    return list;
  }, [all, q, category, city, band, qty, sort]);

  const activeChips = [
    category && { label: category, clear: () => setCategory('') },
    city && { label: city, clear: () => setCity('') },
    band && { label: PRICE_BANDS.find((b) => b.id === band)?.label, clear: () => setBand('') },
    qty && { label: `${qty}+ together`, clear: () => setQty(0) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
      {/* Sidebar filters */}
      <aside className="lg:sticky lg:top-28 self-start space-y-5">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
            <SlidersHorizontal className="w-4 h-4 text-fifa-blue-light" /> Filters
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Team, city, match…"
              className="w-full bg-surface border border-bg-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-fifa-blue"
            />
          </div>

          <FilterGroup label="Section">
            <Select value={category} onChange={setCategory} options={[{ v: '', l: 'All sections' }, ...SECTION_CATEGORIES.map((c) => ({ v: c, l: c }))]} />
          </FilterGroup>
          <FilterGroup label="City">
            <Select value={city} onChange={setCity} options={[{ v: '', l: 'All cities' }, ...HOST_CITIES.map((c) => ({ v: c.name, l: c.name }))]} />
          </FilterGroup>
          <FilterGroup label="Price">
            <Select value={band} onChange={setBand} options={PRICE_BANDS.map((b) => ({ v: b.id, l: b.label }))} />
          </FilterGroup>
          <FilterGroup label="Quantity">
            <Select value={String(qty)} onChange={(v) => setQty(Number(v))} options={[
              { v: '0', l: 'Any quantity' }, { v: '1', l: '1+' }, { v: '2', l: '2+ together' },
              { v: '3', l: '3+ together' }, { v: '4', l: '4+ together' },
            ]} />
          </FilterGroup>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="text-sm">
            <span className="font-bold text-white">{filtered.length.toLocaleString()}</span>
            <span className="text-muted"> tickets found</span>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-surface border border-bg-border rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-fifa-blue">
            <option value="lowest">Sort: Lowest Price</option>
            <option value="best">Sort: Best Value</option>
            <option value="closest">Sort: Closest Seats</option>
            <option value="vip">Sort: VIP First</option>
            <option value="highest">Sort: Highest Price</option>
          </select>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeChips.map((chip, i) => (
              <button key={i} onClick={chip.clear} className="pill hover:border-fifa-blue/40">
                {chip.label} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {filtered.slice(0, limit).map((l) => {
            const m = MATCH_BY_ID[l.matchId];
            return (
              <div key={l.id}>
                <Link href={`/match/${m.id}`} className="flex items-center gap-2 text-xs text-muted hover:text-fifa-blue-light mb-1 ml-1">
                  <span>{m.home.flag} {m.home.code} vs {m.away.code} {m.away.flag}</span>
                  <span>·</span>
                  <span>{formatMatchDateShort(m.dateISO)}</span>
                </Link>
                <ListingCard listing={l} match={m} />
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card p-10 text-center text-muted">No tickets match these filters.</div>
        )}
        {limit < filtered.length && (
          <div className="text-center mt-6">
            <button onClick={() => setLimit((n) => n + 48)} className="btn-outline">
              Load more ({filtered.length - limit} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] uppercase tracking-wide text-muted mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-surface border border-bg-border rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-fifa-blue">
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
