import type { Metadata } from 'next';
import { Briefcase, Check, MapPin, ShieldAlert } from 'lucide-react';
import { ApplicationForm } from './ApplicationForm';
import { COMPANY, POSITION } from './data';

export const metadata: Metadata = {
  title: `${POSITION.title} — Careers`,
  description: `${COMPANY.name} is hiring a ${POSITION.title} (${POSITION.workplace}). ${POSITION.summary}`,
};

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      {/* ── Job header ───────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#5b6b80]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-[#1d4ed8]">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            {POSITION.employmentType}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {POSITION.workplace}
          </span>
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1">{POSITION.department}</span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#0f2a43] md:text-3xl">
          {POSITION.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#48586c]">
          {POSITION.summary}
        </p>

        {/* Highlights */}
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {POSITION.highlights.map(item => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e5eaf1] bg-[#fafbfd] px-4 py-3"
            >
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7b8a9d]">
                {item.label}
              </dt>
              <dd
                className={
                  'mt-1 text-base font-semibold ' +
                  ('emphasis' in item && item.emphasis ? 'text-[#0a7a4a]' : 'text-[#12283f]')
                }
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Role detail ──────────────────────────────────────────────────── */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <RoleList title="What you'll do" items={POSITION.responsibilities} />
        <RoleList title="What we're looking for" items={POSITION.requirements} />
      </section>

      {/* ── Application form ─────────────────────────────────────────────── */}
      <section
        id="apply"
        className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] md:p-8"
      >
        <div className="border-b border-[#eef1f5] pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-[#0f2a43]">
            Apply for This Position
          </h2>
          <p className="mt-1.5 text-sm text-[#5b6b80]">
            Please complete the form below to submit your application.
          </p>
        </div>

        <ApplicationForm />
      </section>

      {/* ── Applicant safety notice ──────────────────────────────────────── */}
      <aside className="mt-6 flex gap-3 rounded-2xl border border-[#f3d9a4] bg-[#fffaf0] p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#b7791f]" aria-hidden />
        <p className="text-sm leading-relaxed text-[#6b5424]">
          <strong className="font-semibold text-[#5a4415]">Applicant Safety Notice:</strong>{' '}
          Applicants should independently verify recruitment communications through the
          company&apos;s official channels. No applicant should be required to pay a fee to
          apply for employment.
        </p>
      </aside>
    </div>
  );
}

function RoleList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <h2 className="text-base font-semibold text-[#0f2a43]">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map(item => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[#48586c]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0a7a4a]" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
