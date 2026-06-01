import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Brand, Product } from '@/types';
import { BRAND_META } from '@/lib/brands';
import { ProductCard } from '@/components/product/ProductCard';

interface Props {
  brand: Brand;
  products: Product[];
}

export function BrandSection({ brand, products }: Props) {
  const meta = BRAND_META[brand];
  if (products.length === 0) return null;

  return (
    <section className={`py-12 ${meta.bgClass} relative overflow-hidden`}>
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${meta.primaryColor}15 0%, transparent 70%)` }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: meta.primaryColor }}>
              {meta.name}
            </h2>
            <p className="text-muted text-sm mt-1">{meta.tagline}</p>
          </div>
          <Link
            href={`/shop/${brand}`}
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: meta.primaryColor }}
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
