import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Ticket } from 'lucide-react';
import { TicketBrowser } from '@/components/fifa/TicketBrowser';
import { marketplaceStats } from '@/lib/fifa/listings';

export const metadata: Metadata = {
  title: 'Browse Tickets',
  description: 'Browse thousands of verified FIFA World Cup 2026 resale tickets. Filter by section, city, price and quantity.',
};

export default function TicketsPage() {
  const stats = marketplaceStats();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-fifa-blue-light" /> Browse Tickets
        </h1>
        <p className="text-muted mt-2">
          {stats.totalListings.toLocaleString()} live listings · {stats.totalTickets.toLocaleString()} tickets across every match.
        </p>
      </div>
      <Suspense fallback={<div className="text-muted">Loading tickets…</div>}>
        <TicketBrowser />
      </Suspense>
    </div>
  );
}
