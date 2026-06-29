import Link from 'next/link';
import { Trophy, Flame, Clock, MapPin, ShieldCheck, Zap, ArrowRight, Ticket, TrendingUp } from 'lucide-react';
import { HeroSearch } from '@/components/fifa/HeroSearch';
import { Countdown } from '@/components/fifa/Countdown';
import { LiveInventory } from '@/components/fifa/LiveInventory';
import { MatchCard } from '@/components/fifa/MatchCard';
import { RecentlySold } from '@/components/fifa/RecentlySold';
import { CategoryDot } from '@/components/fifa/Badges';
import {
  getFeaturedMatches, getTrendingMatches, marketplaceStats, cheapestForMatch, SECTIONS,
} from '@/lib/fifa/listings';
import { FINAL_MATCH, HOST_CITIES, getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { formatPrice, formatMatchDate } from '@/lib/fifa/format';

export default function HomePage() {
  const featured = getFeaturedMatches(6);
  const trending = getTrendingMatches(6);
  const stats = marketplaceStats();
  const finalStadium = getStadium(FINAL_MATCH.stadiumId);
  const finalCity = getCityForStadium(FINAL_MATCH.stadiumId);

  return (
    <>
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-pitch-gradient" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="flex flex-col items-center text-center">
            <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10 mb-5">
              <Trophy className="w-3.5 h-3.5" /> FIFA World Cup 2026™ · Official-style Resale
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-4xl">
              Your seat at the <span className="text-gold-gradient">greatest World Cup</span> ever.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-blue-100/80 max-w-2xl">
              Verified resale tickets for all 104 matches across 16 host cities in the USA,
              Canada &amp; Mexico. Interactive seating maps, instant mobile delivery, and a
              100% Buyer Guarantee.
            </p>

            <div className="mt-8 flex justify-center w-full">
              <HeroSearch />
            </div>

            <div className="mt-8">
              <LiveInventory listings={stats.totalListings} tickets={stats.totalTickets} />
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
              {[
                { icon: Ticket, label: 'Live Listings', value: stats.totalListings.toLocaleString() },
                { icon: MapPin, label: 'Host Cities', value: '16' },
                { icon: Trophy, label: 'Matches', value: '104' },
                { icon: ShieldCheck, label: 'Buyer Guarantee', value: '100%' },
              ].map((s) => (
                <div key={s.label} className="glass px-4 py-3">
                  <s.icon className="w-5 h-5 text-fifa-blue-light mx-auto" />
                  <div className="mt-1.5 text-xl font-extrabold text-white">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── COUNTDOWN TO FINAL ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-fifa-gold/30 bg-gradient-to-br from-fifa-blue-dark via-fifa-navy to-fifa-navy p-6 sm:p-10">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Trophy className="w-56 h-56 text-fifa-gold" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10">
                <Clock className="w-3.5 h-3.5" /> Countdown to Kick-off
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">The World Cup Final</h2>
              <p className="mt-1 text-blue-100/80 text-sm">
                {FINAL_MATCH.home.flag} {FINAL_MATCH.home.name} vs {FINAL_MATCH.away.name} {FINAL_MATCH.away.flag}
                <br />
                {formatMatchDate(FINAL_MATCH.dateISO)} · {finalStadium?.name}, {finalCity?.name}
              </p>
              <Link href={`/match/${FINAL_MATCH.id}`} className="btn-gold inline-flex items-center gap-2 mt-5 text-sm !py-2.5">
                Final tickets from {formatPrice(cheapestForMatch(FINAL_MATCH.id))} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <Countdown targetIso={FINAL_MATCH.dateISO} />
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURED MATCHES ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-fifa-red" /> Featured Matches
            </h2>
            <p className="text-muted text-sm mt-1">Marquee fixtures with live ticket availability.</p>
          </div>
          <Link href="/matches" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-fifa-blue-light hover:gap-2 transition-all">
            All matches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((m) => (
            <MatchCard key={m.id} match={m} featured />
          ))}
        </div>
      </section>

      {/* ───────────────── TRENDING + RECENTLY SOLD ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-fifa-blue-light" /> Trending Now
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {trending.slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-fifa-green" /> Recently Sold
          </h2>
          <RecentlySold />
        </div>
      </section>

      {/* ───────────────── SEATING CATEGORIES ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center">Find your perfect seat</h2>
        <p className="text-muted text-sm text-center mt-2 max-w-2xl mx-auto">
          From budget-friendly upper deck to all-inclusive VIP hospitality — every tier in every stadium.
        </p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.category}
              href={`/tickets?category=${encodeURIComponent(s.category)}`}
              className="card hover:border-fifa-blue/40 transition-colors p-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CategoryDot category={s.category} />
                  <span className="font-bold text-white text-sm">{s.category}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-fifa-blue-light group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">{s.blurb}</p>
              <div className="mt-3 text-xs">
                <span className="text-muted">From </span>
                <span className="text-fifa-gold font-bold">{formatPrice(s.min)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────── HOST CITIES ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-fifa-blue-light" /> 16 Host Cities
          </h2>
          <Link href="/stadiums" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-fifa-blue-light hover:gap-2 transition-all">
            All stadiums <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {HOST_CITIES.map((c) => {
            const st = getStadium(c.stadiumId);
            return (
              <Link
                key={c.id}
                href={`/tickets?city=${encodeURIComponent(c.name)}`}
                className="card hover:border-fifa-blue/40 transition-colors p-4 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted truncate">{st?.name}</div>
                </div>
                <span className="text-2xl">{c.emoji}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────────── BUYER GUARANTEE CTA ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-fifa-blue/30 bg-gradient-to-br from-fifa-blue-dark/60 to-fifa-navy p-8 sm:p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-fifa-green mx-auto" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">The 100% Buyer Guarantee</h2>
          <p className="mt-3 text-blue-100/80 max-w-2xl mx-auto">
            Every ticket is verified and backed end-to-end. If your tickets don&apos;t arrive
            as described, we&apos;ll find comparable replacements or refund you in full.
            Sell with confidence too — get paid fast after the match.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tickets" className="btn-primary">Browse Tickets</Link>
            <Link href="/sell" className="btn-outline">Sell Your Tickets</Link>
          </div>
        </div>
      </section>
    </>
  );
}
