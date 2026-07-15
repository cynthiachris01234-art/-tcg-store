'use client';

import { useState } from 'react';
import { X, ShieldCheck, Lock, Ticket, ChevronRight, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { FaPaypal, FaApplePay, FaGooglePay, FaBitcoin } from 'react-icons/fa';
import { SiCashapp } from 'react-icons/si';
import type { IconType } from 'react-icons';
import type { Listing, Match } from '@/lib/fifa/types';
import type { GatewayId } from '@/lib/payments/gateways';
import { GATEWAYS } from '@/lib/payments/gateways';
import { formatPrice } from '@/lib/fifa/format';
import { SECTION_BY_CATEGORY } from '@/lib/fifa/listings';
import {
  InstantDeliveryBadge, MobileTicketBadge, TagBadge, SellerRating, CategoryDot,
} from './Badges';
import { QRTicket } from './QRTicket';

const GATEWAY_ICON: Record<GatewayId, IconType> = {
  card: CreditCard as unknown as IconType,
  paypal: FaPaypal,
  applepay: FaApplePay,
  googlepay: FaGooglePay,
  cashapp: SiCashapp,
  crypto: FaBitcoin,
};

export function ListingCard({ listing, match }: { listing: Listing; match: Match }) {
  const [open, setOpen] = useState(false);
  const [gateway, setGateway] = useState<GatewayId>('card');
  const [phase, setPhase] = useState<'review' | 'processing' | 'done'>('review');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const sec = SECTION_BY_CATEGORY[listing.category];

  const subtotal = listing.pricePerTicket * listing.quantity;
  const fee = Math.round(subtotal * 0.15);
  const total = subtotal + fee;

  function close() {
    setOpen(false);
    // reset for next open
    setTimeout(() => { setPhase('review'); setError(''); setReference(''); }, 200);
  }

  async function pay() {
    setPhase('processing');
    setError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway,
          amount: total,
          currency: 'usd',
          description: `${listing.category} · ${match.home.code} vs ${match.away.code} · Sec ${listing.sectionCode}`,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Payment failed');
      // Live redirect gateways (PayPal / crypto) hand off to a hosted page.
      if (data.approveUrl || data.hostedUrl) {
        window.open(data.approveUrl || data.hostedUrl, '_blank', 'noopener');
      }
      setReference(data.reference || 'WC26-DEMO');
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
      setPhase('review');
    }
  }

  return (
    <>
      <div className="card hover:border-fifa-blue/40 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryDot category={listing.category} />
            <span className="font-bold text-white">{listing.category}</span>
            {listing.tag && <TagBadge tag={listing.tag} />}
          </div>
          <div className="mt-1.5 text-sm text-muted">
            Sec <span className="text-gray-200 font-semibold">{listing.sectionCode}</span>
            {' · '}Row <span className="text-gray-200 font-semibold">{listing.row}</span>
            {' · '}Seats <span className="text-gray-200 font-semibold">{listing.seatStart}–{listing.seatStart + listing.quantity - 1}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {listing.instantDelivery && <InstantDeliveryBadge />}
            {listing.mobileTicket && <MobileTicketBadge />}
            <SellerRating rating={listing.sellerRating} reviews={listing.sellerReviews} />
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1 border-t sm:border-t-0 border-bg-border pt-3 sm:pt-0">
          <div className="text-right">
            <div className="font-extrabold text-fifa-gold text-xl leading-none">{formatPrice(listing.pricePerTicket)}</div>
            <div className="text-[11px] text-muted mt-0.5">/ ticket · {listing.ticketsRemaining} left</div>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-1 whitespace-nowrap">
            View <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={close}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card-blue p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            {phase === 'done' ? (
              /* ── Confirmation ── */
              <div className="text-center py-4">
                <CheckCircle2 className="w-16 h-16 text-fifa-green mx-auto" />
                <h3 className="mt-4 text-2xl font-extrabold text-white">Payment confirmed! 🎉</h3>
                <p className="mt-1 text-sm text-muted">
                  Your {listing.quantity} ticket{listing.quantity > 1 ? 's have' : ' has'} been secured and transferred to your account.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 pill text-fifa-green border-fifa-green/30 bg-fifa-green/10">
                  <Lock className="w-3.5 h-3.5" /> Ref {reference}
                </div>
                <div className="mt-5">
                  <QRTicket listing={listing} match={match} />
                </div>
                <button onClick={close} className="btn-outline w-full mt-4">Done</button>
                <p className="mt-3 text-[10px] text-muted/70">Demo only — no real payment was processed and no real ticket issued.</p>
              </div>
            ) : (
              /* ── Checkout ── */
              <>
                <h3 className="text-lg font-extrabold text-white pr-8">Secure Checkout</h3>
                <p className="text-xs text-muted mt-0.5">{sec?.blurb}</p>

                <div className="mt-4">
                  <QRTicket listing={listing} match={match} />
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <Row label={`${listing.category} · Sec ${listing.sectionCode}, Row ${listing.row}`} value={formatPrice(listing.pricePerTicket)} />
                  <Row label="Quantity" value={`${listing.quantity} ticket${listing.quantity > 1 ? 's' : ''}`} />
                  <Row label="Service fee" value={formatPrice(fee)} muted />
                  <div className="border-t border-bg-border my-2" />
                  <Row label="Total" value={formatPrice(total)} bold />
                </div>

                {/* Payment gateways */}
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wide text-muted mb-2">Payment method</div>
                  <div className="grid grid-cols-3 gap-2">
                    {GATEWAYS.map((g) => {
                      const Icon = GATEWAY_ICON[g.id];
                      const active = gateway === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGateway(g.id)}
                          title={`${g.name} · via ${g.provider}`}
                          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors ${
                            active ? 'border-fifa-gold bg-fifa-gold/10' : 'border-bg-border bg-surface hover:border-fifa-blue/40'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${active ? 'text-fifa-gold' : 'text-gray-300'}`} />
                          <span className="text-[10px] leading-tight text-gray-300">{g.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <p className="mt-3 text-xs text-danger">{error}</p>}

                <button onClick={pay} disabled={phase === 'processing'} className="btn-gold w-full mt-4 flex items-center justify-center gap-2">
                  {phase === 'processing' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Pay {formatPrice(total)}</>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-fifa-green" /> Buyer Guarantee</span>
                  <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-fifa-blue-light" /> Instant transfer</span>
                </div>
                <p className="mt-3 text-[10px] text-center text-muted/70">
                  Demo only — no payment is processed unless live gateway keys are configured.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`${muted ? 'text-muted' : 'text-gray-300'} ${bold ? 'font-bold text-white' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-extrabold text-fifa-gold text-lg' : muted ? 'text-muted' : 'text-white font-semibold'}`}>{value}</span>
    </div>
  );
}
