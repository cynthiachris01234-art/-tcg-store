'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Stage } from '@/lib/fifa/types';
import { MATCHES, getStadium, getCityForStadium, HOST_CITIES } from '@/lib/fifa/world-cup';
import { cheapestForMatch } from '@/lib/fifa/listings';
import { MatchCard } from './MatchCard';

const STAGES: Stage[] = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Third Place', 'Final'];

export function MatchBrowser() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [stage, setStage] = useState(sp.get('stage') ?? '');
  const [city, setCity] = useState(sp.get('city') ?? '');
  const [sort, setSort] = useState<'date' | 'price' | 'importance'>('date');

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = MATCHES.filter((m) => {
      const st = getStadium(m.stadiumId);
      const c = getCityForStadium(m.stadiumId);
      if (stage && m.stage !== stage) return false;
      if (city && c?.name !== city) return false;
      if (term) {
        const hay = `${m.home.name} ${m.away.name} ${m.home.code} ${m.away.code} ${st?.name} ${c?.name} ${m.stage} ${m.group ?? ''} ${m.label ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    if (sort === 'date') list = [...list].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    if (sort === 'importance') list = [...list].sort((a, b) => b.importance - a.importance);
    if (sort === 'price') list = [...list].sort((a, b) => cheapestForMatch(a.id) - cheapestForMatch(b.id));
    return list;
  }, [q, stage, city, sort]);

  return (
    <div>
      {/* Filter bar */}
      <div className="card p-4 mb-6 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team, stadium, city…"
            className="w-full bg-surface border border-bg-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-fifa-blue"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="bg-surface border border-bg-border rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-fifa-blue">
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-surface border border-bg-border rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-fifa-blue">
            <option value="">All cities</option>
            {HOST_CITIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-surface border border-bg-border rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-fifa-blue">
            <option value="date">Sort: Date</option>
            <option value="price">Sort: Lowest Price</option>
            <option value="importance">Sort: Most Popular</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-muted mb-4">
        <span className="font-bold text-white">{results.length}</span> matches
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
      {results.length === 0 && (
        <div className="card p-10 text-center text-muted">No matches found. Try a different search.</div>
      )}
    </div>
  );
}
