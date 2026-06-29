'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, DollarSign } from 'lucide-react';
import { MATCHES, getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { SECTION_CATEGORIES } from '@/lib/fifa/listings';
import { formatPrice, formatMatchDateShort } from '@/lib/fifa/format';

const SORTED_MATCHES = [...MATCHES].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

export function SellForm() {
  const [matchId, setMatchId] = useState(SORTED_MATCHES[0].id);
  const [category, setCategory] = useState<string>(SECTION_CATEGORIES[0]);
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [qty, setQty] = useState(2);
  const [price, setPrice] = useState(750);
  const [submitted, setSubmitted] = useState(false);

  const payout = useMemo(() => {
    const gross = price * qty;
    const fee = Math.round(gross * 0.1);
    return { gross, fee, net: gross - fee };
  }, [price, qty]);

  if (submitted) {
    const m = MATCHES.find((x) => x.id === matchId)!;
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-fifa-green mx-auto" />
        <h3 className="mt-4 text-2xl font-extrabold text-white">Your listing is live! 🎉</h3>
        <p className="mt-2 text-muted">
          {qty} × {category} ticket{qty > 1 ? 's' : ''} for {m.home.flag} {m.home.name} vs {m.away.name} {m.away.flag} at {formatPrice(price)} each.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 pill text-fifa-green border-fifa-green/30 bg-fifa-green/10">
          <DollarSign className="w-3.5 h-3.5" /> Estimated payout {formatPrice(payout.net)}
        </div>
        <div className="mt-6">
          <button onClick={() => setSubmitted(false)} className="btn-outline">List more tickets</button>
        </div>
        <p className="mt-4 text-[11px] text-muted/70">Demo only — no listing is actually created.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
      className="card p-5 sm:p-6 space-y-4"
    >
      <Field label="Match">
        <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className={inputCls}>
          {SORTED_MATCHES.map((m) => {
            const c = getCityForStadium(m.stadiumId);
            return (
              <option key={m.id} value={m.id}>
                {m.home.code} vs {m.away.code} · {formatMatchDateShort(m.dateISO)} · {c?.name}
              </option>
            );
          })}
        </select>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Section / Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {SECTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Section number">
          <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. C124" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Row">
          <input value={row} onChange={(e) => setRow(e.target.value)} placeholder="e.g. 12" className={inputCls} />
        </Field>
        <Field label="Quantity">
          <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className={inputCls}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Price / ticket (USD)">
          <input type="number" min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} />
        </Field>
      </div>

      {/* Payout summary */}
      <div className="rounded-xl border border-bg-border bg-surface p-4 space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted">{qty} × {formatPrice(price)}</span><span className="text-white">{formatPrice(payout.gross)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Seller fee (10%)</span><span className="text-muted">−{formatPrice(payout.fee)}</span></div>
        <div className="border-t border-bg-border my-1.5" />
        <div className="flex justify-between font-bold"><span className="text-white">Your payout</span><span className="text-fifa-gold text-lg">{formatPrice(payout.net)}</span></div>
      </div>

      <button type="submit" className="btn-primary w-full">List My Tickets</button>
    </form>
  );
}

const inputCls = 'w-full bg-surface border border-bg-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-fifa-blue';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
