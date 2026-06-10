import Link from 'next/link';
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';

export const metadata = { title: 'Returns & Refunds — Apex TCG' };

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <Link href="/" className="flex items-center gap-1.5 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-white">Returns & Refunds</h1>
        </div>
        <p className="text-muted text-lg">Your satisfaction is our priority. We stand behind every product we sell.</p>
      </div>

      {/* What we accept */}
      <div className="card p-6 mb-6 border border-green-500/20 bg-green-500/5">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" /> We Accept Returns / Issue Refunds For:
        </h2>
        <ul className="space-y-3">
          {[
            'Item arrived damaged or crushed during shipping',
            'Wrong item sent (different set, language, or product type)',
            'Item not received within the maximum delivery window',
            'Packaging shows clear signs of tampering or opening before delivery',
            'Significant discrepancy between the listed condition and received item',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What we don't accept */}
      <div className="card p-6 mb-6 border border-red-500/20 bg-red-500/5">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-400" /> We Do Not Accept Returns For:
        </h2>
        <ul className="space-y-3">
          {[
            'Opened or unsealed products — all sales of opened items are final',
            'Change of mind after purchase',
            'Buyer\'s remorse on price fluctuations after purchase',
            'Incorrect address provided by the buyer',
            'Customs delays or import duties (buyer\'s responsibility)',
            'Items held by customs due to destination country restrictions',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Return window */}
      <div className="card p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" /> Return Window & Process
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-border/50">
            <span className="text-accent font-bold text-lg min-w-[2rem]">1.</span>
            <div>
              <p className="text-white font-semibold">Contact us within 7 days</p>
              <p className="text-muted mt-0.5">Message us on WhatsApp or email <a href="mailto:apextradingcardshop@gmail.com" className="text-accent hover:underline">apextradingcardshop@gmail.com</a> within 7 days of receiving your order.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-border/50">
            <span className="text-accent font-bold text-lg min-w-[2rem]">2.</span>
            <div>
              <p className="text-white font-semibold">Provide photo/video evidence</p>
              <p className="text-muted mt-0.5">Send clear photos or a video of the damaged/incorrect item and its packaging. This is required to process your claim.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-border/50">
            <span className="text-accent font-bold text-lg min-w-[2rem]">3.</span>
            <div>
              <p className="text-white font-semibold">We review within 24–48 hours</p>
              <p className="text-muted mt-0.5">Our team will review your claim and respond with next steps — either a replacement shipment or full refund.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-border/50">
            <span className="text-accent font-bold text-lg min-w-[2rem]">4.</span>
            <div>
              <p className="text-white font-semibold">Refund or replacement issued</p>
              <p className="text-muted mt-0.5">Approved refunds are processed to your original payment method within <strong className="text-white">3–5 business days</strong>. Replacements ship within <strong className="text-white">1–2 business days</strong>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Condition policy */}
      <div className="card p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" /> Product Condition Guarantee
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-3">
          Every product listed on Apex TCG is <strong className="text-white">100% factory sealed</strong> and <strong className="text-white">authentic</strong>. We source directly from distributors and authorized resellers. We never sell opened, resealed, or counterfeit products.
        </p>
        <p className="text-muted text-sm leading-relaxed">
          All items are carefully inspected before shipping and packed with protective materials to minimize the risk of shipping damage.
        </p>
      </div>

      {/* Contact */}
      <div className="card p-6 border border-accent/20 bg-accent/5 text-center">
        <p className="text-white font-bold mb-1">Need to start a return or refund?</p>
        <p className="text-muted text-sm mb-4">Reach out and we'll make it right.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
            💬 WhatsApp Us
          </a>
          <a href="mailto:apextradingcardshop@gmail.com"
            className="btn-outline flex items-center gap-2 px-6 py-2.5 text-sm">
            📧 Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
