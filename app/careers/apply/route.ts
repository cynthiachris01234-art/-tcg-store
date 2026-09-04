import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { RESUME_RULES, TIME_ZONES } from '../data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const RESUME_BUCKET  = process.env.CAREERS_RESUME_BUCKET ?? 'job-applications';

/** Applications carry personal data, so we never accept them unless there is a
 *  configured place to put them — a silent drop would lose someone's CV. */
function storageConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey && !serviceRoleKey.includes('placeholder'));
}

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
}

// POST /careers/apply — receive a job application (multipart/form-data)
export async function POST(req: Request) {
  if (!storageConfigured()) {
    return bad(
      'Online applications are not available right now. Please contact us through ' +
        'our official channels to apply.',
      503,
    );
  }

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return bad('We could not read your application. Please try again.');
  }

  const firstName  = field(data, 'firstName');
  const lastName   = field(data, 'lastName');
  const email      = field(data, 'email');
  const phone      = field(data, 'phone');
  const location   = field(data, 'location');
  const timezone   = field(data, 'timezone');
  const experience = field(data, 'experience');
  const consent    = field(data, 'consent');

  if (!firstName || !lastName)     return bad('Please provide your first and last name.');
  if (firstName.length > 80 || lastName.length > 80) return bad('Name fields are too long.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    return bad('Please provide a valid email address.');
  }
  if ((phone.match(/\d/g) ?? []).length < 7 || phone.length > 40) {
    return bad('Please provide a valid phone number.');
  }
  if (!location || location.length > 120) return bad('Please provide your current city and state.');
  if (!(TIME_ZONES as readonly string[]).includes(timezone)) {
    return bad('Please select your time zone.');
  }
  if (experience.length > 4000) return bad('Please shorten your experience summary.');
  if (!consent) return bad('Please confirm that the information provided is accurate.');

  const resume = data.get('resume');
  if (!(resume instanceof File) || resume.size === 0) {
    return bad('Please attach your resume or CV.');
  }
  if (resume.size > RESUME_RULES.maxBytes) {
    return bad(
      `Your resume is larger than ${Math.round(RESUME_RULES.maxBytes / 1024 / 1024)}MB.`,
    );
  }
  const lowerName = resume.name.toLowerCase();
  const extensionOk = RESUME_RULES.extensions.some(ext => lowerName.endsWith(ext));
  const mimeOk = !resume.type || (RESUME_RULES.mimeTypes as readonly string[]).includes(resume.type);
  if (!extensionOk || !mimeOk) {
    return bad(`Resumes must be one of: ${RESUME_RULES.extensions.join(', ')}.`);
  }

  const reference = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const path = `${reference}/${safeFileName(resume.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, Buffer.from(await resume.arrayBuffer()), {
        contentType: resume.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Resume upload error:', uploadError);
      return bad('We could not store your resume. Please try again in a moment.', 502);
    }

    const { error: insertError } = await supabase.from('job_applications').insert({
      reference,
      first_name:  firstName,
      last_name:   lastName,
      email,
      phone,
      location,
      timezone,
      experience:  experience || null,
      resume_path: path,
      resume_name: resume.name,
      resume_size: resume.size,
    });

    if (insertError) {
      // Don't leave an orphaned file behind if the row could not be written.
      await supabase.storage.from(RESUME_BUCKET).remove([path]).catch(() => {});
      console.error('Application insert error:', insertError);
      return bad('We could not save your application. Please try again in a moment.', 502);
    }

    return NextResponse.json({ ok: true, reference });
  } catch (err) {
    console.error('Application submission error:', err);
    return bad('Something went wrong submitting your application. Please try again.', 500);
  }
}
