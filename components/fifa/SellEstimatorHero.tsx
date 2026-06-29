'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Tag } from 'lucide-react';
import { MATCHES, getCityForStadium } from '@/lib/fifa/world-cup';
import { getListingsForMatch, SECTION_CATEGORIES } from '@/lib/fifa/listings';
import { formatPrice, formatMatchDateShort } from '@/lib/fifa/format';

const SORTED = [...MATCHES].sort((a, b) => b.importance - a.importance || a.dateISO.localeCompare(b.dateISO));

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function SellEstimatorHero() {
  const [matchId, setMatchId] = useState(SORTED[0].id);
  const [category, setCategory] = useState<string>('Lower Level Sideline');
  const [qty, setQty] = useState(2);

  const estimate = useMemo(() => {
    const listings = getListingsForMatch(matchId).filter((l) => l.category === category);
    const price = median(listings.map((l) => l.pricePerTicket));
    const gross = price * qty;
    const fee = Math.round(gross * 0.1);
    return { price, gross, fee, net: gross - fee, comps: listings.length };
  }, [matchId, category, qty]);

  const inputCls =
    'w-full bg-surface border border-bg-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fifa-gold';

  return (
    <div className="w-full max-w-xl glass p-5 sm:p-6 text-left">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fifa-gold/15 text-fifa-gold">
          <Tag className="w-4 h-4" />
        </span>
        <h3 className="font-bold text-white">What are your tickets worth?</h3>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-muted">Match</span>
          <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className={inputCls + ' mt-1'}>
            {SORTED.map((m) => {
              const c = getCityForStadium(m.stadiumId);
              return (
                <option key={m.id} value={m.id}>
                  {m.home.code} vs {m.away.code} · {formatMatchDateShort(m.dateISO)} · {c?.name}
                </option>
              );
            })}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-muted">Section</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls + ' mt-1'}>
              {SECTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-muted">Quantity</span>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className={inputCls + ' mt-1'}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} ticket{n > 1 ? 's' : ''}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Estimate */}
      <div className="mt-4 rounded-xl border border-fifa-gold/25 bg-fifa-gold/5 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <TrendingUp className="w-3.5 h-3.5 text-fifa-green" />
          Tickets like yours are selling for <span className="text-white font-semibold">{formatPrice(estimate.price)}</span> each
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted">Your estimated payout</div>
            <div className="text-3xl font-extrabold text-fifa-gold">{formatPrice(estimate.net)}</div>
          </div>
          <div className="text-[11px] text-muted text-right">
            {qty} × {formatPrice(estimate.price)}<br />
            <span>after 10% fee</span>
          </div>
        </div>
      </div>

      <Link href="/sell" className="btn-gold w-full mt-4 flex items-center justify-center gap-2">
        List These Tickets <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="mt-2 text-center text-[11px] text-muted">
        Free to list · No fee until your tickets sell
      </p>
    </div>
  );
}
