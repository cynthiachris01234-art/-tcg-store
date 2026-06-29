import Link from 'next/link';
import { MapPin, CalendarDays, Ticket, ArrowRight } from 'lucide-react';
import type { Match } from '@/lib/fifa/types';
import { getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { cheapestForMatch, ticketsAvailableForMatch, countListingsForMatch } from '@/lib/fifa/listings';
import { formatPrice, formatMatchDateShort, formatKickoff } from '@/lib/fifa/format';
import { StageBadge } from './Badges';

export function MatchCard({ match, featured }: { match: Match; featured?: boolean }) {
  const stadium = getStadium(match.stadiumId);
  const city = getCityForStadium(match.stadiumId);
  const from = cheapestForMatch(match.id);
  const tickets = ticketsAvailableForMatch(match.id);
  const listings = countListingsForMatch(match.id);

  return (
    <Link
      href={`/match/${match.id}`}
      className="group card hover:shadow-card-hover hover:border-fifa-blue/40 transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <StageBadge stage={match.stage} group={match.group} />
          {match.label && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-fifa-gold">{match.label}</span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className="text-3xl sm:text-4xl leading-none">{match.home.flag}</div>
            <div className="mt-1.5 font-bold text-sm text-white">{match.home.name}</div>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="text-xs font-bold text-muted">VS</span>
            <span className="mt-1 text-[10px] text-muted">{formatKickoff(match.dateISO)}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="text-3xl sm:text-4xl leading-none">{match.away.flag}</div>
            <div className="mt-1.5 font-bold text-sm text-white">{match.away.name}</div>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-fifa-blue-light" />
            {formatMatchDateShort(match.dateISO)}, 2026
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-fifa-blue-light" />
            <span className="truncate">{stadium?.name} · {city?.name}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-bg-border bg-white/[0.02] px-4 sm:px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted uppercase tracking-wide">From</div>
          <div className="font-bold text-fifa-gold text-lg leading-none">{formatPrice(from)}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-fifa-green font-semibold justify-end">
            <Ticket className="w-3.5 h-3.5" /> {tickets.toLocaleString()} available
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-fifa-blue-light mt-0.5 group-hover:gap-2 transition-all">
            {listings} listings <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
