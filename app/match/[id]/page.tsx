import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CalendarDays, MapPin, Clock, ChevronLeft, Users, ShieldCheck } from 'lucide-react';
import { MATCHES, getMatch, getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { getListingsForMatch, ticketsAvailableForMatch, cheapestForMatch } from '@/lib/fifa/listings';
import { formatMatchDate, formatKickoff, formatPrice } from '@/lib/fifa/format';
import { StageBadge } from '@/components/fifa/Badges';
import { Countdown } from '@/components/fifa/Countdown';
import { MatchListings } from '@/components/fifa/MatchListings';

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const m = getMatch(params.id);
  if (!m) return { title: 'Match not found' };
  return {
    title: `${m.home.name} vs ${m.away.name} Tickets — ${m.stage}`,
    description: `Buy verified resale tickets for ${m.home.name} vs ${m.away.name} at the FIFA World Cup 2026. Interactive seating map, instant mobile delivery.`,
  };
}

export default function MatchPage({ params }: { params: { id: string } }) {
  const match = getMatch(params.id);
  if (!match) notFound();

  const stadium = getStadium(match.stadiumId);
  const city = getCityForStadium(match.stadiumId);
  const listings = getListingsForMatch(match.id);
  const tickets = ticketsAvailableForMatch(match.id);
  const from = cheapestForMatch(match.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-5">
        <ChevronLeft className="w-4 h-4" /> All matches
      </Link>

      {/* Match header */}
      <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-fifa-blue-dark/50 via-fifa-navy to-fifa-navy p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <StageBadge stage={match.stage} group={match.group} />
              {match.label && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-fifa-gold">{match.label}</span>
              )}
              <span className="text-xs text-muted">Match #{match.matchNo}</span>
            </div>

            <div className="mt-4 flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl leading-none">{match.home.flag}</div>
                <div className="mt-2 font-extrabold text-white">{match.home.name}</div>
                <div className="text-xs text-muted">FIFA #{match.home.fifaRank}</div>
              </div>
              <div className="text-2xl font-bold text-muted">VS</div>
              <div className="text-center">
                <div className="text-5xl sm:text-6xl leading-none">{match.away.flag}</div>
                <div className="mt-2 font-extrabold text-white">{match.away.name}</div>
                <div className="text-xs text-muted">FIFA #{match.away.fifaRank}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-fifa-blue-light" /> {formatMatchDate(match.dateISO)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-fifa-blue-light" /> {formatKickoff(match.dateISO)} local</span>
              <Link href={`/stadiums/${stadium?.id}`} className="flex items-center gap-1.5 hover:text-fifa-blue-light">
                <MapPin className="w-4 h-4 text-fifa-blue-light" /> {stadium?.name}, {city?.name}
              </Link>
            </div>
          </div>

          {/* Price + countdown panel */}
          <div className="shrink-0 lg:text-right">
            <div className="card-blue p-5">
              <div className="text-xs text-muted uppercase tracking-wide">Tickets from</div>
              <div className="text-3xl font-extrabold text-fifa-gold">{formatPrice(from)}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-fifa-green justify-start lg:justify-end">
                <Users className="w-4 h-4" /> {tickets.toLocaleString()} tickets available
              </div>
              <div className="mt-4 pt-4 border-t border-bg-border">
                <div className="text-[11px] text-muted uppercase tracking-wide mb-2 text-left lg:text-right">Kicks off in</div>
                <Countdown targetIso={match.dateISO} compact />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted justify-start lg:justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-fifa-green" /> 100% Buyer Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map + listings */}
      <div className="mt-8">
        <MatchListings match={match} listings={listings} />
      </div>
    </div>
  );
}
