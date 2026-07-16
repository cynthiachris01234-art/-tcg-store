import Link from 'next/link';
import type { Metadata } from 'next';
import { User, Ticket, Tag, Heart, Wallet, Star } from 'lucide-react';
import { getMatch, getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { getListingsForMatch } from '@/lib/fifa/listings';
import { formatPrice, formatMatchDate } from '@/lib/fifa/format';
import { QRTicket } from '@/components/fifa/QRTicket';
import { StageBadge, InstantDeliveryBadge, MobileTicketBadge } from '@/components/fifa/Badges';

export const metadata: Metadata = { title: 'My Account' };

export default function AccountPage() {
  // Sample "purchased" tickets — first listing of a couple marquee matches.
  const owned = ['m104', 'm13'].map((id) => {
    const m = getMatch(id)!;
    return { match: m, listing: getListingsForMatch(id)[2] };
  });

  // Sample active sale listings.
  const selling = ['m16', 'm8', 'm19'].map((id) => {
    const m = getMatch(id)!;
    const l = getListingsForMatch(id)[5];
    return { match: m, listing: l };
  });

  // Watchlist
  const watching = ['m97', 'm98', 'm101'].map((id) => getMatch(id)!);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fifa-blue/15 text-fifa-blue-light">
          <User className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-white">Welcome back, Alex</h1>
          <p className="text-muted text-sm">Member since 2025 · 🇺🇸 United States</p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 text-fifa-gold"><Star className="w-4 h-4 fill-fifa-gold" /> 4.9 Seller rating</span>
            <span className="text-muted">·</span>
            <span className="text-fifa-gold font-semibold">Top Seller</span>
            <span className="text-muted">· 9 tickets sold</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Tag, label: 'Active', value: '3' },
            { icon: Ticket, label: 'Sold', value: '9' },
            { icon: Wallet, label: 'Earnings', value: '$8,640' },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2 rounded-xl bg-surface border border-bg-border">
              <s.icon className="w-4 h-4 text-fifa-blue-light mx-auto" />
              <div className="mt-1 font-extrabold text-white text-sm">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sell more banner */}
      <div className="rounded-2xl border border-fifa-gold/30 bg-gradient-to-r from-fifa-gold/10 to-transparent p-5 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white">Got more tickets to sell?</h2>
          <p className="text-sm text-muted">List them in under two minutes and reach millions of buyers.</p>
        </div>
        <Link href="/sell" className="btn-gold inline-flex items-center gap-2 shrink-0">
          <Tag className="w-4 h-4" /> List New Tickets
        </Link>
      </div>

      {/* My Listings — primary seller view */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-fifa-gold" /> My Listings
          </h2>
          <Link href="/sell" className="text-sm font-semibold text-fifa-blue-light hover:underline">+ New listing</Link>
        </div>
        <div className="space-y-3">
          {selling.map(({ match, listing }) => {
            const city = getCityForStadium(match.stadiumId);
            return (
              <div key={match.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{match.home.flag} {match.home.name} vs {match.away.name} {match.away.flag}</span>
                    <StageBadge stage={match.stage} group={match.group} />
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {listing.category} · Sec {listing.sectionCode}, Row {listing.row} · {listing.quantity} tickets · {city?.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {listing.instantDelivery && <InstantDeliveryBadge />}
                    {listing.mobileTicket && <MobileTicketBadge />}
                    <span className="pill text-fifa-green border-fifa-green/30 bg-fifa-green/10">Active</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-extrabold text-fifa-gold">{formatPrice(listing.pricePerTicket)}</div>
                  <div className="text-[11px] text-muted">/ ticket · {listing.ticketsRemaining} viewed today</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tickets I've bought */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-fifa-blue-light" /> Tickets I&apos;ve Bought
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {owned.map(({ match, listing }) => (
            <QRTicket key={match.id} listing={listing} match={match} />
          ))}
        </div>
      </section>

      {/* Watchlist */}
      <section>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-fifa-red" /> Watchlist
        </h2>
        <div className="space-y-3">
          {watching.map((m) => {
            const st = getStadium(m.stadiumId);
            const city = getCityForStadium(m.stadiumId);
            const from = getListingsForMatch(m.id)[0]?.pricePerTicket ?? 0;
            return (
              <Link key={m.id} href={`/match/${m.id}`} className="card p-4 flex items-center justify-between gap-3 hover:border-fifa-blue/40 transition-colors">
                <div>
                  <div className="font-bold text-white">{m.home.flag} {m.home.name} vs {m.away.name} {m.away.flag}</div>
                  <div className="text-sm text-muted">{formatMatchDate(m.dateISO)} · {st?.name}, {city?.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-muted uppercase">From</div>
                  <div className="text-lg font-extrabold text-fifa-gold">{formatPrice(from)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
