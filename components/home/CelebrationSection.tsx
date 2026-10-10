import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getMockProducts } from '@/lib/mock-data';
import { ProductCard } from '@/components/product/ProductCard';
import { isComingSoon } from '@/lib/utils';

// Pokémon 30th Celebration (ME30) — flagship anniversary set, featured on the
// homepage. Pulled by set_code so new ME30 products appear here automatically.
export function CelebrationSection() {
  const all = getMockProducts({}).filter(p => p.set_code === 'ME30');
  if (all.length === 0) return null;

  // A compact mix: 4 flagship singles + 4 cases, buyable items first.
  const isCase = (p: typeof all[number]) => p.product_type === 'case' || p.product_type === 'display_case';
  const avail = (p: typeof all[number]) => !isComingSoon(p) && (p.stock_quantity > 0 || p.is_pre_order) ? 1 : 0;
  const FLAGSHIP = [
    'poke-30c-elite-trainer-box-en', 'poke-30c-booster-bundle-en',
    'poke-30c-ultra-premium-collection-night-en', 'poke-30c-pack-en',
  ];
  const rank = (id: string) => { const i = FLAGSHIP.indexOf(id); return i === -1 ? FLAGSHIP.length : i; };
  const singles = all.filter(p => !isCase(p))
    .sort((a, b) => avail(b) - avail(a) || rank(a.id) - rank(b.id) || b.our_price_usd - a.our_price_usd)
    .slice(0, 4);
  const cases = all.filter(isCase)
    .sort((a, b) => avail(b) - avail(a) || b.our_price_usd - a.our_price_usd)
    .slice(0, 4);
  const products = [...singles, ...cases];

  return (
    <section className="py-14 relative overflow-hidden">
      {/* Anniversary glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,150,42,0.18) 0%, transparent 65%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Just Released · 30 Years of Pokémon TCG
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gold-gradient leading-tight">
              Pokémon 30th Celebration
            </h2>
            <p className="text-muted text-sm mt-2 max-w-xl leading-relaxed">
              Every card is foil — including basic Energy. Each pack holds 1 of 30 numbered
              anniversary Pikachu cards, plus 30 reprinted classics from Base Set to today.
            </p>
          </div>
          <Link
            href="/shop?q=30th%20Celebration"
            className="btn-primary flex items-center gap-2 px-6 py-3 whitespace-nowrap self-start sm:self-auto"
          >
            Shop the set <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="h-px w-full mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,150,42,0.45) 50%, transparent)' }} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <p className="text-muted text-xs mt-6 text-center">
          {all.length} 30th Celebration products available ·{' '}
          <Link href="/shop?q=30th%20Celebration" className="text-accent hover:underline">
            view them all
          </Link>
        </p>
      </div>
    </section>
  );
}
