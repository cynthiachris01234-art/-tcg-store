import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterBar } from '@/components/product/FilterBar';
import { Package2, Tag } from 'lucide-react';
import type { Brand, Language } from '@/types';

export const metadata = { title: 'Booster Cases — Buy 6 Boxes, Save Extra 5%' };

interface Props {
  searchParams: { brand?: Brand; lang?: Language; stock?: string; sort?: string };
}

export default async function CasesPage({ searchParams }: Props) {
  const products = await getProducts({
    product_type:  'case',
    brand:         searchParams.brand,
    language:      searchParams.lang,
    in_stock_only: searchParams.stock === '1',
    sort_by: (searchParams.sort as any) || 'newest',
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-surface border-b border-bg-border py-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.15) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-mtg-gold/20 rounded-xl flex items-center justify-center">
              <Package2 className="w-6 h-6 text-mtg-gold" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Booster Cases</h1>
              <p className="text-muted mt-1">6 boxes per case · Extra 5% bundle discount</p>
            </div>
          </div>

          {/* Savings info strip */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="card px-5 py-3 flex items-center gap-3">
              <Tag className="w-5 h-5 text-success" />
              <div>
                <p className="text-white font-semibold text-sm">30% below market</p>
                <p className="text-muted text-xs">Base discount on all products</p>
              </div>
            </div>
            <div className="card px-5 py-3 flex items-center gap-3">
              <Package2 className="w-5 h-5 text-mtg-gold" />
              <div>
                <p className="text-white font-semibold text-sm">Extra 5% on cases</p>
                <p className="text-muted text-xs">Stacks on top of the 30%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <Suspense><FilterBar /></Suspense>
          </aside>
          <div className="flex-1">
            <p className="text-muted text-sm mb-4">{products.length} cases available</p>
            <ProductGrid products={products} emptyMessage="No cases available yet. Check back soon!" />
          </div>
        </div>
      </div>
    </div>
  );
}
