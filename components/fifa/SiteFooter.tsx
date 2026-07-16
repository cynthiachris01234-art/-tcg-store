import Link from 'next/link';
import { ShieldCheck, Smartphone, Zap, Lock } from 'lucide-react';
import { Logo } from './Logo';

const COLS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/matches', label: 'All Matches' },
      { href: '/tickets', label: 'Browse Tickets' },
      { href: '/stadiums', label: 'Stadiums' },
      { href: '/sell', label: 'Sell Tickets' },
    ],
  },
  {
    title: 'Tournament',
    links: [
      { href: '/matches?stage=Final', label: 'World Cup Final' },
      { href: '/matches?stage=Semi-final', label: 'Semi-finals' },
      { href: '/matches?stage=Group+Stage', label: 'Group Stage' },
      { href: '/tickets?category=VIP+Hospitality', label: 'VIP Hospitality' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/account', label: 'My Account' },
      { href: '/sell', label: 'Seller Centre' },
      { href: '#', label: 'Buyer Guarantee' },
      { href: '#', label: 'Help & FAQ' },
    ],
  },
];

const TRUST = [
  { icon: ShieldCheck, label: '100% Buyer Guarantee' },
  { icon: Zap, label: 'Instant Delivery' },
  { icon: Smartphone, label: 'Mobile Tickets' },
  { icon: Lock, label: 'Secure Checkout' },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-bg-border bg-bg/80">
      {/* trust bar */}
      <div className="border-b border-bg-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fifa-blue/15 text-fifa-blue-light">
                <t.icon className="w-5 h-5" />
              </span>
              <span className="text-sm font-semibold text-gray-200">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted max-w-xs">
            The premium resale marketplace for the FIFA World Cup 2026™. Verified
            tickets across all 16 host cities in the United States, Canada and Mexico.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold text-white mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted hover:text-fifa-blue-light transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-bg-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted space-y-2">
          <p>© 2026 Goal26 Tickets. A fan-made demonstration prototype.</p>
          <p className="text-muted/70 leading-relaxed">
            This is a fictional UI prototype created for design and educational purposes.
            It is <strong>not affiliated with, authorised by, or endorsed by FIFA</strong>, and
            does not sell real tickets. All teams, fixtures, prices and listings shown are
            illustrative mock data. “FIFA World Cup 2026” is referenced nominatively only.
          </p>
        </div>
      </div>
    </footer>
  );
}
