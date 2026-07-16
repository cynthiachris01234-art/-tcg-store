import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import { STADIUMS, MATCHES } from '@/lib/fifa/world-cup';

export const metadata: Metadata = {
  title: 'Stadiums',
  description: 'Explore all 16 FIFA World Cup 2026 stadiums across the USA, Canada and Mexico.',
};

export default function StadiumsPage() {
  const matchCount = (id: string) => MATCHES.filter((m) => m.stadiumId === id).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-fifa-blue-light" /> Host Stadiums
        </h1>
        <p className="text-muted mt-2">16 world-class venues across three nations.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STADIUMS.map((s) => (
          <Link
            key={s.id}
            href={`/stadiums/${s.id}`}
            className="group card overflow-hidden hover:border-fifa-blue/40 hover:shadow-card-hover transition-all"
          >
            <div className="relative h-44 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
              <span className="absolute top-3 left-3 pill bg-fifa-navy/80 text-white">
                {s.country === 'USA' ? '🇺🇸' : s.country === 'Canada' ? '🇨🇦' : '🇲🇽'} {s.country}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-extrabold text-white">{s.name}</h3>
              <p className="text-sm text-muted">{s.cityName}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {s.capacity.toLocaleString()}</span>
                <span>{matchCount(s.id)} matches</span>
                <span className="flex items-center gap-1 text-fifa-blue-light font-semibold group-hover:gap-2 transition-all">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
