import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description: 'Answers to common questions about buying sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes from Apex TCG — pricing, shipping, payment, authenticity, and more.',
  alternates: { canonical: 'https://apextcg.shop/faq' },
};

const FAQS = [
  {
    q: 'Are all products 100% sealed and authentic?',
    a: 'Yes. Every product we sell is 100% factory sealed, direct from authorized distributors. We guarantee authenticity on every order — no opened, resealed, or counterfeit products ever.',
  },
  {
    q: 'Why are your prices so much lower than other stores?',
    a: 'We buy in bulk directly from distributors, which lets us pass the savings on to you. Our prices are always 40% below the TCGPlayer market price. We update prices weekly to stay accurate.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes — we ship worldwide with full tracking. International buyers often use Wise Transfer to avoid currency fees. Delivery typically takes 3–10 business days depending on your country.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Credit/Debit Cards (via Stripe, charged instantly), PayPal, Apple Pay, Cash App, and Wise Transfer. For manual payment methods (PayPal, Cash App, Wise), we send you the details via WhatsApp or email after you place your order.',
  },
  {
    q: 'How does ordering work for non-card payments?',
    a: 'Place your order on the site and select your preferred payment method. We will contact you via WhatsApp or email within minutes with the payment details. Once payment is received, your order ships within 1–2 business days.',
  },
  {
    q: 'Do you offer a discount on cases?',
    a: 'Yes — orders containing a case automatically receive an additional 5% discount off our already-discounted prices. This is applied at checkout.',
  },
  {
    q: 'What languages are available?',
    a: 'We stock products in English (EN), Japanese (JP), and Korean (KR) for Pokémon, One Piece, MTG, and Yu-Gi-Oh!. Japanese and Korean sets are often more affordable and are 100% playable.',
  },
  {
    q: 'How quickly do orders ship?',
    a: 'Orders ship within 1–2 business days of payment confirmation. You will receive a tracking number by email or WhatsApp once your order is dispatched.',
  },
  {
    q: 'Can I contact you before ordering?',
    a: 'Absolutely. Chat with us instantly via WhatsApp at +1 (332) 272-8148 or email apextradingcardshop@gmail.com. We typically reply within minutes.',
  },
  {
    q: 'Do you sell individual packs or only sealed boxes?',
    a: 'We primarily sell sealed booster boxes, cases, ETBs, and special collections. We do not sell individual packs or opened cards — everything is factory sealed.',
  },
  {
    q: 'What is the return policy?',
    a: 'If your order arrives damaged or incorrect, contact us within 7 days and we will arrange a replacement or refund. We do not accept returns on opened products. See our Returns page for full details.',
  },
  {
    q: 'Where is Apex TCG located?',
    a: 'We are based in New York, NY (447 Broadway, New York, NY 10013) and ship globally.',
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }} />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-muted text-lg">Everything you need to know about buying from Apex TCG.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="card group open:border-accent/40 transition-all">
            <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
              <span className="text-white font-semibold text-sm sm:text-base">{q}</span>
              <ChevronDown className="w-4 h-4 text-muted flex-shrink-0 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 pb-5">
              <p className="text-muted text-sm leading-relaxed">{a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 card p-6 border border-accent/20 bg-accent/5 text-center">
        <p className="text-white font-semibold mb-1">Still have questions?</p>
        <p className="text-muted text-sm mb-4">Our team typically replies within minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
            className="btn-primary px-6 py-2.5 text-sm">Chat on WhatsApp</a>
          <a href="mailto:apextradingcardshop@gmail.com"
            className="px-6 py-2.5 text-sm rounded-xl border border-bg-border text-muted hover:text-white hover:border-accent/50 transition-colors">Send an Email</a>
        </div>
      </div>
    </div>
  );
}
