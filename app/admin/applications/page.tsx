import { createClient } from '@supabase/supabase-js';
import { Download, FileText, Inbox, Mail, MapPin, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Applications' };

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const RESUME_BUCKET  = process.env.CAREERS_RESUME_BUCKET ?? 'job-applications';

/** Resume links are short-lived signed URLs — the bucket stays private. */
const SIGNED_URL_TTL_SECONDS = 30 * 60;
const PAGE_SIZE = 200;

interface Application {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  experience: string | null;
  resume_path: string;
  resume_name: string;
  resume_size: number;
  status: string;
  created_at: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Deterministic UTC formatting — toLocaleString is unreliable in server runtimes.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ` +
         `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STATUS_STYLES: Record<string, string> = {
  new:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  reviewing:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  contacted:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  rejected:   'bg-red-500/20 text-red-300 border-red-500/30',
  hired:      'bg-green-500/20 text-green-400 border-green-500/30',
};

async function loadApplications(): Promise<{
  rows: Application[];
  links: Record<string, string>;
  error: string | null;
}> {
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
    return { rows: [], links: {}, error: 'not-configured' };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error('Applications query error:', error);
    return { rows: [], links: {}, error: error.message };
  }

  const rows = (data ?? []) as Application[];
  const links: Record<string, string> = {};

  if (rows.length) {
    const { data: signed } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrls(rows.map(r => r.resume_path), SIGNED_URL_TTL_SECONDS);

    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) links[entry.path] = entry.signedUrl;
    }
  }

  return { rows, links, error: null };
}

export default async function AdminApplicationsPage() {
  const { rows, links, error } = await loadApplications();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-muted text-sm mt-1">
            Submissions from the <span className="font-mono text-white/70">/careers</span> form.
          </p>
        </div>
        {!error && (
          <span className="badge border border-bg-border bg-white/5 text-muted">
            {rows.length}
            {rows.length === PAGE_SIZE ? '+' : ''} total
          </span>
        )}
      </header>

      {error === 'not-configured' && (
        <div className="card p-6">
          <p className="text-white font-semibold">Supabase is not configured</p>
          <p className="text-muted text-sm mt-1.5 leading-relaxed">
            Set <span className="font-mono text-white/70">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
            <span className="font-mono text-white/70">SUPABASE_SERVICE_ROLE_KEY</span>, then run the
            job-applications block in{' '}
            <span className="font-mono text-white/70">supabase/schema.sql</span>. Until then the
            careers form declines submissions instead of storing them.
          </p>
        </div>
      )}

      {error && error !== 'not-configured' && (
        <div className="card p-6 border-red-500/30">
          <p className="text-red-300 font-semibold">Could not load applications</p>
          <p className="text-muted text-sm mt-1.5">{error}</p>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="card p-10 flex flex-col items-center text-center">
          <Inbox className="w-8 h-8 text-muted mb-3" />
          <p className="text-white font-semibold">No applications yet</p>
          <p className="text-muted text-sm mt-1">
            New submissions appear here as soon as they come in.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {rows.map(row => {
          const href = links[row.resume_path];
          return (
            <article key={row.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-white font-semibold">
                    {row.first_name} {row.last_name}
                  </h2>
                  <p className="text-muted text-xs mt-1 font-mono">
                    {row.reference} · {formatDate(row.created_at)}
                  </p>
                </div>
                <span
                  className={`badge border ${STATUS_STYLES[row.status] ?? 'bg-white/5 text-muted border-bg-border'}`}
                >
                  {row.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                <a
                  href={`mailto:${row.email}`}
                  className="flex items-center gap-2 text-white/80 hover:text-accent transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
                  <span className="truncate">{row.email}</span>
                </a>
                <a
                  href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-2 text-white/80 hover:text-accent transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
                  <span className="truncate">{row.phone}</span>
                </a>
                <p className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
                  <span className="truncate">
                    {row.location} · {row.timezone}
                  </span>
                </p>
              </div>

              {row.experience && (
                <p className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/70">
                  {row.experience}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 border-t border-bg-border pt-4">
                <FileText className="w-4 h-4 flex-shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate text-sm text-white/70">
                  {row.resume_name}
                  <span className="text-muted"> · {formatSize(row.resume_size)}</span>
                </span>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-accent/15 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Resume
                  </a>
                ) : (
                  <span className="flex-shrink-0 text-xs text-muted">Link unavailable</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {rows.length > 0 && (
        <p className="text-muted text-xs">
          Resume links are signed and expire after {SIGNED_URL_TTL_SECONDS / 60} minutes — reload
          this page to get fresh ones.
        </p>
      )}
    </div>
  );
}
