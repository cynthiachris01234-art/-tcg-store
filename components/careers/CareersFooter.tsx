import Link from 'next/link';

export function CareersFooter() {
  return (
    <footer className="mt-20 border-t border-levy-line bg-white">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-semibold tracking-[0.12em] text-levy-ink text-sm">
              LEVY REAL ESTATE
            </div>
            <span className="mt-1 block text-[10px] font-medium tracking-[0.22em] text-levy-brass">
              PROPERTY &bull; CONSULTANCY
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-levy-muted">
            <Link href="/careers" className="transition-colors hover:text-levy-green">
              Open positions
            </Link>
            <Link
              href="/careers/hiring-integrity"
              className="transition-colors hover:text-levy-green"
            >
              Hiring integrity
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-levy-line pt-6 text-xs leading-relaxed text-levy-muted">
          Levy Real Estate is an equal opportunity employer. We consider all qualified
          applicants without regard to race, colour, religion, sex, sexual orientation,
          gender identity, national origin, age, disability, or veteran status.
        </p>

        <p className="mt-3 text-xs text-levy-muted">
          &copy; {new Date().getFullYear()} Levy Real Estate. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
