import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { getMockProducts } from '@/lib/mock-data';
import { ProductCard } from '@/components/product/ProductCard';

const SPECIAL_SET_IDS = [
  'poke-jungle-1st-en-box',
  'poke-fossil-1st-en-box',
  'poke-base-rev-en-box',
  'poke-hidden-fates-etb-en',
  'poke-shining-fates-etb-en',
  'poke-champions-path-etb-en',
  'poke-prismatic-evo-etb-en',
  'poke-crown-zenith-etb-en',
  'poke-paldean-fates-etb-en',
  'poke-evs-en-box',
  'poke-evs-en-case',
];

export function SpecialSets() {
  const products = getMockProducts({})
    .filter(p => SPECIAL_SET_IDS.includes(p.id))
    .sort((a, b) => b.market_price_usd - a.market_price_usd)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,150,42,0.10) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <h2 className="text-2xl font-bold text-gold-gradient">Special Sets</h2>
            </div>
            <p className="text-muted text-sm">Rare, vintage &amp; premium Pokémon — collector favourites</p>
          </div>
          <Link href="/special-sets" className="flex items-center gap-1 text-sm font-semibold text-accent hover:opacity-80 transition-opacity">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="h-px w-full mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,150,42,0.4) 50%, transparent)' }} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
