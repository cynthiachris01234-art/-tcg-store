'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Lock, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import {
  SiWise, SiCashapp, SiZelle, SiVenmo,
} from 'react-icons/si';
import { FaApplePay } from 'react-icons/fa6';
import Link from 'next/link';
import type { ProductType } from '@/types';

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
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wise',
    label: 'Wise Transfer',
    note: 'Best for international buyers — low fees worldwide',
    logo: <SiWise className="w-7 h-7" style={{ color: '#9FE870' }} />,
    bg: '#163300',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    note: 'Instant — payment request sent to your device',
    logo: <FaApplePay className="w-9 h-9 text-white" />,
    bg: '#1c1c1e',
  },
  {
    id: 'cashapp',
    label: 'Cash App',
    note: 'Fast US payments — we send you our $Cashtag',
    logo: <SiCashapp className="w-7 h-7" style={{ color: '#00D632' }} />,
    bg: '#003d0f',
  },
  {
    id: 'zelle',
    label: 'Zelle',
    note: 'Instant US bank transfer — no fees',
    logo: <SiZelle className="w-7 h-7" style={{ color: '#6D1ED4' }} />,
    bg: '#1a0a2e',
  },
  {
    id: 'venmo',
    label: 'Venmo',
    note: 'Send to our Venmo handle — details after order',
    logo: <SiVenmo className="w-7 h-7" style={{ color: '#008CFF' }} />,
    bg: '#001e3c',
  },
  {
    id: 'wire',
    label: 'Bank Wire / ACH',
    note: 'For large orders — bank account details sent after order',
    logo: <Building2 className="w-7 h-7 text-accent" />,
    bg: '#1a1400',
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { format } = useCurrency();
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [payMethod, setPayMethod] = useState('wise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(key: keyof AddressForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const checkRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      if (!checkRes.ok) throw new Error('Could not create order');
      const { orderId } = await checkRes.json();

      const customer = {
        name: form.name, email: form.email, phone: form.phone,
        line1: form.line1, line2: form.line2 || undefined,
        city: form.city, state: form.state,
        postal_code: form.postal_code, country: form.country,
      };

      const { saveOrder } = await import('@/lib/orders');
      const order = saveOrder(orderId, cart, customer, 'awaiting_payment', payMethod);

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:            order.id,
          status:        order.status,
          paymentMethod: payMethod,
          customer:      order.customer,
          items:         order.items,
          subtotal_usd:  order.subtotal,
          discount_usd:  order.discount,
          total_usd:     order.total,
        }),
      });

      clearCart();
      router.push(`/checkout/success?order=${orderId}&method=${payMethod}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const fields: { key: keyof AddressForm; label: string; type?: string; col?: string; required?: boolean }[] = [
    { key: 'name',        label: 'Full Name',             col: 'col-span-2' },
    { key: 'email',       label: 'Email Address',         type: 'email', col: 'col-span-2' },
    { key: 'phone',       label: 'Phone / WhatsApp',      type: 'tel',   col: 'col-span-2' },
    { key: 'line1',       label: 'Street Address',        col: 'col-span-2' },
    { key: 'line2',       label: 'Apt / Suite (optional)', col: 'col-span-2', required: false },
    { key: 'city',        label: 'City' },
    { key: 'state',       label: 'State / Province' },
    { key: 'postal_code', label: 'Postal Code' },
    { key: 'country',     label: 'Country' },
  ];

  const selected = PAYMENT_METHODS.find(m => m.id === payMethod)!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="flex items-center gap-1 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Left: Shipping + Payment ── */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Shipping Details</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address fields */}
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, type = 'text', col, required }) => (
                <div key={key} className={col ?? ''}>
                  <label className="block text-muted text-xs mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    required={required !== false && key !== 'line2'}
                    className="w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div>
              <h2 className="text-white font-bold text-base mb-3">Choose Payment Method</h2>
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

                    {/* Logo box */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.bg || '#111' }}>
                      {m.logo}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{m.label}</p>
                      <p className="text-muted text-xs leading-tight">{m.note}</p>
                    </div>

                    {payMethod === m.id
                      ? <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      : <div className="w-5 h-5 rounded-full border border-bg-border flex-shrink-0" />}
                  </label>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="card p-4 flex items-start gap-3 border-accent/25 bg-accent/5">
              <Lock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-muted text-xs leading-relaxed">
                Place your order and we&apos;ll send your <strong className="text-white">{selected.label}</strong> payment details to your phone or email <strong className="text-white">within 2 hours</strong>. Your order is reserved while you wait.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base font-bold">
              {loading ? 'Placing Order…' : `Place Order — ${format(cart.total_usd)}`}
            </button>
          </form>
        </div>

        {/* ── Right: Summary ── */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.items.map(({ product, quantity }) => (
              <div key={product.id} className="card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{product.set_name}</p>
                  <p className="text-muted text-xs">{typeLabel(product.product_type)} × {quantity}</p>
                </div>
                <span className="text-white font-bold text-sm flex-shrink-0">
                  {format(product.our_price_usd * quantity)}
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
            <div className="flex justify-between text-white font-bold border-t border-bg-border pt-2 text-base">
              <span>Total</span><span className="text-accent">{format(cart.total_usd)}</span>
            </div>
          </div>

          {/* Selected payment */}
          <div className="card p-4 mt-4 flex items-center gap-3"
            style={{ background: selected.bg || '#111' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/30">
              {selected.logo}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{selected.label}</p>
              <p className="text-muted text-xs">Payment link sent after order</p>
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
              <a href="mailto:support@apextcg.shop" className="hover:text-green-300 transition-colors">support@apextcg.shop</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
