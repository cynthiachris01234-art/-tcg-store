import { getBestSellers, getNewReleases } from '@/lib/supabase';
import { JsonLd } from '@/components/JsonLd';
import { HeroBanner } from '@/components/home/HeroBanner';
import { BoxShelf } from '@/components/home/BoxShelf';
import { SpecialSets } from '@/components/home/SpecialSets';
import { NewReleasesStrip } from '@/components/home/NewReleasesStrip';
import { BrandSection } from '@/components/home/BrandSection';
import { DealsBanner } from '@/components/home/DealsBanner';
import { PromoSection } from '@/components/home/PromoSection';
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Where can I buy cheap sealed Pokémon booster boxes?', acceptedAnswer: { '@type': 'Answer', text: 'Apex TCG sells 100% sealed Pokémon booster boxes at 40% below market price. We stock English, Japanese, and Korean sets including Scarlet & Violet, Evolving Skies, and Mega Evolution sets.' } },
          { '@type': 'Question', name: 'Does Apex TCG sell One Piece TCG booster boxes?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Apex TCG carries a full selection of One Piece TCG booster boxes in English and Japanese, from Romance Dawn (OP01) through the latest sets, all at 40% below retail market price.' } },
          { '@type': 'Question', name: 'Are the cards and boxes sold by Apex TCG authentic?', acceptedAnswer: { '@type': 'Answer', text: 'All products at Apex TCG are 100% factory sealed and authenticated. We source directly and guarantee authenticity on every order.' } },
          { '@type': 'Question', name: 'Does Apex TCG ship internationally?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Apex TCG ships worldwide with tracked delivery. We accept international payment methods including Wise Transfer for low-fee cross-border payments.' } },
          { '@type': 'Question', name: 'What payment methods does Apex TCG accept?', acceptedAnswer: { '@type': 'Answer', text: 'Apex TCG accepts Credit/Debit Cards (via Stripe), PayPal, Apple Pay, Cash App, and Wise Transfer.' } },
          { '@type': 'Question', name: 'How much is an MTG Final Fantasy booster box?', acceptedAnswer: { '@type': 'Answer', text: 'Apex TCG sells the MTG Final Fantasy Play booster box at 40% below market price. Check the MTG section of our shop for the current price.' } },
        ],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Apex TCG',
        url: 'https://apextcg.shop',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://apextcg.shop/shop?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      }} />
      <HeroBanner />

      {/* Featured Promos */}
      <PromoSection />

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
