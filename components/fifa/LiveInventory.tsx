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

// Seller-facing demand bar — shows buyer activity to encourage listing.
export function LiveInventory({
  listings,
  tickets,
}: {
  listings: number;
  tickets: number;
}) {
  const buyers = useTick(2840, 60, 1700);
  const searches = useTick(altSeed(tickets), 22, 1500);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
      <span className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fifa-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fifa-green" />
        </span>
        <span className="tabular-nums font-bold text-white">{buyers.toLocaleString()}</span>
        <span className="text-muted">buyers searching right now</span>
      </span>
      <span className="text-bg-border">|</span>
      <span className="text-muted">
        <span className="tabular-nums font-bold text-fifa-gold">{searches.toLocaleString()}</span> ticket searches today
      </span>
      <span className="text-bg-border">|</span>
      <span className="text-muted">
        <span className="tabular-nums font-bold text-white">{listings.toLocaleString()}</span> live listings
      </span>
    </div>
  );
}

function altSeed(tickets: number) {
  // derive a believable "searches today" figure from inventory
  return Math.round(tickets * 1.4);
}
