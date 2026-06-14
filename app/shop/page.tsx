import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/supabase';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterBar } from '@/components/product/FilterBar';
import { Search } from 'lucide-react';
import type { Brand, Language, ProductType } from '@/types';

interface Props {
  searchParams: { q?: string; brand?: Brand; lang?: Language; type?: ProductType; stock?: string; sort?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q;
  return {
    title: q ? `Search: "${q}"` : 'All Products',
    description: q
      ? `Search results for "${q}" — sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes at 40% off.`
      : 'Browse all sealed TCG booster boxes and cases — Pokémon, One Piece, MTG, and Yu-Gi-Oh! Always 40% below market price.',
    alternates: { canonical: 'https://apextcg.shop/shop' },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const products = await getProducts({
    brand:         searchParams.brand,
    language:      searchParams.lang,
    product_type:  searchParams.type,
    in_stock_only: searchParams.stock === '1',
    sort_by:       (searchParams.sort as any) || 'newest',
    search:        searchParams.q,
  });

  const query = searchParams.q;

  return (
    <div>
      {/* Header */}
      <div className="bg-bg-surface border-b border-bg-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {query ? (
            <>
              <div className="flex items-center gap-3 mb-1">
                <Search className="w-5 h-5 text-accent" />
                <h1 className="text-3xl font-bold text-white">
                  Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
                </h1>
              </div>
              <p className="text-muted text-sm">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-1">All Products</h1>
              <p className="text-muted text-sm">{products.length} products across all brands</p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <Suspense><FilterBar /></Suspense>
          </aside>
          <div className="flex-1">
            <ProductGrid
              products={products}
              emptyMessage={query ? `No products found for "${query}".` : 'No products found.'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
