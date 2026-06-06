import { getBestSellers, getNewReleases } from '@/lib/supabase';
import { HeroBanner } from '@/components/home/HeroBanner';
import { BoxShelf } from '@/components/home/BoxShelf';
import { SpecialSets } from '@/components/home/SpecialSets';
import { NewReleasesStrip } from '@/components/home/NewReleasesStrip';
import { BrandSection } from '@/components/home/BrandSection';
import { DealsBanner } from '@/components/home/DealsBanner';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { BRANDS } from '@/lib/brands';
import { ShieldCheck, RefreshCw, Truck, Headphones } from 'lucide-react';

export const revalidate = 3600; // revalidate every hour

async function getData() {
  const [pokemon, onepiece, mtg, yugioh, releases] = await Promise.all([
    getBestSellers('pokemon',  4),
    getBestSellers('onepiece', 4),
    getBestSellers('mtg',      4),
    getBestSellers('yugioh',   4),
    getNewReleases(10),
  ]);
  return { pokemon, onepiece, mtg, yugioh, releases };
}

const TRUST_BADGES = [
  { icon: ShieldCheck, title: '100% Authentic',    desc: 'Factory sealed, never opened'        },
  { icon: RefreshCw,   title: 'Weekly Price Sync', desc: 'Always 30% below market'             },
  { icon: Truck,       title: 'Fast Shipping',     desc: 'Tracked worldwide delivery'           },
  { icon: Headphones,  title: '24/7 Support',      desc: 'Real help for real collectors'        },
];

export default async function HomePage() {
  const { pokemon, onepiece, mtg, yugioh, releases } = await getData();

  return (
    <div>
      <HeroBanner />

      {/* Box display shelf */}
      <BoxShelf />

      {/* Special Pokémon Sets */}
      <SpecialSets />

      {/* New Releases */}
      <NewReleasesStrip releases={releases} />

      {/* Trust badges */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-muted text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deals banner */}
      <DealsBanner />

      {/* Brand sections */}
      <BrandSection brand="pokemon"  products={pokemon}  />
      <BrandSection brand="onepiece" products={onepiece} />
      <BrandSection brand="mtg"      products={mtg}      />
      <BrandSection brand="yugioh"   products={yugioh}   />

      {/* Special Sets — rare & premium Pokémon */}
      <SpecialSets />

      {/* Customer Reviews */}
      <ReviewsSection />
    </div>
  );
}
