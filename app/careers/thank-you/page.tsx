import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Application received — Levy Real Estate',
  description: 'Your application has been submitted to Levy Real Estate.',
  robots: { index: false, follow: false },
};

export default function ThankYouPage({ searchParams }: { searchParams: { ref?: string } }) {
  const reference = typeof searchParams.ref === 'string' ? searchParams.ref.slice(0, 16) : '';

  return (
    <section>
      <div className="mx-auto max-w-2xl px-5 py-20 sm:py-28">
        <CheckCircle2 className="h-10 w-10 text-levy-green" />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-levy-ink">
          Application received
        </h1>

        <p className="mt-5 text-[17px] leading-relaxed text-levy-muted">
          Thank you for applying to Levy Real Estate. Our property operations team reviews
          every application, and we&rsquo;ll be in touch by email if your experience is a
          good match for the role.
        </p>

        {reference && (
          <p className="mt-6 rounded-lg border border-levy-line bg-white px-4 py-3 text-sm text-levy-muted">
            Your reference:{' '}
            <span className="font-semibold tracking-wide text-levy-ink">{reference}</span>
          </p>
        )}

        <div className="mt-8 rounded-xl border border-levy-line bg-white p-6">
          <h2 className="text-sm font-semibold text-levy-ink">What happens next</h2>
          <p className="mt-3 text-sm leading-relaxed text-levy-muted">
            Any contact about this application comes from a named member of our team at a
            Levy Real Estate email address. We will not ask you for payment, bank details
            or a Social Security number before you have accepted a written offer.
          </p>
        </div>

        <Link
          href="/careers"
          className="mt-10 inline-block text-sm font-medium text-levy-green underline underline-offset-4 hover:text-levy-green-light"
        >
          View other open positions
        </Link>
      </div>
    </section>
  );
}
