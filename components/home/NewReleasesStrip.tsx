import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import type { Product } from '@/types';
import { BRAND_META, LANGUAGE_META } from '@/lib/brands';
import { formatDate, daysUntil } from '@/lib/utils';

interface Props {
  releases: Product[];
}

export function NewReleasesStrip({ releases }: Props) {
  if (releases.length === 0) return null;

  return (
    <section className="py-12 bg-bg-card border-y border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Releases</h2>
              <p className="text-muted text-xs">Pre-order before they sell out</p>
            </div>
          </div>
          <Link href="/releases" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1 font-semibold">
            Full Calendar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {releases.slice(0, 8).map((p) => {
            const brand = BRAND_META[p.brand];
            const lang  = LANGUAGE_META[p.language];
            const days  = daysUntil(p.release_date);

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="flex-shrink-0 w-44 card p-3 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: brand.primaryColor }}>
                    {brand.name.split(' ')[0]}
                  </span>
                  <span>{lang.flag}</span>
                </div>
                <p className="text-white text-sm font-semibold leading-tight group-hover:text-accent transition-colors line-clamp-2 mb-2">
                  {p.set_name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="badge bg-accent/20 text-accent border border-accent/30 text-xs">
                    {days === 0 ? 'Today!' : days < 0 ? 'Released' : `In ${days}d`}
                  </span>
                </div>
                <p className="text-muted text-xs mt-1">{formatDate(p.release_date)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
