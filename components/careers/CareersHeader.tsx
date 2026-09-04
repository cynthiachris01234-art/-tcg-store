import Link from 'next/link';

/**
 * Header for the Levy Real Estate careers site.
 *
 * `showJobNav` is set on a job posting page, where the nav doubles as an
 * in-page jump list to the posting's sections.
 */
export function CareersHeader({ showJobNav = false }: { showJobNav?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-levy-line bg-levy-sand/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between gap-6 px-5">
        <Link href="/careers" className="group leading-none">
          <div className="font-semibold tracking-[0.12em] text-levy-ink text-[15px] sm:text-base">
            LEVY REAL ESTATE
          </div>
          <span className="mt-1 block text-[10px] font-medium tracking-[0.22em] text-levy-brass">
            PROPERTY &bull; CONSULTANCY
          </span>
        </Link>

        {showJobNav && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-levy-muted sm:flex">
            <a href="#position" className="transition-colors hover:text-levy-green">
              Position
            </a>
            <a href="#requirements" className="transition-colors hover:text-levy-green">
              Requirements
            </a>
            <a
              href="#apply"
              className="rounded-lg bg-levy-green px-4 py-2 text-white transition-colors hover:bg-levy-green-light"
            >
              Apply
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
