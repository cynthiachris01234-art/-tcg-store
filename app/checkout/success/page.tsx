import Link from 'next/link';
import { CheckCircle2, ArrowRight, Clock, Phone } from 'lucide-react';
import { MELIO_PAY_URL } from '@/lib/payments';
import { CopyValue } from '@/components/ui/CopyValue';
import { StripeConfirm } from '@/components/checkout/StripeConfirm';
import { PayPalConfirm } from '@/components/checkout/PayPalConfirm';
import { WhatsAppConfirm } from '@/components/checkout/WhatsAppConfirm';

export const metadata = { title: 'Order Confirmed — Apex TCG' };

const METHOD_LABELS: Record<string, { icon: string; label: string; detail: string; isPaid?: boolean }> = {
  card:     { icon: '💳', label: 'Credit / Debit Card', detail: 'Payment confirmed — your order is being processed', isPaid: true },
  kkiapay:  { icon: '💳', label: 'Card / Mobile Money', detail: 'Paid securely through Kkiapay', isPaid: true },
  telegram: { icon: '✈️', label: 'Telegram',             detail: 'Message us on Telegram to complete your payment' },
  stripe:   { icon: '💳', label: 'Card / Apple Pay / Google Pay', detail: 'Paid securely through Stripe', isPaid: true },
  melio:    { icon: '💳', label: 'Melio',                detail: 'Finish your payment on Melio using the button below' },
  wise:     { icon: '🌍', label: 'Wise Transfer',        detail: 'We\'ll send our Wise account details' },
  applepay: { icon: '🍎', label: 'Apple Pay',            detail: 'We\'ll send you an Apple Pay payment request' },
  cashapp:  { icon: '💵', label: 'Cash App',             detail: 'We\'ll send you our $Cashtag' },
  paypal:   { icon: '🅿️', label: 'PayPal',              detail: 'Paid securely through PayPal', isPaid: true },
};

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; method?: string; amt?: string; session_id?: string; token?: string };
}) {
  const method = searchParams.method ?? 'wise';
  const info   = METHOD_LABELS[method] ?? METHOD_LABELS.wise;
  const isPaid = info.isPaid ?? false;
  const isMelio = method === 'melio';
  const isTelegram = method === 'telegram';
  const isWhatsApp = ['wise', 'venmo', 'applepay'].includes(method);
  const telegramUrl = `https://t.me/apextcgshop?text=${encodeURIComponent(
    `Hi Apex TCG! I just placed order ${searchParams.order ?? ''}${searchParams.amt ? ` ($${searchParams.amt})` : ''} on apextcg.shop. How can I pay?`)}`;
  const amount = searchParams.amt;

  const nextSteps = isWhatsApp
    ? [
        { n: '1', text: 'Tap “Confirm my order on WhatsApp” — your order is already typed in' },
        { n: '2', text: `We reply with our ${info.label} payment details` },
        { n: '3', text: 'Once paid, we ship within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ]
    : isTelegram
    ? [
        { n: '1', text: 'Tap “Message us on Telegram” below — your order number is already typed in' },
        { n: '2', text: 'We reply with payment details and confirm your order' },
        { n: '3', text: 'Once paid, we ship within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ]
    : isMelio
    ? [
        { n: '1', text: 'Tap “Pay on Melio” below to open the secure payment page' },
        { n: '2', text: `Enter the amount${amount ? ` $${amount}` : ''} and your order ID as the reference` },
        { n: '3', text: 'We confirm your payment and ship within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ]
    : isPaid
    ? [
        { n: '1', text: 'Your payment was captured — order is confirmed' },
        { n: '2', text: 'We verify stock and prepare your shipment' },
        { n: '3', text: 'Your order ships within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ]
    : [
        { n: '1', text: 'We receive your order and verify stock' },
        { n: '2', text: `We send your ${info.label} payment details via SMS, WhatsApp or email` },
        { n: '3', text: 'You complete payment — we ship within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ];

  return (
    <div className="max-w-xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isPaid ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
          <CheckCircle2 className={`w-10 h-10 ${isPaid ? 'text-green-400' : 'text-green-400'}`} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          {isPaid ? 'Payment Successful!' : 'Order Placed!'}
        </h1>
        <p className="text-muted text-base">
          {isPaid ? 'Your card was charged and your order is confirmed.' : 'Your order is confirmed and reserved for you.'}
        </p>
        {searchParams.order && (
          <p className="text-muted text-sm mt-2">
            Order ID: <span className="text-accent font-mono font-bold text-base">{searchParams.order}</span>
          </p>
        )}
      </div>

      {/* Stripe — verify the payment and record the order */}
      {method === 'paypal' && searchParams.order && searchParams.token && (
        <PayPalConfirm orderId={searchParams.order} token={searchParams.token} />
      )}

      {method === 'stripe' && searchParams.order && searchParams.session_id && (
        <StripeConfirm orderId={searchParams.order} sessionId={searchParams.session_id} />
      )}

      {/* WhatsApp — confirm the order and get payment details */}
      {isWhatsApp && searchParams.order && (
        <WhatsAppConfirm orderId={searchParams.order} method={method} amount={amount} />
      )}

      {/* Telegram — finish the order in chat */}
      {isTelegram && (
        <div className="card p-5 mb-4 border-[#229ED9]/50 bg-[#229ED9]/5">
          <p className="text-white font-bold text-lg mb-1">One last step — message us on Telegram</p>
          <p className="text-muted text-sm mb-4">
            Your order is reserved. Send us the message below and we&apos;ll reply with payment details.
            {amount && <> Total: <strong className="text-white">${amount}</strong>.</>}
          </p>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-[#229ED9] hover:brightness-110 transition">
            ✈️ Message us on Telegram
          </a>
          <p className="text-muted text-xs mt-3">
            Don&apos;t have Telegram? WhatsApp us at <a href="https://wa.me/13322728148" className="text-accent hover:underline">+1 (332) 272-8148</a> with
            your order number <strong className="text-white">{searchParams.order}</strong>.
          </p>
        </div>
      )}

      {/* Melio — complete payment */}
      {isMelio && (
        <div className="card p-5 mb-4 border-accent/50 bg-accent/5">
          <p className="text-white font-bold text-lg mb-1">One last step — pay on Melio</p>
          <p className="text-muted text-sm mb-4">
            Your order is reserved. Complete payment to confirm it.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <CopyValue label="Amount to pay" value={amount ?? '—'} big />
            <CopyValue label="Reference (Invoice #)" value={searchParams.order ?? '—'} />
          </div>
          <a href={MELIO_PAY_URL} target="_blank" rel="noopener noreferrer"
            className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base font-bold">
            Pay on Melio <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-muted text-xs mt-3">
            Enter the amount above and use your order ID as the payment reference so we can match it to your order.
          </p>
        </div>
      )}

      {/* Payment status */}
      <div className={`card p-5 mb-4 ${isPaid ? 'border-green-500/40 bg-green-500/5' : 'border-accent/40 bg-accent/5'}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <p className="text-white font-bold">
              {isPaid ? `Paid via ${info.label}` : `Pay via ${info.label}`}
            </p>
            <p className="text-muted text-xs">{info.detail}</p>
          </div>
        </div>
        {!isPaid && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            We will contact you within 2 hours with payment details
          </div>
        )}
        {isPaid && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Payment captured — order is processing
          </div>
        )}
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a href="tel:+13322728148"
          className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-all group">
          <Phone className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-white text-xs font-semibold text-center">Call / SMS</span>
          <span className="text-muted text-[10px] text-center">+1 332-272-8148</span>
        </a>
        <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
          className="card p-4 flex flex-col items-center gap-2 hover:border-green-400/50 transition-all group">
          <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
          <span className="text-white text-xs font-semibold">WhatsApp</span>
          <span className="text-muted text-[10px]">+1 332-272-8148</span>
        </a>
        <a href="mailto:apextradingcardshop@gmail.com"
          className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-all group">
          <span className="text-2xl group-hover:scale-110 transition-transform">📧</span>
          <span className="text-white text-xs font-semibold">Email</span>
          <span className="text-muted text-[10px] text-center">apextradingcardshop@gmail.com</span>
        </a>
      </div>

      {/* What's next */}
      <div className="card p-5 mb-6 space-y-3 text-sm">
        <p className="text-white font-bold">What happens next?</p>
        {nextSteps.map(({ n, text }) => (
          <div key={n} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
            <span className="text-muted leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop" className="btn-primary flex items-center justify-center gap-2">
          Keep Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/" className="btn-outline flex items-center justify-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
