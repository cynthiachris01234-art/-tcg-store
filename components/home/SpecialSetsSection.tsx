import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface Props {
  products: Product[];
}

export function SpecialSetsSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,150,42,0.10) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <h2 className="text-2xl font-bold text-gold-gradient">Special Sets</h2>
            </div>
            <p className="text-muted text-sm">Rare, vintage & premium Pokémon sets — collector favourites</p>
          </div>
          <Link
            href="/special-sets"
            className="flex items-center gap-1 text-sm font-semibold text-accent hover:opacity-80 transition-opacity"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Gold divider */}
        <div className="h-px w-full mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,150,42,0.4) 50%, transparent)' }} />

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
