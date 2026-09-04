import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { OPEN_POSITIONS } from '@/lib/careers/posting';

export const metadata: Metadata = {
  title: 'Careers at Levy Real Estate',
  description:
    'Open positions at Levy Real Estate — property consultancy roles across our operations, listings and client teams.',
};

export default function CareersIndexPage() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <span className="levy-label">Careers</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-levy-ink sm:text-[40px]">
          Open positions
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-levy-muted">
          We&rsquo;re a property consultancy built on accurate information and careful
          work. When we&rsquo;re hiring, every open role is listed here.
        </p>

        <ul className="mt-10 space-y-4">
          {OPEN_POSITIONS.map((job) => (
            <li key={job.slug}>
              <Link
                href={`/careers/${job.slug}`}
                className="group block rounded-xl border border-levy-line bg-white p-6 transition-colors hover:border-levy-brass-light"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-levy-ink">{job.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-levy-muted">
                      {job.summary}
                    </p>
                    <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-levy-muted">
                      <MapPin className="h-3.5 w-3.5 text-levy-brass" />
                      {job.location}
                      <span className="text-levy-line">|</span>
                      {job.employmentType}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-levy-brass transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {OPEN_POSITIONS.length === 0 && (
          <p className="mt-10 rounded-xl border border-levy-line bg-white p-6 text-[15px] text-levy-muted">
            We have no open positions at the moment. Please check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
