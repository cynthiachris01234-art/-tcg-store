// ─── Job application intake ───────────────────────────────────────────────────
// Validation and persistence for careers applications. Applications carry
// personal data (name, contact details, location, résumé), so everything here
// runs server-side only and writes through the service-role key.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const RESUME_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const RESUME_ACCEPT_ATTR = '.pdf,.doc,.docx';

const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

/** Storage bucket holding uploaded résumés. Must be created as a PRIVATE bucket. */
export const RESUME_BUCKET = 'career-applications';

export const APPLICATIONS_TABLE = 'job_applications';

export interface ApplicationFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  positionSlug: string;
}

export type FieldErrors = Partial<Record<keyof ApplicationFields | 'resume', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[+()\-.\s\d]{7,25}$/;

const LIMITS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  phone: 25,
  location: 120,
  experience: 4000,
} as const;

function clean(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

/**
 * Validates the submitted form. Returns the normalised fields plus any errors
 * keyed by field name so the client can mark the exact inputs that failed.
 */
export function validateApplication(form: FormData): {
  fields: ApplicationFields;
  resume: File | null;
  errors: FieldErrors;
} {
  const fields: ApplicationFields = {
    firstName: clean(form.get('firstName')).slice(0, LIMITS.firstName),
    lastName: clean(form.get('lastName')).slice(0, LIMITS.lastName),
    email: clean(form.get('email')).toLowerCase().slice(0, LIMITS.email),
    phone: clean(form.get('phone')).slice(0, LIMITS.phone),
    location: clean(form.get('location')).slice(0, LIMITS.location),
    // Preserve paragraph breaks in the free-text field.
    experience:
      typeof form.get('experience') === 'string'
        ? (form.get('experience') as string).trim().slice(0, LIMITS.experience)
        : '',
    positionSlug: clean(form.get('positionSlug')) || 'property-data-entry',
  };

  const errors: FieldErrors = {};

  if (!fields.firstName) errors.firstName = 'Enter your first name.';
  if (!fields.lastName) errors.lastName = 'Enter your last name.';

  if (!fields.email) errors.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(fields.email)) errors.email = 'Enter a valid email address.';

  if (!fields.phone) errors.phone = 'Enter your phone number.';
  else if (!PHONE_RE.test(fields.phone)) errors.phone = 'Enter a valid phone number.';

  if (!fields.location) errors.location = 'Enter your current city and state.';

  const entry = form.get('resume');
  const resume = entry instanceof File && entry.size > 0 ? entry : null;

  if (!resume) {
    errors.resume = 'Attach your CV or résumé.';
  } else if (resume.size > RESUME_MAX_BYTES) {
    errors.resume = 'Your file is larger than 5 MB. Please attach a smaller file.';
  } else {
    const ext = resume.name.split('.').pop()?.toLowerCase() ?? '';
    const typeOk = (RESUME_ACCEPTED_TYPES as readonly string[]).includes(resume.type);
    // Some browsers send an empty or generic MIME type, so accept a known
    // extension as corroboration rather than rejecting a valid document.
    if (!typeOk && !RESUME_EXTENSIONS.includes(ext)) {
      errors.resume = 'Attach a PDF or Word document (.pdf, .doc or .docx).';
    }
  }

  return { fields, resume, errors };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const ready = Boolean(url) && Boolean(key) && !key.includes('placeholder') && !key.includes('your-');
  return { url, key, ready };
}

export function isIntakeConfigured(): boolean {
  return config().ready;
}

function admin(): SupabaseClient {
  const { url, key } = config();
  return createClient(url, key, { auth: { persistSession: false } });
}

function safeFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? 'pdf';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

export interface StoreResult {
  ok: boolean;
  reference?: string;
  error?: string;
}

/**
 * Writes the résumé to private storage and the application row to Postgres.
 * Returns ok:false rather than throwing so the route can decide what the
 * applicant sees.
 */
export async function storeApplication(
  fields: ApplicationFields,
  resume: File,
): Promise<StoreResult> {
  if (!config().ready) {
    return { ok: false, error: 'not_configured' };
  }

  const db = admin();
  const path = `${fields.positionSlug}/${safeFileName(resume.name)}`;

  const upload = await db.storage.from(RESUME_BUCKET).upload(path, resume, {
    contentType: resume.type || 'application/octet-stream',
    upsert: false,
  });

  if (upload.error) {
    return { ok: false, error: upload.error.message };
  }

  const insert = await db
    .from(APPLICATIONS_TABLE)
    .insert({
      position_slug: fields.positionSlug,
      first_name: fields.firstName,
      last_name: fields.lastName,
      email: fields.email,
      phone: fields.phone,
      location: fields.location,
      experience: fields.experience || null,
      resume_path: path,
      resume_filename: resume.name.slice(0, 200),
      resume_size: resume.size,
      status: 'received',
    })
    .select('id')
    .single();

  if (insert.error) {
    // Don't leave an orphaned file behind if the row didn't land.
    await db.storage.from(RESUME_BUCKET).remove([path]);
    return { ok: false, error: insert.error.message };
  }

  return { ok: true, reference: String(insert.data.id).slice(0, 8).toUpperCase() };
}

// ─── Notification ─────────────────────────────────────────────────────────────

/**
 * Emails the hiring inbox that an application arrived. Best-effort: never
 * throws, and deliberately carries no résumé attachment.
 */
export async function notifyHiringTeam(fields: ApplicationFields, reference?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CAREERS_NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !to || !from) return;

  const lines = [
    `Position: ${fields.positionSlug}`,
    `Name: ${fields.firstName} ${fields.lastName}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Location: ${fields.location}`,
    reference ? `Reference: ${reference}` : '',
    '',
    'Open the careers dashboard to read the full application and download the résumé.',
  ].filter(Boolean);

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `New application — ${fields.firstName} ${fields.lastName}`,
        text: lines.join('\n'),
      }),
    });
  } catch {
    // Notification failure must not affect the applicant's submission.
  }
}
