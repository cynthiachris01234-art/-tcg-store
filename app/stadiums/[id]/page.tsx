import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MapPin, Users, CalendarDays, Home, ChevronLeft } from 'lucide-react';
import { STADIUMS, MATCHES, getStadium, getCity } from '@/lib/fifa/world-cup';
import { SECTIONS } from '@/lib/fifa/listings';
import { formatPrice } from '@/lib/fifa/format';
import { MatchCard } from '@/components/fifa/MatchCard';
import { CategoryDot } from '@/components/fifa/Badges';

export function generateStaticParams() {
  return STADIUMS.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const s = getStadium(params.id);
  if (!s) return { title: 'Stadium not found' };
  return {
    title: `${s.name} — ${s.cityName} Tickets`,
    description: `FIFA World Cup 2026 matches and tickets at ${s.name} in ${s.cityName}. Capacity ${s.capacity.toLocaleString()}.`,
  };
}

export default function StadiumPage({ params }: { params: { id: string } }) {
  const stadium = getStadium(params.id);
  if (!stadium) notFound();
  const city = getCity(stadium.cityId);
  const matches = MATCHES.filter((m) => m.stadiumId === stadium.id).sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stadium.image} alt={stadium.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <Link href="/stadiums" className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white mb-3">
              <ChevronLeft className="w-4 h-4" /> All stadiums
            </Link>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white">{stadium.name}</h1>
            <p className="text-blue-100/90 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {city?.name}, {stadium.country}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users, label: 'Capacity', value: stadium.capacity.toLocaleString() },
            { icon: CalendarDays, label: 'Matches Hosted', value: String(matches.length) },
            { icon: Home, label: 'Roof', value: stadium.roof },
            { icon: MapPin, label: 'Opened', value: String(stadium.opened) },
          ].map((f) => (
            <div key={f.label} className="card p-4">
              <f.icon className="w-5 h-5 text-fifa-blue-light" />
              <div className="mt-2 text-lg font-extrabold text-white">{f.value}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Section pricing */}
        <h2 className="text-xl font-extrabold text-white mb-4">Seating &amp; Pricing</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {SECTIONS.map((s) => (
            <div key={s.category} className="card p-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CategoryDot category={s.category} />
                <span className="text-sm font-semibold text-white">{s.category}</span>
              </span>
              <span className="text-sm text-fifa-gold font-bold">
                {formatPrice(s.min)}<span className="text-muted font-normal">–{formatPrice(s.max)}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Matches here */}
        <h2 className="text-xl font-extrabold text-white mb-4">
          Matches at {stadium.name} <span className="text-muted font-normal">({matches.length})</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </div>
  );
}
