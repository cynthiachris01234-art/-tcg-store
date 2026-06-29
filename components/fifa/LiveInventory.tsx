'use client';

import { useEffect, useState } from 'react';

function useTick(base: number, jitter: number, intervalMs: number) {
  const [n, setN] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setN((prev) => Math.max(0, prev + Math.round((Math.random() - 0.45) * jitter)));
    }, intervalMs);
    return () => clearInterval(id);
  }, [jitter, intervalMs]);
  return n;
}

export function LiveInventory({
  listings,
  tickets,
}: {
  listings: number;
  tickets: number;
}) {
  const liveTickets = useTick(tickets, 14, 2200);
  const viewers = useTick(2840, 60, 1700);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
      <span className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fifa-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fifa-green" />
        </span>
        <span className="tabular-nums font-bold text-white">{liveTickets.toLocaleString()}</span>
        <span className="text-muted">tickets available now</span>
      </span>
      <span className="text-bg-border">|</span>
      <span className="text-muted">
        <span className="tabular-nums font-bold text-white">{listings.toLocaleString()}</span> active listings
      </span>
      <span className="text-bg-border">|</span>
      <span className="text-muted">
        <span className="tabular-nums font-bold text-fifa-gold">{viewers.toLocaleString()}</span> fans browsing
      </span>
    </div>
  );
}
