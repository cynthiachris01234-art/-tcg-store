-- ─── Careers: job application intake ─────────────────────────────────────────
-- Run this in the Supabase SQL editor, then create the storage bucket below.
--
-- This table holds personal data (name, contact details, location) and points at
-- an uploaded résumé. It is written only by the server using the service-role
-- key, and RLS denies every anon/authenticated read.

CREATE TABLE IF NOT EXISTS job_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_slug   text        NOT NULL,
  first_name      text        NOT NULL,
  last_name       text        NOT NULL,
  email           text        NOT NULL,
  phone           text        NOT NULL,
  location        text        NOT NULL,
  experience      text,
  resume_path     text        NOT NULL,
  resume_filename text        NOT NULL,
  resume_size     integer     NOT NULL,
  status          text        NOT NULL DEFAULT 'received',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_applications_position_idx
  ON job_applications (position_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS job_applications_email_idx
  ON job_applications (email);

-- ─── Row level security ──────────────────────────────────────────────────────
-- No policies are defined on purpose: with RLS enabled and no policy, the anon
-- and authenticated roles cannot read or write anything. The service-role key
-- used by the API route bypasses RLS.

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- ─── Résumé storage ──────────────────────────────────────────────────────────
-- Create a PRIVATE bucket named 'career-applications'. Keeping it private
-- matters: résumés contain home addresses and full work history, and a public
-- bucket would expose every applicant's file to anyone who guesses the URL.
--
--   Dashboard → Storage → New bucket
--     Name:   career-applications
--     Public: OFF
--
-- Or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('career-applications', 'career-applications', false)
ON CONFLICT (id) DO NOTHING;

-- Download a résumé from the dashboard, or generate a short-lived signed URL
-- server-side with the service-role key:
--
--   supabase.storage
--     .from('career-applications')
--     .createSignedUrl(resume_path, 60);
