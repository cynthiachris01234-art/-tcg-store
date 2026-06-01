import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Order Confirmed!' };

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h1>
      <p className="text-muted text-lg mb-2">Thank you for your purchase.</p>
      {searchParams.order && (
        <p className="text-muted text-sm mb-8">Order ID: <span className="text-white font-mono">{searchParams.order}</span></p>
      )}

      <div className="card p-6 mb-8 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-accent" />
          <div>
            <p className="text-white font-semibold text-sm">What happens next?</p>
            <p className="text-muted text-xs mt-0.5">Your order will be packed and shipped within 1-2 business days. You'll receive a tracking number via email.</p>
          </div>
        </div>
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
