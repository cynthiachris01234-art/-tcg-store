import type { Metadata } from 'next';
import { Check, ShieldCheck } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { ApplicationForm } from '@/components/careers/ApplicationForm';
import { PROPERTY_DATA_ENTRY as job } from '@/lib/careers/posting';

export const metadata: Metadata = {
  title: `${job.title} — Careers at Levy Real Estate`,
  description: job.summary,
  openGraph: {
    title: `${job.title} — Careers at Levy Real Estate`,
    description: job.summary,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const SUMMARY = [
  { label: 'Position', value: 'Property Data Entry' },
  { label: 'Location', value: job.location },
  { label: 'Training', value: job.training },
  { label: 'Work Type', value: job.workType },
];

const ERROR_COPY: Record<string, string> = {
  invalid: 'Please check the form below and correct the highlighted fields.',
  server:
    'Something went wrong while submitting your application. Please try again — your details were not saved.',
};

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-levy-muted">
          <Check className="mt-1 h-4 w-4 shrink-0 text-levy-brass" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PropertyDataEntryPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage = searchParams.error ? ERROR_COPY[searchParams.error] : undefined;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.summary,
          datePosted: job.datePosted,
          employmentType: 'FULL_TIME',
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Levy Real Estate',
          },
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: {
            '@type': 'Country',
            name: 'USA',
          },
        }}
      />

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-levy-line bg-white">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
          <span className="levy-label">Careers</span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-levy-ink sm:text-[42px]">
            {job.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-levy-muted">
            {job.summary}
          </p>
          <a href="#apply" className="levy-btn mt-8">
            Apply for this position
          </a>
        </div>
      </section>

      {/* ─── Summary strip ──────────────────────────────────────────────────── */}
      <section className="border-b border-levy-line bg-levy-sand">
        <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden px-5 sm:grid-cols-4">
          {SUMMARY.map((item) => (
            <div key={item.label} className="py-6 pr-4">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-levy-muted">
                {item.label}
              </dt>
              <dd className="mt-1.5 text-[15px] font-semibold text-levy-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ─── Detail ─────────────────────────────────────────────────────────── */}
      <section id="position" className="scroll-mt-24">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-levy-ink">
            About the position
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-levy-muted">{job.about}</p>

          <h3 className="mt-12 text-lg font-semibold text-levy-ink">Responsibilities</h3>
          <Bullets items={job.responsibilities} />

          <h3 id="requirements" className="mt-12 scroll-mt-24 text-lg font-semibold text-levy-ink">
            Requirements
          </h3>
          <Bullets items={job.requirements} />

          <h3 className="mt-12 text-lg font-semibold text-levy-ink">Training &amp; equipment</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-levy-muted">
            Selected candidates complete a paid onboarding and training programme before
            they begin working on live property records. Any equipment or software the
            role requires is purchased by Levy Real Estate and issued to you directly.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-levy-muted">
            You will never be asked to buy your own equipment, deposit a cheque on the
            company&rsquo;s behalf, or forward funds to a third party at any point during
            hiring or onboarding.
          </p>

          {/* ─── Compensation ─────────────────────────────────────────────── */}
          <div className="mt-12 rounded-xl border border-levy-brass-light/40 bg-white p-6 shadow-[0_1px_2px_rgba(16,28,24,0.04)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-levy-brass">
              Training compensation
            </span>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-levy-ink">
              ${job.trainingRate}
              <span className="ml-1 text-lg font-medium text-levy-muted">/ hour</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-levy-muted">
              Paid training, subject to the applicable employment terms. Compensation for
              the role beyond the training period is confirmed in writing before you start.
            </p>
          </div>

          {/* ─── Recruitment fraud notice ─────────────────────────────────── */}
          <aside className="mt-8 rounded-xl border border-levy-line bg-levy-sand p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-levy-green" />
              <div>
                <h3 className="text-sm font-semibold text-levy-ink">How we hire</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-levy-muted">
                  <li>
                    We never request payment, bank account details, or a Social Security
                    number before you have accepted a written offer.
                  </li>
                  <li>
                    We never send a cheque before your start date, and never ask you to
                    buy equipment and be reimbursed.
                  </li>
                  <li>
                    Interviews are arranged by a named member of our team from a Levy Real
                    Estate email address.
                  </li>
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-levy-muted">
                  If a message claiming to be from us does any of the above, it is not
                  from us.{' '}
                  <a
                    href="/careers/hiring-integrity"
                    className="font-medium text-levy-green underline underline-offset-2"
                  >
                    Read our hiring integrity notice
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Application ────────────────────────────────────────────────────── */}
      <section id="apply" className="scroll-mt-24 border-t border-levy-line bg-white">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-levy-ink">
            Apply for this position
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-levy-muted">
            Complete the application below to submit your information for consideration.
            Fields marked * are required.
          </p>

          <div className="mt-8">
            {/* The form owns the alert so a no-JS bounce and a client-side
                failure never stack two banners. */}
            <ApplicationForm positionSlug={job.slug} initialError={errorMessage} />
          </div>
        </div>
      </section>
    </>
  );
}
