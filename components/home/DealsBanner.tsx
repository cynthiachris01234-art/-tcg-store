import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';

export function DealsBanner() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-onepiece-gradient to-mtg-gradient border border-bg-border p-8">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(217,119,6,0.15) 0%, transparent 60%)' }} />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Flame className="w-5 h-5 text-onepiece" />
                <span className="text-sm font-semibold text-onepiece uppercase tracking-widest">Flash Sales & Bundles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Buy a Case, Save <span className="text-mtg-gold">Extra 5%</span>
              </h2>
              <p className="text-muted">Already 30% below market — cases stack an extra 5% on top.</p>
            </div>
            <Link href="/deals" className="btn-primary whitespace-nowrap flex items-center gap-2 px-8">
              View All Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
