import { getMockProducts } from '@/lib/mock-data';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Star } from 'lucide-react';

export const revalidate = 3600;

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

export default function SpecialSetsPage() {
  const allProducts = getMockProducts({});
  const products = allProducts
    .filter(p => SPECIAL_SET_IDS.includes(p.id))
    .sort((a, b) => b.market_price_usd - a.market_price_usd);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,150,42,0.15)' }}>
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          <h1 className="text-4xl font-black text-gold-gradient">Special Sets</h1>
        </div>
        <p className="text-muted text-lg">
          Rare vintage boxes, premium ETBs, and collector-grade Pokémon sets — sorted by value.
        </p>
        <div className="h-px mt-6" style={{ background: 'linear-gradient(90deg, rgba(200,150,42,0.5), transparent)' }} />
      </div>

      {/* Grid */}
      <ProductGrid products={products} />
    </div>
  );
}
