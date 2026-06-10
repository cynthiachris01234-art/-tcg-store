'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard, RefreshCw, ArrowLeft, CheckCircle2,
  XCircle, Clock, ExternalLink, TrendingUp, DollarSign,
  AlertTriangle, ReceiptText,
} from 'lucide-react';

interface Payment {
  id: string;
  orderId: string | null;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  receiptUrl: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardCountry: string | null;
  billingName: string | null;
  billingEmail: string | null;
  riskScore: number | null;
  riskLevel: string | null;
  refunded: boolean;
  amountRefunded: number;
}

interface Meta {
  total: number;
  succeeded: number;
  failed: number;
  pending: number;
  totalRevenue: number;
  totalRefunded: number;
}

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'succeeded')
    return <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Paid</span>;
  if (status === 'processing' || status === 'requires_action' || status === 'requires_confirmation')
    return <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
  if (status === 'canceled' || status === 'requires_payment_method')
    return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs flex items-center gap-1"><XCircle className="w-3 h-3" />Failed</span>;
  return <span className="badge bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs">{status}</span>;
}

function CardIcon({ brand }: { brand: string | null }) {
  const icons: Record<string, string> = {
    visa: '💳', mastercard: '💳', amex: '💳',
    discover: '💳', jcb: '💳', unionpay: '💳',
  };
  return <span>{icons[brand?.toLowerCase() ?? ''] ?? '💳'}</span>;
}

function RiskBadge({ level, score }: { level: string | null; score: number | null }) {
  if (!level) return null;
  const color =
    level === 'normal' ? 'text-green-400 bg-green-500/10' :
    level === 'elevated' ? 'text-yellow-400 bg-yellow-500/10' :
    'text-red-400 bg-red-500/10';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
      {level}{score != null ? ` (${score})` : ''}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(50);

  async function load(lim = limit) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/payments?limit=${lim}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPayments(data.payments ?? []);
      setMeta(data.meta ?? null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Stripe Payments</h1>
            <p className="text-muted text-sm mt-0.5">Live card payment transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-card border border-bg-border rounded-xl p-1">
            {[25, 50, 100].map(n => (
              <button key={n} onClick={() => { setLimit(n); load(n); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${limit === n ? 'bg-accent text-black' : 'text-muted hover:text-white'}`}>
                {n}
              </button>
            ))}
          </div>
          <button onClick={() => load()} className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total',      value: meta.total,                              color: '#C8962A', icon: ReceiptText },
            { label: 'Paid',       value: meta.succeeded,                          color: '#22C55E', icon: CheckCircle2 },
            { label: 'Pending',    value: meta.pending,                            color: '#EAB308', icon: Clock },
            { label: 'Failed',     value: meta.failed,                             color: '#EF4444', icon: XCircle },
            { label: 'Revenue',    value: usd(meta.totalRevenue),                  color: '#3B82F6', icon: TrendingUp },
            { label: 'Refunded',   value: usd(meta.totalRefunded),                 color: '#A855F7', icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-white font-bold text-lg leading-tight">{value}</p>
              <p className="text-muted text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-24 text-muted">Loading payments…</div>
      ) : payments.length === 0 && !error ? (
        <div className="text-center py-24">
          <CreditCard className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
          <p className="text-white text-lg font-semibold mb-2">No payments yet</p>
          <p className="text-muted text-sm">Card payments will appear here once customers check out with Stripe.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-bg-border bg-bg/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID / Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Card</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* ID / Order */}
                    <td className="px-4 py-3">
                      <p className="text-white font-mono text-xs">{p.id.slice(3, 15)}…</p>
                      {p.orderId && (
                        <p className="text-accent text-xs font-semibold font-mono mt-0.5">{p.orderId}</p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {formatDate(p.created)}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      {p.billingName || p.billingEmail ? (
                        <>
                          {p.billingName && <p className="text-white text-xs font-medium">{p.billingName}</p>}
                          {p.billingEmail && <p className="text-muted text-xs">{p.billingEmail}</p>}
                        </>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Card */}
                    <td className="px-4 py-3">
                      {p.cardLast4 ? (
                        <div className="flex items-center gap-1.5">
                          <CardIcon brand={p.cardBrand} />
                          <span className="text-white text-xs capitalize">{p.cardBrand ?? 'Card'}</span>
                          <span className="text-muted text-xs">••{p.cardLast4}</span>
                          {p.cardCountry && <span className="text-muted text-[10px]">({p.cardCountry})</span>}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                      {p.refunded && p.amountRefunded > 0 && (
                        <p className="text-purple-400 text-[10px] mt-0.5">Refunded {usd(p.amountRefunded)}</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-white font-bold">{usd(p.amount)}</p>
                      <p className="text-muted text-[10px] uppercase">{p.currency}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Risk */}
                    <td className="px-4 py-3">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {p.receiptUrl && (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors inline-flex"
                          title="View receipt">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payments.length > 0 && (
            <div className="px-4 py-3 border-t border-bg-border text-xs text-muted">
              Showing {payments.length} most recent payment{payments.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
