import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hiring integrity — Levy Real Estate',
  description:
    'How Levy Real Estate contacts applicants, what we will never ask for, and how to check that a message about a role is genuinely from us.',
};

const NEVER = [
  'Ask you to pay a fee to apply, interview, or be onboarded.',
  'Ask for your bank account details, card details, or a Social Security number before you have accepted a written offer.',
  'Send you a cheque or transfer before your start date, or ask you to forward money to a third party.',
  'Ask you to buy your own computer, software or supplies and be reimbursed.',
  'Conduct the entire hiring process over a messaging app without a scheduled call with a named member of our team.',
];

export default function HiringIntegrityPage() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
        <ShieldCheck className="h-9 w-9 text-levy-green" />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-levy-ink">
          Hiring integrity
        </h1>

        <p className="mt-5 text-[17px] leading-relaxed text-levy-muted">
          Recruitment fraud is common in remote hiring, and scams often borrow the name of
          a real company. This page sets out how we actually hire, so you can tell a
          genuine message from us apart from one that only claims to be.
        </p>

        <h2 className="mt-12 text-lg font-semibold text-levy-ink">
          Levy Real Estate will never
        </h2>
        <ul className="mt-4 space-y-3">
          {NEVER.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[15px] leading-relaxed text-levy-muted"
            >
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-levy-brass"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-lg font-semibold text-levy-ink">
          If something looks wrong
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-levy-muted">
          Stop and verify before sending money, documents or personal identifiers. Contact
          us directly through the details on our own website rather than replying to the
          message in question, and report the approach to your local consumer protection
          authority. In the United States you can report it to the FTC at{' '}
          <a
            href="https://reportfraud.ftc.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-levy-green underline underline-offset-2"
          >
            reportfraud.ftc.gov
          </a>
          .
        </p>

        <Link
          href="/careers"
          className="mt-12 inline-block text-sm font-medium text-levy-green underline underline-offset-4 hover:text-levy-green-light"
        >
          Back to open positions
        </Link>
      </div>
    </section>
  );
}
