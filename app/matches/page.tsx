import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { MatchBrowser } from '@/components/fifa/MatchBrowser';

export const metadata: Metadata = {
  title: 'All Matches',
  description: 'Browse all 104 FIFA World Cup 2026 matches across 16 host cities. Filter by stage, city and price.',
};

export default function MatchesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-fifa-blue-light" /> World Cup 2026 Matches
        </h1>
        <p className="text-muted mt-2">From the opening match in Mexico City to the Final at MetLife Stadium.</p>
      </div>
      <Suspense fallback={<div className="text-muted">Loading matches…</div>}>
        <MatchBrowser />
      </Suspense>
    </div>
  );
}
