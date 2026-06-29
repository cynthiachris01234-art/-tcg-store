import Link from 'next/link';
import { Trophy, Clock, MapPin, ShieldCheck, ArrowRight, Tag, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';
import { SellEstimatorHero } from '@/components/fifa/SellEstimatorHero';
import { ResellPromo } from '@/components/fifa/ResellPromo';
import { Countdown } from '@/components/fifa/Countdown';
import { LiveInventory } from '@/components/fifa/LiveInventory';
import { MatchCard } from '@/components/fifa/MatchCard';
import { RecentlySold } from '@/components/fifa/RecentlySold';
import { CategoryDot } from '@/components/fifa/Badges';
import {
  getTrendingMatches, marketplaceStats, SECTIONS,
} from '@/lib/fifa/listings';
import { FINAL_MATCH, HOST_CITIES, getStadium, getCityForStadium } from '@/lib/fifa/world-cup';
import { formatPrice, formatMatchDate } from '@/lib/fifa/format';

export default function HomePage() {
  const hotToSell = getTrendingMatches(6);
  const stats = marketplaceStats();
  const finalStadium = getStadium(FINAL_MATCH.stadiumId);
  const finalCity = getCityForStadium(FINAL_MATCH.stadiumId);

  return (
    <>
      {/* ───────────────── HERO — SELL FIRST ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-pitch-gradient" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: pitch */}
            <div>
              <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10 mb-5">
                <Tag className="w-3.5 h-3.5" /> FIFA World Cup 2026™ · Sell Your Tickets
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Sell your World Cup tickets for <span className="text-gold-gradient">top dollar.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-blue-100/80 max-w-xl">
                Goal26 is the safest way to sell and resell FIFA World Cup 2026 tickets. List in
                minutes, reach millions of verified buyers across 16 host cities, and get paid
                fast — with the lowest fees in the game.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/sell" className="btn-gold inline-flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Start Selling
                </Link>
                <Link href="/tickets" className="text-sm font-semibold text-fifa-blue-light hover:underline inline-flex items-center gap-1">
                  Looking to buy? Browse tickets <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Seller trust points */}
              <div className="mt-7 space-y-2">
                {[
                  'Free to list — pay just 10% only when you sell',
                  'Guaranteed payout once your tickets are delivered',
                  'Instant mobile transfer to verified buyers',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-fifa-green shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: instant payout estimator */}
            <div className="flex justify-center lg:justify-end">
              <SellEstimatorHero />
            </div>
          </div>

          <div className="mt-12">
            <LiveInventory listings={stats.totalListings} tickets={stats.totalTickets} />
          </div>

          {/* Seller stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: DollarSign, label: 'Paid to Sellers', value: '$2.4M+' },
              { icon: Clock, label: 'Avg. Time to Sell', value: '< 24h' },
              { icon: Tag, label: 'Seller Fee', value: '10%' },
              { icon: ShieldCheck, label: 'Seller Guarantee', value: '100%' },
            ].map((s) => (
              <div key={s.label} className="glass px-4 py-3 text-center">
                <s.icon className="w-5 h-5 text-fifa-gold mx-auto" />
                <div className="mt-1.5 text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW SELLING WORKS ───────────────── */}
      <ResellPromo />

      {/* ───────────────── DEMAND IS SURGING (countdown) ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-fifa-gold/30 bg-gradient-to-br from-fifa-blue-dark via-fifa-navy to-fifa-navy p-6 sm:p-10">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Trophy className="w-56 h-56 text-fifa-gold" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10">
                <TrendingUp className="w-3.5 h-3.5" /> Demand is surging — list before kickoff
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">Prices peak as the Final nears</h2>
              <p className="mt-1 text-blue-100/80 text-sm">
                {FINAL_MATCH.home.flag} {FINAL_MATCH.home.name} vs {FINAL_MATCH.away.name} {FINAL_MATCH.away.flag}
                <br />
                {formatMatchDate(FINAL_MATCH.dateISO)} · {finalStadium?.name}, {finalCity?.name}
              </p>
              <Link href="/sell" className="btn-gold inline-flex items-center gap-2 mt-5 text-sm !py-2.5">
                List your tickets now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <Countdown targetIso={FINAL_MATCH.dateISO} />
          </div>
        </div>
      </section>

      {/* ───────────────── PRICE AGAINST THE MARKET ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-fifa-green" /> Hottest Matches to Sell
            </h2>
            <p className="text-muted text-sm mt-1">The highest-demand fixtures — check the live market and price your seats to sell.</p>
          </div>
          <Link href="/matches" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-fifa-blue-light hover:gap-2 transition-all">
            All matches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotToSell.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* ───────────────── RECENT SELLER PAYOUTS ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-fifa-gold" /> Recent Sales
          </h2>
          <p className="text-muted text-sm mb-6">Real-time proof of what sellers are earning across the marketplace.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SECTIONS.slice(0, 6).map((s) => (
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
                <div className="mt-2 text-xs text-muted">Typical resale range</div>
                <div className="text-sm">
                  <span className="text-fifa-gold font-bold">{formatPrice(s.min)}</span>
                  <span className="text-muted"> – {formatPrice(s.max)}</span>
                  <span className="text-muted"> / ticket</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-fifa-green" /> Just Sold
          </h2>
          <RecentlySold />
        </div>
      </section>

      {/* ───────────────── SELL IN ANY HOST CITY ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-fifa-blue-light" /> Sell in Any of 16 Host Cities
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
                href="/sell"
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

      {/* ───────────────── FINAL SELLER CTA ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-fifa-gold/30 bg-gradient-to-br from-fifa-navy via-fifa-blue-dark/40 to-fifa-navy p-8 sm:p-12 text-center">
          <Tag className="w-12 h-12 text-fifa-gold mx-auto" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">Ready to sell your tickets?</h2>
          <p className="mt-3 text-blue-100/80 max-w-2xl mx-auto">
            List in under two minutes, reach millions of verified buyers, and get a guaranteed
            payout the moment your tickets are delivered. It&apos;s free to list — you only pay
            when you sell.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sell" className="btn-gold">List Your Tickets</Link>
            <Link href="/account" className="btn-outline">Manage My Listings</Link>
          </div>
        </div>
      </section>
    </>
  );
}
