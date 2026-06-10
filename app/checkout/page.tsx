'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { ProductType } from '@/types';

function typeLabel(t: ProductType): string {
  switch (t) {
    case 'case':               return 'Case';
    case 'etb':                return 'ETB';
    case 'upc':                return 'UPC';
    case 'spc':                return 'SPC';
    case 'bundle':             return 'Bundle';
    case 'premium_collection': return 'PC';
    case 'display_case':       return 'Display';
    case 'poster_collection':  return 'Poster';
    default:                   return 'Booster Box';
  }
}

const PAYMENT_METHODS = [
  {
    id: 'zelle',
    label: 'Zelle',
    icon: '💚',
    note: 'Send payment to our Zelle — details sent after order',
  },
  {
    id: 'cashapp',
    label: 'CashApp',
    icon: '💵',
    note: 'Send to our $CashTag — details sent after order',
  },
  {
    id: 'venmo',
    label: 'Venmo',
    icon: '🔵',
    note: 'Send to our Venmo — details sent after order',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: '💙',
    note: 'Send via PayPal — link sent after order',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    icon: '🍎',
    note: 'Pay via Apple Pay — payment request sent after order',
  },
  {
    id: 'wise',
    label: 'Wise Transfer',
    icon: '🌍',
    note: 'International & domestic — Wise details sent after order',
  },
  {
    id: 'wire',
    label: 'Bank Wire / ACH',
    icon: '🏦',
    note: 'For large orders — bank details sent after order',
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
  const [payMethod, setPayMethod] = useState('zelle');
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
      // 1. Generate order ID
      const checkRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      if (!checkRes.ok) throw new Error('Could not create order');
      const { orderId } = await checkRes.json();

      // 2. Build customer object
      const customer = {
        name: form.name, email: form.email, phone: form.phone,
        line1: form.line1, line2: form.line2 || undefined,
        city: form.city, state: form.state,
        postal_code: form.postal_code, country: form.country,
      };

      // 3. Save order locally
      const { saveOrder } = await import('@/lib/orders');
      const order = saveOrder(orderId, cart, customer, 'awaiting_payment', payMethod);

      // 4. Save to DB + fire WhatsApp & email notifications (await before navigating)
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
    { key: 'name',        label: 'Full Name',              col: 'col-span-2' },
    { key: 'email',       label: 'Email Address',          type: 'email', col: 'col-span-2' },
    { key: 'phone',       label: 'Phone / WhatsApp',       type: 'tel',   col: 'col-span-2' },
    { key: 'line1',       label: 'Street Address',         col: 'col-span-2' },
    { key: 'line2',       label: 'Apt, Suite (optional)',  col: 'col-span-2', required: false },
    { key: 'city',        label: 'City' },
    { key: 'state',       label: 'State / Province' },
    { key: 'postal_code', label: 'Postal Code' },
    { key: 'country',     label: 'Country' },
  ];

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === payMethod)!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="flex items-center gap-1 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left — Shipping + Payment */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Shipping Details</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping fields */}
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, type = 'text', col, required }) => (
                <div key={key} className={col ?? ''}>
                  <label className="block text-muted text-xs mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    required={required !== false && key !== 'line2'}
                    className="w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-colors placeholder-muted"
                  />
                </div>
              ))}
            </div>

            {/* Payment method selector */}
            <div>
              <h2 className="text-white font-bold text-base mb-3">Choose Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 card p-4 cursor-pointer transition-all ${
                      payMethod === m.id
                        ? 'border-accent bg-accent/5'
                        : 'hover:border-white/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={m.id}
                      checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{m.label}</p>
                      <p className="text-muted text-xs">{m.note}</p>
                    </div>
                    {payMethod === m.id && (
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="card p-4 flex items-start gap-3 bg-accent/5 border-accent/30">
              <Lock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-muted text-xs leading-relaxed">
                Place your order below. We will contact you via <strong className="text-white">WhatsApp or email within 2 hours</strong> with your {selectedMethod.label} payment link. Your order is reserved while you wait.
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

        {/* Right — Order summary */}
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

          {/* Payment method summary */}
          <div className="card p-4 mt-4 flex items-center gap-3">
            <span className="text-2xl">{selectedMethod.icon}</span>
            <div>
              <p className="text-white text-sm font-semibold">{selectedMethod.label} selected</p>
              <p className="text-muted text-xs">Payment instructions sent after order is placed</p>
            </div>
          </div>

          {/* Contact reassurance */}
          <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-xs text-green-400 space-y-1">
            <p className="font-semibold">📱 We'll reach you within 2 hours</p>
            <p className="text-green-400/70">WhatsApp: +1 (332) 272-8148</p>
            <p className="text-green-400/70">Email: support@apextcg.shop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
