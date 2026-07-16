'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const SUGGESTIONS = ['Final', 'Argentina', 'MetLife Stadium', 'Mexico City', 'VIP Hospitality', 'Brazil vs England'];

export function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function go(term?: string) {
    const v = (term ?? q).trim();
    router.push(v ? `/tickets?q=${encodeURIComponent(v)}` : '/tickets');
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); go(); }}
        className="flex items-center gap-2 glass p-2 pl-4 shadow-card"
      >
        <Search className="w-5 h-5 text-muted shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by Team, Stadium, City or Match"
          className="flex-1 bg-transparent text-white placeholder:text-muted focus:outline-none text-sm sm:text-base"
        />
        <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm shrink-0">
          Search
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-blue-100/70">Popular:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => go(s)}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-fifa-blue/40 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
