'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, Ticket, User, ShieldCheck, Tag } from 'lucide-react';
import { Logo } from './Logo';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Matches' },
  { href: '/tickets', label: 'Buy Tickets' },
  { href: '/stadiums', label: 'Stadiums' },
];

export function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    router.push(q ? `/tickets?q=${encodeURIComponent(q)}` : '/tickets');
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top trust strip */}
      <div className="bg-fifa-blue-dark/80 backdrop-blur border-b border-white/5 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-blue-100">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-fifa-gold" />
            100% Buyer Guarantee · Every ticket verified
          </span>
          <span className="hidden sm:inline text-blue-200/80">USA 🇺🇸 · Canada 🇨🇦 · Mexico 🇲🇽 — June 11 – July 19, 2026</span>
        </div>
      </div>

      <nav className="bg-bg/90 backdrop-blur-xl border-b border-bg-border" style={{ boxShadow: '0 1px 0 rgba(23,99,255,0.18)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="group shrink-0">
              <Logo className="group-hover:scale-[1.03] transition-transform" />
            </Link>

            {/* Desktop search */}
            <form onSubmit={submit} className="hidden lg:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Team, Stadium, City or Match"
                  className="w-full bg-surface border border-bg-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-fifa-blue focus:ring-1 focus:ring-fifa-blue/50 transition"
                />
              </div>
            </form>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/sell"
                className="ml-1 flex items-center gap-1.5 btn-gold !px-4 !py-2 text-sm"
              >
                <Tag className="w-4 h-4" /> Sell / Resell
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-lg border border-fifa-blue/40 hover:bg-fifa-blue/10 transition-colors"
              >
                <User className="w-4 h-4" /> Account
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-bg-border bg-bg px-4 py-4 space-y-1">
            <form onSubmit={submit} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search team, stadium, city…"
                  className="w-full bg-surface border border-bg-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-fifa-blue"
                />
              </div>
              <button type="submit" className="px-3 rounded-xl bg-fifa-blue/20 text-fifa-blue-light">
                <Search className="w-4 h-4" />
              </button>
            </form>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-gray-200 hover:text-white rounded-lg hover:bg-white/5"
              >
                <Ticket className="w-4 h-4 text-fifa-blue-light" /> {l.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-200 hover:text-white rounded-lg hover:bg-white/5"
            >
              <User className="w-4 h-4 text-fifa-blue-light" /> My Account
            </Link>
            <Link
              href="/sell"
              onClick={() => setMobileOpen(false)}
              className="btn-gold w-full mt-2 flex items-center justify-center gap-2 text-sm"
            >
              <Tag className="w-4 h-4" /> Sell / Resell Tickets
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
