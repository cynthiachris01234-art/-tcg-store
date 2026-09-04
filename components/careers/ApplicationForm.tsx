'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileText, Loader2, Paperclip, X } from 'lucide-react';

const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_ACCEPT = '.pdf,.doc,.docx';
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

type Errors = Record<string, string>;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="levy-field" data-invalid={error ? 'true' : 'false'}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-levy-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function ApplicationForm({
  positionSlug,
  initialError = '',
}: {
  positionSlug: string;
  /** Message from a no-JS submission that bounced back via ?error=. */
  initialError?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resume, setResume] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  function pickFile(file: File | null) {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!RESUME_EXTENSIONS.includes(ext)) {
      setErrors((e) => ({ ...e, resume: 'Attach a PDF or Word document (.pdf, .doc or .docx).' }));
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setErrors((e) => ({ ...e, resume: 'Your file is larger than 5 MB. Please attach a smaller file.' }));
      return;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next.resume;
      return next;
    });
    setResume(file);
  }

  function clearFile() {
    setResume(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    if (!resume) {
      setErrors((e) => ({ ...e, resume: 'Attach your CV or résumé.' }));
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setErrors({});

    try {
      const res = await fetch('/careers/apply', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const payload = await res.json().catch(() => ({}));

      if (res.ok && payload.ok) {
        const ref = payload.reference ? `?ref=${encodeURIComponent(payload.reference)}` : '';
        router.push(`/careers/thank-you${ref}`);
        return;
      }

      setErrors(payload.errors ?? {});
      setFormError(
        payload.message ?? 'We could not submit your application. Please try again.',
      );
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setFormError(
        'We could not reach the server. Check your connection and try again — your details were not submitted.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      // The native action keeps the form working if JavaScript fails to load;
      // onSubmit upgrades it to an inline, validated submission.
      action="/careers/apply"
      method="POST"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
    >
      <input type="hidden" name="positionSlug" value={positionSlug} />

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="First name *" error={errors.firstName}>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            maxLength={80}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
        </Field>

        <Field id="lastName" label="Last name *" error={errors.lastName}>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            maxLength={80}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email address *" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>

        <Field id="phone" label="Phone number *" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={25}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
        </Field>
      </div>

      <Field id="location" label="Current city and state *" error={errors.location}>
        <input
          id="location"
          name="location"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. Atlanta, Georgia"
          autoComplete="address-level2"
          aria-invalid={Boolean(errors.location)}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
      </Field>

      <Field
        id="experience"
        label="Relevant experience"
        error={errors.experience}
        hint="Optional — a few sentences is plenty."
      >
        <textarea
          id="experience"
          name="experience"
          maxLength={4000}
          placeholder="Briefly describe your data entry, administrative or real estate experience."
        />
      </Field>

      {/* ─── Résumé upload ─────────────────────────────────────────────────── */}
      <div className="levy-field" data-invalid={errors.resume ? 'true' : 'false'}>
        <label htmlFor="resume">Upload CV / Résumé *</label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0] ?? null;
            if (file && fileRef.current) {
              // Keep the real input in sync so a no-JS resubmit still carries the file.
              fileRef.current.files = e.dataTransfer.files;
            }
            pickFile(file);
          }}
          className={[
            'rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragging
              ? 'border-levy-green bg-levy-green/5'
              : errors.resume
                ? 'border-red-400 bg-red-50/40'
                : 'border-levy-line bg-white hover:border-levy-brass-light',
          ].join(' ')}
        >
          {resume ? (
            <div className="flex items-center justify-center gap-3 text-sm">
              <FileText className="h-5 w-5 shrink-0 text-levy-green" />
              <span className="truncate font-medium text-levy-ink">{resume.name}</span>
              <span className="shrink-0 text-xs text-levy-muted">{formatSize(resume.size)}</span>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove attached file"
                className="shrink-0 rounded p-1 text-levy-muted transition-colors hover:bg-levy-line/60 hover:text-levy-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Paperclip className="h-5 w-5 text-levy-brass" />
              <p className="text-sm text-levy-muted">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="font-semibold text-levy-green underline underline-offset-2 hover:text-levy-green-light"
                >
                  Choose a file
                </button>{' '}
                or drag it here
              </p>
              <p className="text-xs text-levy-muted">PDF or Word document, up to 5 MB</p>
            </div>
          )}

          <input
            ref={fileRef}
            id="resume"
            name="resume"
            type="file"
            required
            accept={RESUME_ACCEPT}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            aria-invalid={Boolean(errors.resume)}
            aria-describedby={errors.resume ? 'resume-error' : undefined}
            className="sr-only"
          />
        </div>

        {errors.resume && (
          <p id="resume-error" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.resume}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="levy-btn shrink-0 whitespace-nowrap sm:w-auto"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
        <p className="text-xs leading-relaxed text-levy-muted">
          Your details are used to assess this application only. We never ask applicants
          for payment or bank details.
        </p>
      </div>
    </form>
  );
}
