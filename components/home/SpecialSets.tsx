import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const SPECIAL_SETS = [
  {
    id: 'poke-jungle-1st-en-box',
    name: 'Jungle 1st Edition',
    year: '1999',
    market: 5000,
    our: 3000,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/107598.jpg',
    badge: 'Vintage',
    badgeColor: '#FFD700',
    slug: 'pokemon-jungle-1st-en-box',
  },
  {
    id: 'poke-fossil-1st-en-box',
    name: 'Fossil 1st Edition',
    year: '1999',
    market: 3200,
    our: 1920,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/107601.jpg',
    badge: 'Vintage',
    badgeColor: '#FFD700',
    slug: 'pokemon-fossil-1st-en-box',
  },
  {
    id: 'poke-base-rev-en-box',
    name: 'Base Set Revised',
    year: '1999',
    market: 3000,
    our: 1800,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/185731.jpg',
    badge: 'Vintage',
    badgeColor: '#FFD700',
    slug: 'pokemon-base-rev-en-box',
  },
  {
    id: 'poke-evs-en-box',
    name: 'Evolving Skies',
    year: '2021',
    market: 900,
    our: 540,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/242436.jpg',
    badge: 'Fan Favourite',
    badgeColor: '#3B82F6',
    slug: 'pokemon-evs-en-box',
  },
  {
    id: 'poke-prismatic-evo-etb-en',
    name: 'Prismatic Evolutions',
    year: '2025',
    market: 450,
    our: 270,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/593355.jpg',
    badge: 'Hot',
    badgeColor: '#EF4444',
    slug: 'pokemon-prismatic-evo-etb-en',
  },
  {
    id: 'poke-champions-path-etb-en',
    name: "Champion's Path",
    year: '2020',
    market: 300,
    our: 180,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/218791.jpg',
    badge: 'Rare',
    badgeColor: '#A855F7',
    slug: 'pokemon-champions-path-etb-en',
  },
  {
    id: 'poke-hidden-fates-etb-en',
    name: 'Hidden Fates',
    year: '2019',
    market: 210,
    our: 126,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/194729.jpg',
    badge: 'Rare',
    badgeColor: '#A855F7',
    slug: 'pokemon-hidden-fates-etb-en',
  },
  {
    id: 'poke-crown-zenith-etb-en',
    name: 'Crown Zenith',
    year: '2023',
    market: 195,
    our: 117,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/453470.jpg',
    badge: 'Special',
    badgeColor: '#C8962A',
    slug: 'pokemon-crown-zenith-etb-en',
  },
  {
    id: 'poke-shining-fates-etb-en',
    name: 'Shining Fates',
    year: '2021',
    market: 160,
    our: 96,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/228821.jpg',
    badge: 'Special',
    badgeColor: '#C8962A',
    slug: 'pokemon-shining-fates-etb-en',
  },
  {
    id: 'poke-paldean-fates-etb-en',
    name: 'Paldean Fates',
    year: '2024',
    market: 140,
    our: 84,
    image: 'https://product-images.tcgplayer.com/fit-in/400x558/528040.jpg',
    badge: 'Special',
    badgeColor: '#C8962A',
    slug: 'pokemon-paldean-fates-etb-en',
  },
];

export function SpecialSets() {
  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Pokémon Special Sets</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Rare &amp; Vintage <span className="text-gold-gradient">Collector Sets</span>
          </h2>
          <p className="text-muted text-sm mt-1">First editions, discontinued sets &amp; fan favourites — all sealed &amp; authentic</p>
        </div>
        <Link href="/shop/pokemon" className="hidden sm:flex items-center gap-1.5 text-accent text-sm hover:underline flex-shrink-0">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {SPECIAL_SETS.map((set) => (
          <Link
            key={set.id}
            href={`/product/${set.slug}`}
            className="group card p-3 flex flex-col hover:border-accent/40 transition-all duration-200 hover:-translate-y-1"
          >
            {/* Badge */}
            <div className="flex justify-between items-start mb-2">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: `${set.badgeColor}25`, color: set.badgeColor }}
              >
                {set.badge}
              </span>
              <span className="text-[9px] text-muted">{set.year}</span>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-bg mb-3 group-hover:shadow-lg transition-shadow">
              <Image
                src={set.image}
                alt={set.name}
                fill
                unoptimized
                className="object-contain p-1"
              />
            </div>

            {/* Info */}
            <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1">{set.name}</p>
            <p className="text-muted text-[10px] line-through">${set.market.toLocaleString()}</p>
            <p className="text-accent text-sm font-black">${set.our.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      {/* Mobile view all */}
      <div className="mt-6 text-center sm:hidden">
        <Link href="/shop/pokemon" className="btn-outline inline-flex items-center gap-2 text-sm px-6 py-2.5">
          View all Pokémon <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
