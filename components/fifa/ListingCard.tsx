'use client';

import { useState } from 'react';
import { X, ShieldCheck, Lock, Ticket, ChevronRight } from 'lucide-react';
import type { Listing, Match } from '@/lib/fifa/types';
import { formatPrice } from '@/lib/fifa/format';
import { SECTION_BY_CATEGORY } from '@/lib/fifa/listings';
import {
  InstantDeliveryBadge, MobileTicketBadge, TagBadge, SellerRating, CategoryDot,
} from './Badges';
import { QRTicket } from './QRTicket';

export function ListingCard({ listing, match }: { listing: Listing; match: Match }) {
  const [open, setOpen] = useState(false);
  const sec = SECTION_BY_CATEGORY[listing.category];

  return (
    <>
      <div className="card hover:border-fifa-blue/40 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Section info */}
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

        {/* Price + CTA */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1 border-t sm:border-t-0 border-bg-border pt-3 sm:pt-0">
          <div className="text-right">
            <div className="font-extrabold text-fifa-gold text-xl leading-none">{formatPrice(listing.pricePerTicket)}</div>
            <div className="text-[11px] text-muted mt-0.5">/ ticket · {listing.ticketsRemaining} left</div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="btn-primary !px-4 !py-2 text-sm flex items-center gap-1 whitespace-nowrap"
          >
            View <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card-blue p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white pr-8">Secure Checkout</h3>
            <p className="text-xs text-muted mt-0.5">{sec?.blurb}</p>

            <div className="mt-4">
              <QRTicket listing={listing} match={match} />
            </div>

            {/* Order summary */}
            <div className="mt-5 space-y-2 text-sm">
              <Row label={`${listing.category} · Sec ${listing.sectionCode}, Row ${listing.row}`} value={formatPrice(listing.pricePerTicket)} />
              <Row label="Quantity" value={`${listing.quantity} ticket${listing.quantity > 1 ? 's' : ''}`} />
              <Row label="Service fee" value={formatPrice(Math.round(listing.pricePerTicket * listing.quantity * 0.15))} muted />
              <div className="border-t border-bg-border my-2" />
              <Row
                label="Total"
                value={formatPrice(Math.round(listing.pricePerTicket * listing.quantity * 1.15))}
                bold
              />
            </div>

            <button className="btn-gold w-full mt-4 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Pay Securely · {formatPrice(Math.round(listing.pricePerTicket * listing.quantity * 1.15))}
            </button>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-fifa-green" /> Buyer Guarantee</span>
              <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-fifa-blue-light" /> Instant transfer</span>
            </div>
            <p className="mt-3 text-[10px] text-center text-muted/70">
              Demo only — no payment is processed and no real ticket is issued.
            </p>
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
