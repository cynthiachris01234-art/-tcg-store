import { getProducts } from '@/lib/supabase';
import { BRAND_META, LANGUAGE_META } from '@/lib/brands';
import { formatDate, daysUntil } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { Product } from '@/types';

export const metadata = { title: 'New Releases Calendar' };

function groupByMonth(products: Product[]) {
  return products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = new Date(p.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}

export default async function ReleasesPage() {
  const upcoming = await getProducts({ pre_order: true, sort_by: 'release_date' });
  const grouped  = groupByMonth(upcoming);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">New Releases Calendar</h1>
          <p className="text-muted mt-1">Upcoming booster boxes & cases — pre-order now</p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No upcoming releases found. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([month, products]) => (
            <div key={month}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-accent" />
                {month}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => {
                  const brand = BRAND_META[p.brand];
                  const lang  = LANGUAGE_META[p.language];
                  const days  = daysUntil(p.release_date);

                  return (
                    <Link key={p.id} href={`/product/${p.slug}`}
                      className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.primaryColor }}>
                          {brand.name}
                        </span>
                        <span className="text-xl">{lang.flag}</span>
                      </div>

                      <h3 className="text-white font-semibold group-hover:text-accent transition-colors mb-1">
                        {p.set_name}
                      </h3>
                      <p className="text-muted text-xs mb-3">
                        {p.set_code} · {p.product_type === 'case' ? 'Case' : 'Booster Box'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(p.release_date)}
                        </div>
                        <span className={`badge ${days <= 7 ? 'bg-danger/20 text-danger border-danger/30' : 'bg-accent/20 text-accent border-accent/30'} border`}>
                          {days === 0 ? 'Today!' : days < 0 ? 'Released' : `${days} days`}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-bg-border flex items-center justify-between">
                        <span className="text-white font-bold">${p.our_price_usd.toFixed(2)}</span>
                        <span className="badge bg-success/10 text-success border border-success/20">Pre-Order</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
