'use client';

import { useMemo, useState } from 'react';
import type { SectionCategory } from '@/lib/fifa/types';
import { SECTION_BY_CATEGORY } from '@/lib/fifa/listings';
import { categoryColor } from './Badges';
import { formatPrice } from '@/lib/fifa/format';

interface Seg {
  id: string;
  category: SectionCategory;
  path: string;
  cx: number;
  cy: number;
}

const CX = 400, CY = 285, A = 300, B = 215;
const SEGMENTS = 16;

function zone(angleDeg: number): 'sideline' | 'goal' | 'corner' {
  const a = ((angleDeg % 360) + 360) % 360;
  const dSide = Math.min(Math.abs(a - 90), Math.abs(a - 270));
  const dGoal = Math.min(Math.abs(a - 0), Math.abs(a - 360), Math.abs(a - 180));
  if (dSide <= 24) return 'sideline';
  if (dGoal <= 24) return 'goal';
  return 'corner';
}

// Annular sector on an ellipse between radius factors [ri, ro] over [a0,a1] degrees.
function sectorPath(ri: number, ro: number, a0: number, a1: number): string {
  const steps = 6;
  const pt = (deg: number, rf: number) => {
    const r = (deg * Math.PI) / 180;
    return [CX + A * rf * Math.cos(r), CY + B * rf * Math.sin(r)];
  };
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const ang = a0 + ((a1 - a0) * i) / steps;
    const [x, y] = pt(ang, ro);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  for (let i = steps; i >= 0; i--) {
    const ang = a0 + ((a1 - a0) * i) / steps;
    const [x, y] = pt(ang, ri);
    d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d + 'Z';
}

function buildSegments(): Seg[] {
  const rings: { ri: number; ro: number; assign: (z: string, idx: number, center: number) => SectionCategory }[] = [
    {
      ri: 1.0, ro: 1.32,
      assign: (z, idx, c) => {
        if (z === 'sideline') {
          // top sideline (~90°) is the premium touchline
          if (Math.abs(c - 90) < 12) return 'VIP Hospitality';
          if (Math.abs(c - 90) < 34) return 'Premium Club Seats';
          return 'Lower Level Sideline';
        }
        if (z === 'goal') return 'Goal End';
        if (idx === 13) return 'Accessible Seating';
        return 'Lower Corner';
      },
    },
    {
      ri: 1.34, ro: 1.66,
      assign: (z, idx, c) => {
        if (z === 'sideline' && Math.abs(c - 270) < 24) return 'Family Section';
        return 'Mid-Level';
      },
    },
    {
      ri: 1.68, ro: 2.0,
      assign: (z, idx) => (idx === 5 ? 'Accessible Seating' : 'Upper Level'),
    },
  ];

  const segs: Seg[] = [];
  const step = 360 / SEGMENTS;
  rings.forEach((ring, ringIdx) => {
    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = i * step + 2;
      const a1 = (i + 1) * step - 2;
      const center = i * step + step / 2;
      const category = ring.assign(zone(center), i, center);
      const midR = (ring.ri + ring.ro) / 2;
      const rad = (center * Math.PI) / 180;
      segs.push({
        id: `r${ringIdx}-s${i}`,
        category,
        path: sectorPath(ring.ri, ring.ro, a0, a1),
        cx: CX + A * midR * Math.cos(rad),
        cy: CY + B * midR * Math.sin(rad),
      });
    }
  });
  return segs;
}

export function SeatingMap({
  available,
  selected,
  onSelect,
}: {
  available: Record<string, { from: number; tickets: number }>;
  selected: SectionCategory | null;
  onSelect: (c: SectionCategory | null) => void;
}) {
  const segs = useMemo(buildSegments, []);
  const [hover, setHover] = useState<Seg | null>(null);

  return (
    <div className="relative">
      <svg viewBox="0 0 800 600" className="w-full h-auto select-none">
        {/* outer bowl glow */}
        <ellipse cx={CX} cy={CY} rx={A * 2.05} ry={B * 2.05} fill="rgba(23,99,255,0.05)" />

        {segs.map((s) => {
          const has = available[s.category];
          const isSel = selected === s.category;
          const dim = selected && !isSel;
          const base = categoryColor(s.category);
          return (
            <path
              key={s.id}
              d={s.path}
              fill={base}
              stroke="#070d1c"
              strokeWidth={1.5}
              className="cursor-pointer transition-all"
              style={{
                opacity: dim ? 0.18 : has ? (isSel ? 1 : 0.82) : 0.3,
                filter: isSel ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : undefined,
              }}
              onClick={() => onSelect(isSel ? null : s.category)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}

        {/* Pitch */}
        <g>
          <rect x={CX - A * 0.78} y={CY - B * 0.6} width={A * 1.56} height={B * 1.2} rx={6}
            fill="#0c6b2e" stroke="#0a8f3c" strokeWidth={2} />
          {/* stripes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={CX - A * 0.78 + (A * 1.56 / 8) * i} y={CY - B * 0.6}
              width={A * 1.56 / 8} height={B * 1.2} fill={i % 2 ? '#0a5d28' : '#0c6b2e'} />
          ))}
          <rect x={CX - A * 0.78} y={CY - B * 0.6} width={A * 1.56} height={B * 1.2} rx={6}
            fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
          <line x1={CX} y1={CY - B * 0.6} x2={CX} y2={CY + B * 0.6} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={26} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={2.5} fill="rgba(255,255,255,0.8)" />
        </g>

        {/* labels */}
        <text x={CX} y={CY - B * 1.85} textAnchor="middle" fill="#8a98b5" fontSize="13" fontWeight="700" letterSpacing="2">SIDELINE</text>
        <text x={CX} y={CY + B * 1.95} textAnchor="middle" fill="#8a98b5" fontSize="13" fontWeight="700" letterSpacing="2">SIDELINE</text>
        <text x={CX + A * 1.85} y={CY + 4} textAnchor="middle" fill="#8a98b5" fontSize="13" fontWeight="700" letterSpacing="1">GOAL</text>
        <text x={CX - A * 1.85} y={CY + 4} textAnchor="middle" fill="#8a98b5" fontSize="13" fontWeight="700" letterSpacing="1">GOAL</text>
      </svg>

      {/* Hover tooltip */}
      {hover && available[hover.category] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-fifa-navy border border-white/15 shadow-card text-xs whitespace-nowrap"
          style={{ left: `${(hover.cx / 800) * 100}%`, top: `${(hover.cy / 600) * 100}%` }}
        >
          <div className="font-bold text-white">{hover.category}</div>
          <div className="text-fifa-gold">From {formatPrice(available[hover.category].from)}</div>
        </div>
      )}
    </div>
  );
}
