import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase';
import { LANGUAGE_META, LANGUAGES } from '@/lib/brands';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterBar } from '@/components/product/FilterBar';
import type { Language, Brand, ProductType } from '@/types';

interface Props {
  params: { lang: string };
  searchParams: { brand?: Brand; type?: ProductType; stock?: string; sort?: string };
}

export async function generateStaticParams() {
  return LANGUAGES.map((l) => ({ lang: l }));
}

export async function generateMetadata({ params }: Props) {
  const meta = LANGUAGE_META[params.lang as Language];
  if (!meta) return {};
  return { title: `${meta.flag} ${meta.label} TCG Booster Boxes` };
}

export default async function LanguagePage({ params, searchParams }: Props) {
  const lang = params.lang as Language;
  if (!LANGUAGES.includes(lang)) notFound();

  const meta = LANGUAGE_META[lang];
  const products = await getProducts({
    language: lang,
    brand: searchParams.brand,
    product_type: searchParams.type,
    in_stock_only: searchParams.stock === '1',
    sort_by: (searchParams.sort as any) || 'newest',
  });

  return (
    <div>
      <div className="bg-surface border-b border-bg-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{meta.flag}</span>
            <div>
              <h1 className="text-4xl font-bold text-white">{meta.label} Cards</h1>
              <p className="text-muted mt-1">{products.length} sealed boxes & cases</p>
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
            <ProductGrid products={products} emptyMessage={`No ${meta.label} products found.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
