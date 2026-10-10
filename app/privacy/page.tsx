import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Apex TCG',
  description: 'How Apex TCG collects, uses and protects your personal information.',
};

const UPDATED = 'September 30, 2026';
const EMAIL = 'apextradingcardshop@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 mb-4">
      <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
      <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 list-disc pl-5 marker:text-accent">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="flex items-center gap-1.5 text-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        </div>
        <p className="text-muted">Last updated: {UPDATED}</p>
        <p className="text-muted text-lg mt-3">
          Apex TCG (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs apextcg.shop. This policy explains what personal
          information we collect when you shop with us, why, and the choices you have.
        </p>
      </div>

      <Section title="1. Information we collect">
        <p><strong className="text-white">Information you give us</strong> when you place an order or contact us:</p>
        <List items={[
          'Your name, email address and phone / WhatsApp number',
          'Your shipping address',
          'The products you order and your order history',
          'Anything you write to us through the contact form, email, chat or social media',
        ]} />
        <p><strong className="text-white">Payment information.</strong> Card and wallet payments are processed by our
          payment provider, Stripe. Your card number goes directly to Stripe. We never see or store full card details.</p>
        <p><strong className="text-white">Information collected automatically</strong> when you browse:</p>
        <List items={[
          'Pages you visit, the device and browser you use, and roughly where you are (country / city level)',
          'How you use the site, such as clicks and scrolling, through Microsoft Clarity, which may record anonymised sessions to help us fix problems',
          'Advertising measurement through the Meta (Facebook / Instagram) Pixel, so we can see whether our ads work',
          'Your cart contents, saved in your own browser so they are still there when you come back',
        ]} />
      </Section>

      <Section title="2. How we use your information">
        <List items={[
          'To process, ship and deliver your order, and send you updates and tracking',
          'To contact you about your order or answer your questions',
          'To send you a one-time reminder if you start checkout but do not finish, with an offer to complete your order',
          'To prevent fraud and keep the store secure',
          'To understand how people use the site and improve it',
          'To measure and improve our advertising',
          'To meet our legal, tax and accounting obligations',
        ]} />
      </Section>

      <Section title="3. Who we share it with">
        <p>We <strong className="text-white">do not sell</strong> your personal information. We share it only with
          the service providers that help us run the store, and only what they need:</p>
        <List items={[
          'Stripe: to take payments securely',
          'Shipping carriers: your name, address and phone number so they can deliver your order',
          'Vercel (website hosting) and Supabase (order database): to run the site and store orders',
          'Resend: to send emails about your order',
          'Microsoft Clarity and Meta: for site analytics and ad measurement, as described above',
        ]} />
        <p>We may also disclose information if the law requires it, or to protect our rights, our customers or the
          public, for example to prevent fraud.</p>
      </Section>

      <Section title="4. Cookies and similar technologies">
        <p>We use cookies and browser storage to keep your cart, remember your preferences, understand site usage
          (Microsoft Clarity) and measure ads (Meta Pixel). You can block or delete cookies in your browser settings.
          The store still works, but your cart may not be saved between visits.</p>
      </Section>

      <Section title="5. How long we keep it">
        <p>We keep order records for as long as we need them to provide our service, handle returns and warranty
          questions, and meet tax and accounting rules, which is usually up to 7 years. Other information is deleted
          or anonymised when we no longer need it.</p>
      </Section>

      <Section title="6. Keeping it safe">
        <p>We use secure (HTTPS) connections, a PCI-compliant payment provider, and restricted access to order data.
          No method of sending or storing data is 100% secure, but we take reasonable steps to protect your information.</p>
      </Section>

      <Section title="7. Your rights and choices">
        <p>Depending on where you live, including California (CCPA/CPRA) and the EU or UK (GDPR), you may have the right to:</p>
        <List items={[
          'Ask what personal information we hold about you and get a copy of it',
          'Ask us to correct or delete it',
          'Opt out of marketing messages at any time',
          'Opt out of the use of your information for targeted advertising',
          'Not be treated differently for using these rights',
        ]} />
        <p>To make a request, email <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>.
          We may need to confirm your identity first, and we will reply within 30 days.</p>
      </Section>

      <Section title="8. Children">
        <p>Our store is not directed at children under 13, and we do not knowingly collect their personal
          information. If you believe a child has given us information, contact us and we will delete it.</p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top shows when it
          last changed. Significant changes will be highlighted on the site.</p>
      </Section>

      <Section title="10. Contact us">
        <p>Questions about this policy or your information? Email{' '}
          <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a> or visit our{' '}
          <Link href="/contact" className="text-accent hover:underline">Contact page</Link>.</p>
      </Section>
    </div>
  );
}
