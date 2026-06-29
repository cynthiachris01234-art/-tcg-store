import Link from 'next/link';
import { Tag, Zap, DollarSign, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';

const BENEFITS = [
  { icon: Zap, title: 'List in 2 minutes', text: 'Pick your match and section — we suggest a competitive price from live market data.' },
  { icon: DollarSign, title: 'Industry-low 10% fee', text: 'Keep more of every sale. Guaranteed payout once your tickets are delivered.' },
  { icon: Smartphone, title: 'Instant mobile transfer', text: 'Sell mobile tickets that transfer to the buyer the moment the sale clears.' },
  { icon: ShieldCheck, title: 'Seller protection', text: 'Backed end-to-end. Sell to millions of verified buyers with total confidence.' },
];

export function ResellPromo() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-fifa-gold/30 bg-gradient-to-br from-fifa-navy via-fifa-blue-dark/40 to-fifa-navy p-6 sm:p-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10">
              <Tag className="w-3.5 h-3.5" /> Sell · Resell · Cash Out
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Can&apos;t make the match?{' '}
              <span className="text-gold-gradient">Resell your tickets.</span>
            </h2>
            <p className="mt-3 text-blue-100/80">
              Goal26 is built for fans reselling to fans. Whether you bought extras, your team
              didn&apos;t advance, or plans changed — list your seats in minutes and reach buyers
              across all 16 host cities.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/sell" className="btn-gold inline-flex items-center gap-2">
                Start Reselling <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/account" className="btn-outline inline-flex items-center gap-2">
                Manage My Listings
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { value: '$2.4M+', label: 'Paid to sellers' },
                { value: '< 24 hrs', label: 'Avg. time to sell' },
                { value: '4.9★', label: 'Seller satisfaction' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="glass p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fifa-gold/15 text-fifa-gold">
                  <b.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-3 font-bold text-white text-sm">{b.title}</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
