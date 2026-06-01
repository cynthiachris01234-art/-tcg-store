'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Lock, CreditCard, ArrowLeft } from 'lucide-react';
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

interface AddressForm {
  name: string; email: string;
  line1: string; line2: string;
  city: string; state: string;
  postal_code: string; country: string;
}

const EMPTY_FORM: AddressForm = {
  name: '', email: '',
  line1: '', line2: '',
  city: '', state: '',
  postal_code: '', country: 'US',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { format } = useCurrency();
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
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
      // Create payment intent on server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, shippingAddress: form }),
      });

      if (!res.ok) throw new Error('Failed to create payment intent');
      const data = await res.json();

      // Demo mode — no Stripe configured
      if (data.demo) {
        const { saveOrder } = await import('@/lib/orders');
        const customer = {
          name: form.name, email: form.email,
          line1: form.line1, line2: form.line2 || undefined,
          city: form.city, state: form.state,
          postal_code: form.postal_code, country: form.country,
        };
        const order = saveOrder(data.orderId, cart, customer, 'demo');

        // Await notification before navigating so fetch isn't cancelled
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id:           order.id,
            status:       order.status,
            customer:     order.customer,
            items:        order.items,
            subtotal_usd: order.subtotal,
            discount_usd: order.discount,
            total_usd:    order.total,
          }),
        });

        clearCart();
        router.push(`/checkout/success?order=${data.orderId}`);
        return;
      }

      const { clientSecret, orderId } = data;

      // Live mode — confirm with Stripe
      const { getStripe } = await import('@/lib/stripe');
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe not loaded');

      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
          payment_method_data: {
            billing_details: {
              name: form.name,
              email: form.email,
              address: {
                line1: form.line1, line2: form.line2,
                city: form.city, state: form.state,
                postal_code: form.postal_code, country: form.country,
              },
            },
          },
        },
      });

      if (stripeError) throw new Error(stripeError.message);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
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

  const fields: { key: keyof AddressForm; label: string; type?: string; col?: string }[] = [
    { key: 'name',        label: 'Full Name',     col: 'col-span-2' },
    { key: 'email',       label: 'Email',         type: 'email', col: 'col-span-2' },
    { key: 'line1',       label: 'Address',       col: 'col-span-2' },
    { key: 'line2',       label: 'Apt, Suite (optional)', col: 'col-span-2' },
    { key: 'city',        label: 'City' },
    { key: 'state',       label: 'State / Province' },
    { key: 'postal_code', label: 'Postal Code' },
    { key: 'country',     label: 'Country' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="flex items-center gap-1 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-6">Shipping & Payment</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, type = 'text', col }) => (
                <div key={key} className={col ?? ''}>
                  <label className="block text-muted text-xs mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    required={key !== 'line2'}
                    className="w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-colors placeholder-muted"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="card p-4 flex items-center gap-3">
              <Lock className="w-4 h-4 text-success flex-shrink-0" />
              <p className="text-muted text-xs">
                Payments are secured by Stripe. We never store your card details.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base">
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : `Pay ${format(cart.total_usd)}`}
            </button>
          </form>
        </div>

        {/* Order summary */}
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
              <div className="flex justify-between text-success">
                <span>Case bundle discount</span><span>−{format(cart.bundle_discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold border-t border-bg-border pt-2">
              <span>Total</span><span>{format(cart.total_usd)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
