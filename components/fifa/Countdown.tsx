'use client';

import { useEffect, useState } from 'react';

interface Parts { days: number; hours: number; minutes: number; seconds: number; }

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="block tabular-nums font-extrabold text-2xl sm:text-4xl text-white bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 min-w-[3rem] sm:min-w-[4.25rem] text-center">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}

export function Countdown({ targetIso, compact }: { targetIso: string; compact?: boolean }) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  // Render placeholder zeros on the server / first paint to avoid hydration drift.
  const p = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (compact) {
    return (
      <span className="tabular-nums font-bold text-white">
        {p.days}d {p.hours}h {p.minutes}m {p.seconds}s
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Unit value={p.days} label="Days" />
      <span className="text-2xl sm:text-4xl font-bold text-fifa-gold/60 -mt-5">:</span>
      <Unit value={p.hours} label="Hours" />
      <span className="text-2xl sm:text-4xl font-bold text-fifa-gold/60 -mt-5">:</span>
      <Unit value={p.minutes} label="Mins" />
      <span className="text-2xl sm:text-4xl font-bold text-fifa-gold/60 -mt-5">:</span>
      <Unit value={p.seconds} label="Secs" />
    </div>
  );
}
