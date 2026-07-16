import type { Listing, Match } from '@/lib/fifa/types';
import { getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { formatMatchDate, formatKickoff } from '@/lib/fifa/format';
import { Logo } from './Logo';

// Deterministic pseudo-QR grid rendered as SVG (purely decorative).
function QrGrid({ seed, size = 92 }: { seed: string; size?: number }) {
  const n = 21;
  const cell = size / n;
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) { state ^= seed.charCodeAt(i); state = Math.imul(state, 16777619); }
  state >>>= 0;
  const next = () => { state = (Math.imul(state ^ (state >>> 15), 1 | state) + 0x6d2b79f5) >>> 0; return state / 4294967296; };

  // Standard QR finder pattern (7x7) at three corners.
  const inFinder = (x: number, y: number) => {
    const corners = [[0, 0], [n - 7, 0], [0, n - 7]];
    for (const [cx, cy] of corners) {
      if (x >= cx && x < cx + 7 && y >= cy && y < cy + 7) {
        const lx = x - cx, ly = y - cy;
        const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        return { hit: true, on: ring || core };
      }
    }
    return { hit: false, on: false };
  };

  const rects: JSX.Element[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const f = inFinder(x, y);
      const on = f.hit ? f.on : next() > 0.52;
      if (on) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#070d1c" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md bg-white p-1.5 shrink-0">
      {rects}
    </svg>
  );
}

export function QRTicket({ listing, match }: { listing: Listing; match: Match }) {
  const stadium = getStadium(match.stadiumId);
  const city = getCityForStadium(match.stadiumId);
  const seedTail = `${listing.id}`.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-fifa-blue-dark to-fifa-navy shadow-blue-sm">
      {/* header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <Logo />
        <span className="text-[10px] uppercase tracking-widest text-blue-200/80">Mobile Ticket</span>
      </div>

      <div className="px-5 pb-4">
        <div className="text-[10px] uppercase tracking-widest text-fifa-gold">{match.stage}{match.group ? ` · Group ${match.group}` : ''}</div>
        <div className="mt-1 flex items-center gap-2 text-xl font-extrabold text-white">
          <span>{match.home.flag} {match.home.code}</span>
          <span className="text-muted text-sm">vs</span>
          <span>{match.away.code} {match.away.flag}</span>
        </div>
        <div className="mt-1 text-xs text-blue-100/80">
          {formatMatchDate(match.dateISO)} · {formatKickoff(match.dateISO)} · {stadium?.name}, {city?.name}
        </div>
      </div>

      {/* perforation */}
      <div className="relative">
        <div className="border-t border-dashed border-white/20" />
        <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-bg" />
        <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-bg" />
      </div>

      {/* seat + qr */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 bg-white/[0.03]">
        <div className="grid grid-cols-3 gap-3 text-center flex-1">
          <div>
            <div className="text-[10px] text-muted uppercase">Section</div>
            <div className="font-bold text-white">{listing.sectionCode}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase">Row</div>
            <div className="font-bold text-white">{listing.row}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase">Seat</div>
            <div className="font-bold text-white">{listing.seatStart}</div>
          </div>
        </div>
        <QrGrid seed={listing.id} />
      </div>
      <div className="px-5 py-2.5 text-center text-[10px] tracking-[0.3em] text-blue-200/70 bg-white/[0.02] border-t border-white/5">
        WC26-{seedTail}-{listing.row}
      </div>
    </div>
  );
}
