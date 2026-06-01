import { getActiveDeals, getProducts } from '@/lib/supabase';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Flame, Clock, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Deals & Flash Sales' };

export default async function DealsPage() {
  const [deals, cases] = await Promise.all([
    getActiveDeals(),
    getProducts({ product_type: 'case', sort_by: 'price_asc' }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-onepiece/20 rounded-xl flex items-center justify-center">
          <Flame className="w-6 h-6 text-onepiece" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Deals & Flash Sales</h1>
          <p className="text-muted mt-1">Limited time bundles on top of our 30% base discount</p>
        </div>
      </div>

      {/* Permanent case bundle section */}
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface to-bg-card border border-mtg-gold/30 p-8 mb-6">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(217,119,6,0.15) 0%, transparent 60%)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-mtg-gold" />
              <span className="text-mtg-gold font-semibold uppercase tracking-widest text-sm">Permanent Deal</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Case Bundle — Extra 5% Off</h2>
            <p className="text-muted">Buy any case and get an extra 5% off on top of our 30% below-market prices.</p>
          </div>
        </div>
        <ProductGrid products={cases.slice(0, 8)} />
      </div>

      {/* Active flash deals */}
      {deals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Flame className="w-6 h-6 text-onepiece" /> Flash Sales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal: any) => (
              <div key={deal.id} className="card p-6 border border-onepiece/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-onepiece to-mtg-gold" />
                <div className="flex items-start justify-between mb-3">
                  <span className="badge bg-onepiece/20 text-onepiece border border-onepiece/30">{deal.badge_label}</span>
                  <div className="flex items-center gap-1 text-muted text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Ends {formatDate(deal.ends_at)}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{deal.title}</h3>
                <p className="text-muted text-sm mb-4">{deal.description}</p>
                <span className="badge bg-success/20 text-success border border-success/30 text-sm px-3 py-1">
                  Extra -{deal.extra_discount_percent}% off
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
