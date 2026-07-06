'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Eye, Users, Globe, TrendingUp, Radio, ShoppingBag, DollarSign } from 'lucide-react';
import type { StoredOrder } from '@/lib/orders';

interface TrafficData {
  days: number;
  totalViews: number;
  uniqueIps: number;
  currentBrowsers: number;
  topCountries: { country: string; views: number }[];
  topPages: { page: string; views: number }[];
  dailyViews: { date: string; views: number }[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US:'United States',CA:'Canada',GB:'United Kingdom',AU:'Australia',DE:'Germany',
  FR:'France',JP:'Japan',KR:'South Korea',MX:'Mexico',BR:'Brazil',IN:'India',
  SG:'Singapore',NL:'Netherlands',PH:'Philippines',NG:'Nigeria',ZA:'South Africa',
  AE:'UAE',MY:'Malaysia',TH:'Thailand',HK:'Hong Kong',TW:'Taiwan',
};

function flag(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

const PAY_LABELS: Record<string, string> = {
  wise: 'Wise', applepay: 'Apple Pay',
  cashapp: 'Cash App', paypal: 'PayPal', bank: 'Bank Transfer',
  btc: 'Bitcoin (BTC)', usdt: 'USDT (Tether)',
};

export default function AnalyticsPage() {
  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [orders, setOrders]   = useState<StoredOrder[]>([]);

  async function load(d = days) {
    setLoading(true);
    setError('');
    try {
      const [trafficRes, ordersRes] = await Promise.all([
        fetch(`/api/track?days=${d}`),
        fetch('/api/orders'),
      ]);
      const json = await trafficRes.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      const ordersJson = await ordersRes.json();
      if (Array.isArray(ordersJson.orders)) {
        setOrders(ordersJson.orders.map((o: any) => ({
          id:            o.id,
          createdAt:     o.created_at,
          status:        o.status ?? 'awaiting_payment',
          paymentMethod: o.payment_method ?? o.paymentMethod ?? '',
          customer:      o.customer,
          items:         o.items ?? [],
          subtotal:      o.subtotal_usd ?? 0,
          discount:      o.discount_usd ?? 0,
          total:         o.total_usd ?? 0,
        })));
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Order stats
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const payBreakdown = orders.reduce<Record<string, { count: number; revenue: number }>>((acc, o) => {
    const key = o.paymentMethod || 'unknown';
    if (!acc[key]) acc[key] = { count: 0, revenue: 0 };
    acc[key].count++;
    acc[key].revenue += o.total;
    return acc;
  }, {});
  const payEntries = Object.entries(payBreakdown).sort((a, b) => b[1].revenue - a[1].revenue);

  const maxDaily   = data ? Math.max(...data.dailyViews.map(d => d.views), 1) : 1;
  const maxCountry = data ? Math.max(...data.topCountries.map(c => c.views), 1) : 1;
  const maxPage    = data ? Math.max(...data.topPages.map(p => p.views), 1) : 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-muted text-sm mt-1">Who's visiting your store</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-bg-card border border-bg-border rounded-xl p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => { setDays(d); load(d); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-accent text-black' : 'text-muted hover:text-white'}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={() => load()}
            className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-5 border border-yellow-500/20 bg-yellow-500/5 mb-6">
          <p className="text-yellow-300 text-sm font-bold mb-2">📋 One-time setup required</p>
          <p className="text-muted text-sm mb-3">
            Go to <strong className="text-white">Supabase → SQL Editor</strong> and run this once to enable visitor tracking:
          </p>
          <pre className="bg-black/50 rounded-xl p-4 text-xs text-green-400 overflow-x-auto leading-relaxed">{`CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL   PRIMARY KEY,
  ts         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page       TEXT        NOT NULL,
  country    CHAR(2),
  city       TEXT,
  ip         TEXT
);
CREATE INDEX IF NOT EXISTS idx_pv_ts      ON page_views (ts DESC);
CREATE INDEX IF NOT EXISTS idx_pv_country ON page_views (country);
CREATE INDEX IF NOT EXISTS idx_pv_page    ON page_views (page);`}</pre>
          <p className="text-muted text-xs mt-3">After running the SQL, visit a few pages on your site and come back — data will appear within minutes.</p>
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-24 text-muted">Loading…</div>
      )}

      {/* ── Orders Summary ── */}
      <div className="space-y-4 mb-8">
        <h2 className="text-white font-semibold text-lg">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <ShoppingBag className="w-5 h-5 text-accent mb-3" />
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-muted text-xs mt-1">Total Orders</p>
          </div>
          <div className="card p-5">
            <DollarSign className="w-5 h-5 text-accent mb-3" />
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            <p className="text-muted text-xs mt-1">Total Revenue</p>
          </div>
          <div className="card p-5 col-span-2 sm:col-span-1">
            <p className="text-white font-semibold text-sm mb-3">By Payment Method</p>
            {payEntries.length === 0 ? (
              <p className="text-muted text-sm">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {payEntries.map(([method, { count, revenue }]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-white">{PAY_LABELS[method] ?? method}</span>
                    <span className="text-muted text-xs">{count} order{count !== 1 ? 's' : ''} · <span className="text-accent font-semibold">${revenue.toFixed(2)}</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {data && (
        <div className="space-y-6">

          {/* Live now banner */}
          <div className="card p-4 border border-green-500/30 bg-green-500/5 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <Radio className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">
                {data.currentBrowsers ?? 0}
                <span className="text-green-400 text-sm font-normal ml-2">on site right now</span>
              </p>
              <p className="text-muted text-xs mt-0.5">Active browsers in the last 5 minutes · refreshes every 30s</p>
            </div>
          </div>

          {/* Top 4 numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Eye,       label: 'Page Views',      value: data.totalViews.toLocaleString() },
              { icon: Users,     label: 'Unique Visitors', value: data.uniqueIps.toLocaleString() },
              { icon: Globe,     label: 'Countries',       value: data.topCountries.length },
              { icon: TrendingUp,label: 'Top Page',        value: data.topPages[0]?.page ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-5">
                <Icon className="w-5 h-5 text-accent mb-3" />
                <p className="text-2xl font-bold text-white truncate">{value}</p>
                <p className="text-muted text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div className="card p-5">
            <p className="text-white font-semibold mb-4">Daily Views — Last {days} Days</p>
            <div className="flex items-end gap-px h-24">
              {data.dailyViews.map(({ date, views }) => (
                <div key={date} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-accent/40 hover:bg-accent rounded-sm transition-colors cursor-default"
                    style={{ height: `${Math.max((views / maxDaily) * 88, 2)}px` }}
                  />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-bg-card border border-bg-border rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                    {date}: {views}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Top countries */}
            <div className="card p-5">
              <p className="text-white font-semibold mb-4">Top Countries</p>
              <div className="space-y-3">
                {data.topCountries.slice(0, 8).map(({ country, views }) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-lg w-6">{flag(country)}</span>
                    <span className="text-sm text-white flex-1 truncate">
                      {COUNTRY_NAMES[country] ?? country}
                    </span>
                    <span className="text-muted text-sm font-semibold">{views}</span>
                  </div>
                ))}
                {data.topCountries.length === 0 && (
                  <p className="text-muted text-sm">No data yet</p>
                )}
              </div>
            </div>

            {/* Top pages */}
            <div className="card p-5">
              <p className="text-white font-semibold mb-4">Top Pages</p>
              <div className="space-y-3">
                {data.topPages.slice(0, 8).map(({ page, views }) => (
                  <div key={page} className="flex items-center gap-3">
                    <span className="text-sm text-white font-mono flex-1 truncate">{page}</span>
                    <div className="w-16 bg-bg-border rounded-full h-1.5 flex-shrink-0">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(views / maxPage) * 100}%` }} />
                    </div>
                    <span className="text-muted text-sm font-semibold w-6 text-right">{views}</span>
                  </div>
                ))}
                {data.topPages.length === 0 && (
                  <p className="text-muted text-sm">No data yet</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
