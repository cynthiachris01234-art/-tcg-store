import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase';
import { BRAND_META, BRANDS } from '@/lib/brands';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterBar } from '@/components/product/FilterBar';
import type { Brand, Language, ProductType } from '@/types';

interface Props {
  params: { brand: string };
  searchParams: { lang?: Language; type?: ProductType; stock?: string; sort?: string };
}

export async function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b }));
}

export async function generateMetadata({ params }: Props) {
  const meta = BRAND_META[params.brand as Brand];
  if (!meta) return {};
  const descriptions: Record<string, string> = {
    pokemon:  'Shop sealed Pokémon TCG booster boxes and cases in English, Japanese, and Korean. Scarlet & Violet, Mega Evolution, Evolving Skies and more — always 40% below market price.',
    onepiece: 'Shop sealed One Piece TCG booster boxes in English and Japanese. From Romance Dawn to the latest sets — always 40% below market price.',
    mtg:      'Shop sealed Magic: The Gathering booster boxes including Final Fantasy, Tarkir Dragonstorm, TMNT, and more — always 40% below market price.',
    yugioh:   'Shop sealed Yu-Gi-Oh! booster boxes in English and Japanese — always 40% below market price.',
  };
  return {
    title: `${meta.name} Booster Boxes & Cases — 40% Off Market Price`,
    description: descriptions[params.brand] ?? `Shop sealed ${meta.name} products at 40% below market price.`,
    alternates: { canonical: `https://apextcg.shop/shop/${params.brand}` },
    openGraph: {
      title: `${meta.name} Booster Boxes & Cases — Apex TCG`,
      description: descriptions[params.brand] ?? `Shop sealed ${meta.name} products at 40% below market price.`,
      url: `https://apextcg.shop/shop/${params.brand}`,
    },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const brand = params.brand as Brand;
  if (!BRANDS.includes(brand)) notFound();

  const meta = BRAND_META[brand];
  const products = await getProducts({
    brand,
    language:      searchParams.lang,
    product_type:  searchParams.type,
    in_stock_only: searchParams.stock === '1',
    sort_by: (searchParams.sort as any) || 'newest',
  });

  return (
    <div>
      {/* Brand hero */}
      <div className={`${meta.bgClass} relative overflow-hidden py-14`}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${meta.primaryColor}20 0%, transparent 70%)` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: meta.primaryColor }}>
            {meta.name}
          </h1>
          <p className="text-muted">{meta.tagline} · Booster Boxes & Cases</p>
          <p className="text-sm mt-2" style={{ color: meta.primaryColor }}>
            {products.length} products available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <Suspense><FilterBar /></Suspense>
          </aside>
          <div className="flex-1">
            <ProductGrid products={products} emptyMessage={`No ${meta.name} products found.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
