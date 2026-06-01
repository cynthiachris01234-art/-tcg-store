import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterBar } from '@/components/product/FilterBar';
import type { Brand, Language, ProductType } from '@/types';

export const metadata = { title: 'All Products' };

interface Props {
  searchParams: {
    brand?: Brand;
    lang?:  Language;
    type?:  ProductType;
    stock?: string;
    sort?:  string;
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const products = await getProducts({
    brand:         searchParams.brand,
    language:      searchParams.lang,
    product_type:  searchParams.type,
    in_stock_only: searchParams.stock === '1',
    sort_by: (searchParams.sort as any) || 'newest',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">All Products</h1>
        <p className="text-muted mt-1">{products.length} products · Always 30% below market</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <Suspense>
            <FilterBar />
          </Suspense>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
