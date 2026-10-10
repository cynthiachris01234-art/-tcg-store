'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Wallet } from 'lucide-react';
import { FaPaypal } from 'react-icons/fa6';

interface Txn {
  id: string; date: string; type: string; code: string; status: string;
  amount: number; fee: number; net: number; currency: string;
  orderId: string | null; fromApex: boolean;
  payerName: string | null; payerEmail: string | null; note: string | null;
  justIn?: boolean;
  previousAccount?: boolean;
}
interface Data {
  configured: boolean;
  reportingAvailable?: boolean;
  reportingError?: string;
  merchantId?: string;
  transactions: Txn[];
  balances: { currency: string; available: number; withheld: number; total: number }[];
  meta?: { received: number; fees: number; count: number; apexCount: number; apexReceived: number; refunds: number };
  error?: string;
}

const fmt = (n: number, cur = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n);
const when = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusPill({ s }: { s: string }) {
  const c = s === 'Completed' ? 'bg-green-500/15 text-green-400'
    : s === 'Pending' ? 'bg-yellow-500/15 text-yellow-300'
    : 'bg-red-500/15 text-red-400';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${c}`}>{s}</span>;
}

export function PayPalPayments() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyApex, setOnlyApex] = useState(false);

  async function load(d = days) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/paypal?days=${d}`);
      setData(await res.json());
    } catch {
      setData({ configured: true, transactions: [], balances: [], error: 'Could not load PayPal payments' });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (data?.configured === false) return null;
  const rows = (data?.transactions ?? []).filter(t => !onlyApex || t.fromApex);
  const usd = data?.balances.find(b => b.currency === 'USD');

  return (
    <section className="card p-5 mb-8 border-[#003087]/50">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <FaPaypal className="w-5 h-5 text-[#3b7bbf]" /> PayPal account
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <select value={days} onChange={e => { const d = Number(e.target.value); setDays(d); load(d); }}
            className="bg-bg border border-bg-border rounded-lg px-2 py-1.5 text-white">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={() => load()} className="btn-outline px-3 py-1.5 flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {data?.error && <p className="text-red-400 text-sm mb-3">{data.error}</p>}
      {data && data.reportingAvailable === false && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 mb-4 text-xs text-muted">
          <p className="text-yellow-300 font-semibold mb-1">PayPal isn&apos;t sharing this account&apos;s balance and full history</p>
          Showing your apextcg.shop orders paid through PayPal (from your own order records). To see the balance, fees,
          withdrawals and every transaction here, the PayPal account owner must open{' '}
          <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">developer.paypal.com → Apps &amp; Credentials</a>,
          open this app, and tick <strong className="text-white">Transaction search</strong> under Features.
          {data.reportingError && <p className="mt-1 font-mono text-[10px] text-muted/80">PayPal said: {data.reportingError}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'PayPal balance', value: usd ? fmt(usd.available) : data?.reportingAvailable === false ? 'Not shared' : '—', sub: usd && usd.withheld > 0 ? `${fmt(usd.withheld)} on hold` : usd ? 'available now' : 'see paypal.com' },
          { label: `Received (${days}d)`, value: fmt(data?.meta?.received ?? 0), sub: `${data?.meta?.count ?? 0} payments` },
          { label: 'From apextcg.shop', value: fmt(data?.meta?.apexReceived ?? 0), sub: `${data?.meta?.apexCount ?? 0} orders` },
          { label: 'PayPal fees', value: fmt(Math.abs(data?.meta?.fees ?? 0)), sub: data?.meta?.refunds ? `${fmt(Math.abs(data.meta.refunds))} refunded` : 'no refunds' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-bg border border-bg-border p-3">
            <p className="text-muted text-xs">{s.label}</p>
            <p className="text-white font-bold text-lg">{s.value}</p>
            <p className="text-muted text-[11px]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-muted text-xs flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onlyApex} onChange={e => setOnlyApex(e.target.checked)} />
          Only apextcg.shop orders
        </label>
        <p className="text-muted text-[11px] flex items-center gap-1"><Wallet className="w-3 h-3" /> PayPal can take up to 3 hours to list new payments here</p>
      </div>

      {loading && !data ? (
        <p className="text-muted text-sm py-6 text-center">Loading PayPal payments…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">No PayPal transactions in this period.</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-muted text-xs text-left border-b border-bg-border">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Customer</th>
                <th className="py-2 pr-3 font-medium">Order</th>
                <th className="py-2 pr-3 font-medium text-right">Amount</th>
                <th className="py-2 pr-3 font-medium text-right">Fee</th>
                <th className="py-2 pr-3 font-medium text-right">Net</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id} className="border-b border-bg-border/50">
                  <td className="py-2 pr-3 text-muted whitespace-nowrap">{when(t.date)}</td>
                  <td className="py-2 pr-3 text-white">{t.type}</td>
                  <td className="py-2 pr-3">
                    <p className="text-white truncate max-w-[180px]">{t.payerName || '—'}</p>
                    {t.payerEmail && <p className="text-muted text-xs truncate max-w-[180px]">{t.payerEmail}</p>}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{t.orderId ? <span className="text-accent">{t.orderId}</span> : <span className="text-muted">—</span>}</td>
                  <td className={`py-2 pr-3 text-right font-semibold ${t.amount < 0 ? 'text-red-400' : 'text-white'}`}>{fmt(t.amount, t.currency)}</td>
                  <td className="py-2 pr-3 text-right text-muted">{t.justIn ? '…' : t.fee ? fmt(t.fee, t.currency) : '—'}</td>
                  <td className="py-2 pr-3 text-right text-white">{fmt(t.net, t.currency)}</td>
                  <td className="py-2 pr-3">
                    <StatusPill s={t.status} />
                    {t.justIn && <p className="text-[10px] text-accent mt-0.5">Just in · fee pending</p>}
                    {t.previousAccount && <p className="text-[10px] text-muted mt-0.5">Previous PayPal account</p>}
                  </td>
                  <td className="py-2">
                    {t.id && !t.id.startsWith('APX-') && (
                    <a href={`https://www.paypal.com/activity/payment/${t.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-muted hover:text-accent" title="Open in PayPal">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
