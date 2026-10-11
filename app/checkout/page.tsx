'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Lock, ArrowLeft, CheckCircle2, CreditCard, Truck, ShieldCheck, Landmark, Wallet } from 'lucide-react';
import { SiWise, SiCashapp, SiVenmo } from 'react-icons/si';
import { FaApplePay, FaPaypal, FaTelegram } from 'react-icons/fa6';
import Link from 'next/link';
import type { ProductType } from '@/types';
import { computeShipping, FREE_SHIPPING_THRESHOLD_USD } from '@/lib/shipping';
import { priceOf, comebackTokenExpiry, COMEBACK, meetsMinimum, minOrderMessage } from '@/lib/promos';
import { CartPromoLines } from '@/components/promo/LivePromo';

function typeLabel(t: ProductType): string {
  const map: Record<string, string> = {
    case: 'Case', etb: 'ETB', upc: 'UPC', spc: 'SPC',
    bundle: 'Bundle', premium_collection: 'PC',
    display_case: 'Display', poster_collection: 'Poster',
    booster_box: 'Booster Box',
  };
  return map[t] ?? 'Product';
}

interface PaymentMethod {
  id: string;
  label: string;
  note: string;
  logo: React.ReactNode;
  bg: string;
  subIcons?: React.ReactNode;
}

// Kkiapay replaces Stripe as soon as its keys are configured on the server.
const KKIAPAY_METHOD: PaymentMethod = {
  id: 'kkiapay',
  label: 'Card / Mobile Money',
  note: 'Pay securely with Kkiapay — the total is filled in for you',
  logo: <CreditCard className="w-7 h-7 text-white" />,
  bg: '#0f2a1f',
};

// Kkiapay's payment window script — loaded only when the customer pays.
function loadKkiapay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).openKkiapayWidget === 'function') return resolve();
    const el = document.createElement('script');
    el.src = 'https://cdn.kkiapay.me/k.js';
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Could not load the payment window. Please try again.'));
    document.body.appendChild(el);
  });
}

const PAYPAL_METHOD: PaymentMethod = {
  id: 'paypal',
  label: 'PayPal',
  note: 'Log in to your PayPal account to pay — the total is filled in for you',
  logo: <FaPaypal className="w-7 h-7 text-white" />,
  bg: '#003087',
};

const TELEGRAM_METHOD: PaymentMethod = {
  id: 'telegram',
  label: 'Order via Telegram',
  note: 'Place your order now, then chat with us on Telegram to pay',
  logo: <FaTelegram className="w-7 h-7 text-white" />,
  bg: '#1c6fa3',
};

// Orders are placed on the site and confirmed on WhatsApp, where we send the
// payment details for the method the customer picked.
const WHATSAPP_METHODS: PaymentMethod[] = [
  {
    id: 'wise',
    label: 'Wise',
    note: 'Bank transfer via Wise — we send our details on WhatsApp',
    logo: <SiWise className="w-7 h-7 text-[#9fe870]" />,
    bg: '#163300',
  },
  {
    id: 'venmo',
    label: 'Venmo',
    note: 'Pay with Venmo — we send our Venmo on WhatsApp',
    logo: <SiVenmo className="w-7 h-7 text-white" />,
    bg: '#008CFF',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    note: 'Pay with Apple Pay / Apple Cash — we send the request on WhatsApp',
    logo: <FaApplePay className="w-9 h-9 text-white" />,
    bg: '#111111',
  },
];
const WHATSAPP_METHOD_IDS = WHATSAPP_METHODS.map(m => m.id);

const STRIPE_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    label: 'Card / Apple Pay / Google Pay',
    note: 'Pay securely with Stripe — the total is filled in for you',
    logo: <CreditCard className="w-7 h-7 text-white" />,
    bg: '#1a1740',
  },
];

interface AddressForm {
  name: string; email: string; phone: string;
  line1: string; line2: string;
  city: string; state: string;
  postal_code: string; country: string;
}

const EMPTY_FORM: AddressForm = {
  name: '', email: '', phone: '',
  line1: '', line2: '',
  city: '', state: '',
  postal_code: '', country: 'US',
};

const COUNTRIES: { code: string; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'IE', label: 'Ireland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'PL', label: 'Poland' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SG', label: 'Singapore' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'PH', label: 'Philippines' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'IN', label: 'India' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'IL', label: 'Israel' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'EG', label: 'Egypt' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colombia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'OTHER', label: 'Other country' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { format } = useCurrency();

  const [form, setForm]           = useState<AddressForm>(EMPTY_FORM);
  // Checkout is PayPal only (card / Wise / Venmo / Apple Pay are hidden).
  const [payMethod, setPayMethod] = useState('paypal');
  const PAYMENT_METHODS = [PAYPAL_METHOD];
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [whopSession, setWhopSession] = useState<{ sessionId: string; orderId: string } | null>(null);
  const [whopEnabled, setWhopEnabled] = useState(false);
  // Card orders are held here until Whop confirms payment — never sent before.
  const [pendingOrder, setPendingOrder] = useState<{ id: string; customer: any; items: any[] } | null>(null);

  // Record the order + notify the store. Server recomputes all pricing.
  async function submitOrder(o: { id: string; customer: any; items: any[] }, status: string) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: o.id, status,
        paymentMethod: payMethod,
        customer: o.customer, items: o.items,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.dbError) console.error('Order DB save error:', data.dbError);
  }

  // Shipping fee — scales with quantity, size, order value and destination.
  const shipping = useMemo(
    () => computeShipping(
      cart.items.map(i => ({ product_type: i.product.product_type, quantity: i.quantity })),
      cart.total_usd,
      form.country,
    ),
    [cart.items, cart.total_usd, form.country],
  );
  // Welcome-back free shipping (from the abandoned-checkout email link).
  const [comeback, setComeback] = useState<string | null>(null);
  useEffect(() => {
    try {
      const t = localStorage.getItem('apex-comeback');
      const exp = comebackTokenExpiry(t);
      if (t && exp && exp > Date.now()) setComeback(t);
      else if (t) localStorage.removeItem('apex-comeback');
    } catch {}
  }, []);
  // Customer pressed cancel on Stripe or PayPal. Tell the store once.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelled') !== '1') return;
    let pending: { id?: string } | null = null;
    try {
      pending = JSON.parse(localStorage.getItem('apex-pending-paypal') || 'null')
        || JSON.parse(localStorage.getItem('apex-pending-stripe') || 'null');
    } catch {}
    if (!pending?.id) return;
    fetch('/api/pay/wallet-left', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: pending.id }),
    }).catch(() => {});
  }, []);
  const shipFee = comeback ? 0 : shipping.amount;
  const grandTotal = +(cart.total_usd + shipFee).toFixed(2);

  // Melio is the only payment method — nothing to detect.

  function update(key: keyof AddressForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetsMinimum(cart.total_usd)) { setError(minOrderMessage(cart.total_usd)); return; }
    setLoading(true);
    setError('');

    try {
      const customer = {
        name: form.name, email: form.email, phone: form.phone,
        line1: form.line1, line2: form.line2 || undefined,
        city: form.city, state: form.state,
        postal_code: form.postal_code, country: form.country,
      };

      if (payMethod === 'kkiapay') {
        // Server prices the order in USD and signs a payment quote. The
        // customer only ever sees the dollar total on this site.
        const res = await fetch('/api/kkiapay/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, country: form.country }),
        });
        const q = await res.json().catch(() => ({}));
        if (!res.ok || !q.quote) throw new Error(q.error || 'Could not start payment');
        await loadKkiapay();
        const w = window as any;
        const { saveOrder } = await import('@/lib/orders');
        const order = saveOrder(q.orderId, cart, customer, 'awaiting_payment', 'kkiapay');

        const onSuccess = async (resp: any) => {
          w.removeKkiapayListener?.('success');
          setLoading(true);
          try {
            const cRes = await fetch('/api/kkiapay/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: resp?.transactionId, quote: q.quote, sig: q.sig, customer: order.customer }),
            });
            const c = await cRes.json().catch(() => ({}));
            if (!cRes.ok || !c.paid) throw new Error(c.error || 'We could not confirm your payment yet. Please contact us with your receipt.');
            clearCart();
            router.push(`/checkout/success?order=${q.orderId}&method=kkiapay`);
          } catch (err: any) {
            setError(err.message);
            setLoading(false);
          }
        };
        w.addSuccessListener?.(onSuccess);
        w.openKkiapayWidget({
          amount: q.amountXof,
          key: q.publicKey,
          sandbox: q.sandbox,
          name: form.name,
          email: form.email,
          phone: form.phone,
          partnerId: q.orderId,
          data: q.orderId,
          theme: '#c8962a',
        });
        return;
      }

      if (WHATSAPP_METHOD_IDS.includes(payMethod)) {
        // The server creates the order number, prices the order and alerts the
        // store; the customer then confirms it on WhatsApp.
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: payMethod, customer,
            items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || d.ok === false || !d.orderId) throw new Error(d.error || 'Could not place your order. Please try again.');
        const { saveOrder } = await import('@/lib/orders');
        saveOrder(d.orderId, cart, customer, 'awaiting_payment', payMethod);
        try {
          localStorage.setItem('apex-whatsapp-order', JSON.stringify({ id: d.orderId, items: d.items, total: d.totalUsd, method: payMethod }));
        } catch {}
        clearCart();
        router.push(`/checkout/success?order=${d.orderId}&method=${payMethod}&amt=${Number(d.totalUsd).toFixed(2)}`);
        return;
      }

      if (payMethod === 'telegram') {
        // Order is reserved now (awaiting payment); the customer then opens a
        // Telegram chat with the order number and total already typed in.
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const id = 'APX-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const { saveOrder } = await import('@/lib/orders');
        const order = saveOrder(id, cart, customer, 'awaiting_payment', 'telegram');
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'awaiting_payment', paymentMethod: 'telegram', customer: order.customer, items: order.items }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || d.ok === false) throw new Error(d.error || 'Could not place your order. Please try again.');
        clearCart();
        router.push(`/checkout/success?order=${id}&method=telegram&amt=${grandTotal.toFixed(2)}`);
        return;
      }

      if (payMethod === 'paypal') {
        // PayPal hosts the approval page with the exact total; the order is
        // recorded only after the payment is captured (success page).
        const res = await fetch('/api/pay/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, country: form.country, customer, comeback }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error || 'Could not start PayPal');
        const { saveOrder } = await import('@/lib/orders');
        const order = saveOrder(data.orderId, cart, customer, 'awaiting_payment', 'paypal');
        try {
          localStorage.setItem('apex-pending-paypal', JSON.stringify({
            id: order.id, customer: order.customer, items: order.items,
          }));
        } catch {}
        window.location.href = data.url;
        return;
      }

      if (payMethod === 'stripe') {
        // Card payment: Stripe hosts the payment page with the exact total.
        // The order is recorded only after Stripe confirms payment (success page).
        const res = await fetch('/api/pay/card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, country: form.country, customer, comeback }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error || 'Could not start card payment');
        const { saveOrder } = await import('@/lib/orders');
        const order = saveOrder(data.orderId, cart, customer, 'awaiting_payment', 'stripe');
        try {
          localStorage.setItem('apex-pending-stripe', JSON.stringify({
            id: order.id, customer: order.customer, items: order.items,
          }));
        } catch {}
        window.location.href = data.url;
        return;
      }

      const endpoint = payMethod === 'whop' ? '/api/whop/checkout' : '/api/checkout';
      const checkRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, paymentMethod: payMethod, country: form.country }),
      });
      if (!checkRes.ok) {
        const data = await checkRes.json().catch(() => ({}));
        throw new Error(data.error || 'Could not create order');
      }
      const { orderId, sessionId } = await checkRes.json();

      const { saveOrder } = await import('@/lib/orders');
      const order = saveOrder(orderId, cart, customer, 'awaiting_payment', payMethod);

      if (payMethod === 'whop' && sessionId) {
        // Card payments: do NOT record or notify the order yet — the customer
        // hasn't paid. Hold it until Whop reports the payment succeeded, so an
        // abandoned checkout never becomes an order.
        setPendingOrder({ id: order.id, customer: order.customer, items: order.items });
        setWhopSession({ sessionId, orderId });
        return;
      }

      // Manual methods (Wise / bank) are paid off-site, so the order is recorded
      // straight away and you follow up with payment details.
      await submitOrder({ id: order.id, customer: order.customer, items: order.items }, 'awaiting_payment');

      clearCart();
      // Pass the total so the success page can show the exact amount to pay
      // (Melio's payment page can't receive it from the URL).
      router.push(`/checkout/success?order=${orderId}&method=${payMethod}&amt=${grandTotal.toFixed(2)}`);
    } catch (err: any) {
      const msg = String(err?.message || '');
      setError(
        /failed to fetch|networkerror|load failed/i.test(msg)
          ? 'Could not reach the payment server. Pause ad blockers for apextcg.shop and try again.'
          : (msg || 'Something went wrong. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  }

  if (whopSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
          <span className="text-muted text-sm">Order {whopSession.orderId}</span>
        </div>
        <div className="card p-4 mb-6 flex justify-between text-sm">
          <span className="text-muted">Total due</span>
          <span className="text-accent font-bold">{format(grandTotal)}</span>
        </div>
        <div className="card p-2 overflow-hidden">
          <WhopCheckoutEmbed
            sessionId={whopSession.sessionId}
            theme="dark"
            onComplete={async () => {
              // Payment confirmed by Whop — only now is the order recorded and
              // the store notified.
              if (pendingOrder) {
                try { await submitOrder(pendingOrder, 'paid'); } catch {}
              }
              clearCart();
              router.push(`/checkout/success?order=${whopSession.orderId}&method=whop`);
            }}
          />
        </div>
        <button
          onClick={() => { setWhopSession(null); setPendingOrder(null); }}
          className="mt-4 text-muted hover:text-white text-sm transition-colors"
        >
          ← Choose a different payment method
        </button>
        <p className="text-muted text-xs mt-3">
          Your order is only placed once payment completes. Closing this page cancels it.
        </p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  type Field = { key: keyof AddressForm; label: string; type?: string; col?: string; required?: boolean };

  const contactFields: Field[] = [
    { key: 'name',  label: 'Full Name',        col: 'col-span-2' },
    { key: 'email', label: 'Email Address',    type: 'email', col: 'col-span-2' },
    { key: 'phone', label: 'Phone / WhatsApp', type: 'tel',   col: 'col-span-2' },
  ];

  const addressFields: Field[] = [
    { key: 'line1',       label: 'Street Address',         col: 'col-span-2' },
    { key: 'line2',       label: 'Apt / Suite (optional)', col: 'col-span-2', required: false },
    { key: 'city',        label: 'City' },
    { key: 'state',       label: 'State / Province' },
    { key: 'postal_code', label: 'Postal Code' },
    { key: 'country',     label: 'Country' },
  ];

  const inputCls =
    'w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-white text-sm ' +
    'placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 ' +
    'focus:ring-accent/20 transition-all';

  function renderField({ key, label, type = 'text', col, required }: Field) {
    return (
      <div key={key} className={col ?? ''}>
        <label className="block text-muted text-xs mb-1.5">{label}</label>
        {key === 'country' ? (
          <select value={form.country} onChange={(e) => update('country', e.target.value)} required className={inputCls}>
            {COUNTRIES.map(({ code, label: cLabel }) => (
              <option key={code} value={code}>{cLabel}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
            required={required !== false && key !== 'line2'}
            className={inputCls}
          />
        )}
      </div>
    );
  }

  const selected = PAYMENT_METHODS.find(m => m.id === payMethod)!;
  const isCard = payMethod === 'whop' || payMethod === 'stripe' || payMethod === 'kkiapay' || payMethod === 'paypal';
  // Nudge US shoppers toward the free-shipping threshold.
  const freeShipGap = form.country === 'US' && !shipping.freeApplied && !comeback
    ? +(FREE_SHIPPING_THRESHOLD_USD - cart.total_usd).toFixed(2)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="flex items-center gap-1 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Left: Shipping + Payment ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <Lock className="w-3.5 h-3.5" /> Secure
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Contact */}
            <section>
              <h2 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] flex items-center justify-center font-bold">1</span>
                Contact
              </h2>
              <div className="grid grid-cols-2 gap-4">{contactFields.map(renderField)}</div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] flex items-center justify-center font-bold">2</span>
                Delivery address
              </h2>
              <div className="grid grid-cols-2 gap-4">{addressFields.map(renderField)}</div>
            </section>

            {/* Payment method */}
            <div>
              <h2 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] flex items-center justify-center font-bold">3</span>
                Payment method
              </h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 rounded-2xl p-3.5 cursor-pointer border transition-all ${
                      payMethod === m.id
                        ? 'border-accent shadow-[0_0_0_1px_rgba(200,150,42,0.4)]'
                        : 'border-bg-border hover:border-white/25'
                    }`}
                    style={{ background: payMethod === m.id ? m.bg : 'transparent' }}
                  >
                    <input type="radio" name="payMethod" value={m.id}
                      checked={payMethod === m.id} onChange={() => setPayMethod(m.id)}
                      className="sr-only" />

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.bg || '#111' }}>
                      {m.logo}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{m.label}</p>
                      <p className="text-muted text-xs leading-tight">{m.note}</p>
                      {m.subIcons}
                    </div>

                    {payMethod === m.id
                      ? <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      : <div className="w-5 h-5 rounded-full border border-bg-border flex-shrink-0" />}
                  </label>
                ))}
              </div>
            </div>

            {/* How it works — differs for instant card vs. manual transfer */}
            <div className="card p-4 flex items-start gap-3 border-accent/25 bg-accent/5">
              <Lock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-muted text-xs leading-relaxed">
                {payMethod === 'telegram' ? (
                  <>Your order is <strong className="text-white">reserved as soon as you place it</strong>. Then tap the
                  Telegram button and we&apos;ll sort out payment with you in the chat.</>
                ) : isCard ? (
                  <>{payMethod === 'paypal' ? 'You’ll approve the payment on PayPal next.' : 'Pay securely by card on the next step.'} Your order is placed{' '}
                  <strong className="text-white">only once payment completes</strong>.</>
                ) : (
                  <>Place your order, then <strong className="text-white">confirm it on WhatsApp</strong> — your order
                  number is typed in for you. We reply there with our <strong className="text-white">{selected.label}</strong>{' '}
                  payment details. Your order is reserved while you pay.</>
                )}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!meetsMinimum(cart.total_usd) && (
              <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-accent text-sm font-semibold text-center">
                {minOrderMessage(cart.total_usd)} <Link href="/shop" className="underline">Keep shopping</Link>
              </div>
            )}
            <button type="submit" disabled={loading || !meetsMinimum(cart.total_usd)}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing…</>
              ) : (
                <>{isCard ? 'Continue to Payment' : 'Place Order'} — {format(grandTotal)}</>
              )}
            </button>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-5 text-[11px] text-muted">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-400" /> 100% Sealed</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-accent" /> Tracked &amp; Insured</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-green-400" /> Secure Checkout</span>
            </div>
          </form>
        </div>

        {/* ── Right: Summary (sticky on desktop) ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            <Link href="/cart" className="text-muted hover:text-white text-xs transition-colors">Edit</Link>
          </div>
          <div className="space-y-2">
            {cart.items.map(({ product, quantity }) => (
              <div key={product.id} className="card p-3 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg bg-bg overflow-hidden flex-shrink-0">
                  {product.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={product.image_url} alt="" loading="lazy" decoding="async"
                      className="w-full h-full object-contain p-1" />
                  )}
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-black text-[10px] font-bold flex items-center justify-center">
                    {quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{product.set_name}</p>
                  <p className="text-muted text-xs">{typeLabel(product.product_type)}</p>
                </div>
                <span className="text-white font-bold text-sm flex-shrink-0">
                  {format(priceOf(product) * quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="card p-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span><span>{format(cart.subtotal_usd)}</span>
            </div>
            {cart.bundle_discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Bundle discount</span><span>−{format(cart.bundle_discount)}</span>
              </div>
            )}
            <CartPromoLines multibuy={cart.multibuy_discount ?? 0} merchTotal={cart.total_usd} format={format} />
            <div className="flex justify-between text-muted">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Shipping {(shipping.freeApplied || comeback) && <span className="text-green-400 text-xs">({comeback ? COMEBACK.label : 'FREE'})</span>}
              </span>
              <span>{shipFee > 0 ? format(shipFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-white font-bold border-t border-bg-border pt-2 text-base">
              <span>Total</span><span className="text-accent">{format(grandTotal)}</span>
            </div>
          </div>
          {/* Free-shipping nudge */}
          {freeShipGap > 0 && (
            <div className="mt-2 px-1">
              <p className="text-[11px] text-muted">
                Add <strong className="text-accent">{format(freeShipGap)}</strong> more for free US shipping
              </p>
              <div className="h-1 bg-bg-border rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(100, (cart.total_usd / FREE_SHIPPING_THRESHOLD_USD) * 100)}%` }} />
              </div>
            </div>
          )}

          <p className="text-muted text-[11px] mt-2 px-1 leading-relaxed">
            Shipping is calculated from item size, quantity, order value &amp; destination.
            {shipping.freeApplied
              ? ' Free domestic shipping applied.'
              : form.country === 'US'
                ? ''
                : ' Insured & tracked international shipping.'}
          </p>

          {/* Selected payment */}
          <div className="card p-4 mt-4 flex items-center gap-3"
            style={{ background: selected.bg || '#111' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/30">
              {selected.logo}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{selected.label}</p>
              <p className="text-muted text-xs">
                {WHATSAPP_METHOD_IDS.includes(payMethod) ? 'Confirm on WhatsApp — we send payment details there' : payMethod === 'telegram' ? 'Arrange payment with us on Telegram' : payMethod === 'paypal' ? 'Approve the payment on PayPal at the next step' : isCard ? 'Paid securely by card at the next step' : 'Payment details sent after you order'}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-4 p-4 rounded-2xl border border-green-500/20 bg-green-500/5 space-y-2">
            <p className="text-green-400 text-sm font-bold">📲 We&apos;ll reach you within 2 hours</p>
            <p className="text-green-400/70 text-xs flex items-center gap-1.5">
              <span>📱</span>
              <a href="tel:+13322728148" className="hover:text-green-300 transition-colors">+1 (332) 272-8148</a>
              <span className="text-green-400/40">·</span>
              <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors">WhatsApp</a>
            </p>
            <p className="text-green-400/70 text-xs flex items-center gap-1.5">
              <span>📧</span>
              <a href="mailto:apextradingcardshop@gmail.com" className="hover:text-green-300 transition-colors">
                apextradingcardshop@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
