-- ═══════════════════════════════════════════════════════════════
-- 0001_baseline_existing_schema.sql
--
-- Baseline snapshot of the schema as it exists in the live NATY
-- Supabase project TODAY. This does not create anything new — it
-- documents what is already there so future migrations have a
-- starting point in version control.
--
-- Reconstructed via PostgREST OpenAPI introspection
-- (`GET {SUPABASE_URL}/rest/v1/`) on 2026-08-02, cross-checked
-- against `src/lib/supabase.ts` and every `src/app/api/*/route.ts`.
--
-- `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` guards make this safe
-- to run against the existing live database without erroring, but
-- it is NOT intended to be pushed there — the tables already match.
-- It exists so a *new* Supabase project can be bootstrapped to the
-- same starting point.
--
-- RLS policies below are best-effort, reconstructed from observed
-- application behavior (which client — anon vs service-role — is
-- used per route), NOT dumped from the live project (PostgREST's
-- introspection endpoint does not expose policy definitions).
-- MUST be verified against the actual policies in the Supabase
-- SQL editor / Dashboard → Authentication → Policies before relying
-- on this file as a source of truth for RLS.
--
-- Known schema drift found during cross-check (documented, not
-- fixed — do not touch existing columns without an explicit ask):
--   • members.cv_url, members.portfolio_url       — unused by any
--     app code; the app reads/writes `cv` and `portfolio` instead.
--   • members has no created_at, only updated_at.
--   • projects.preview_image_url                  — unused by any
--     app code; the app reads/writes `preview_url` instead.
--   • contact_messages                            — a whole legacy
--     table, structurally similar to contact_submissions but with
--     a bigint id and a `read` column instead of `is_read`. No
--     current route or type references it. Left in place as-is.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- members
-- ─────────────────────────────────────────────────────────────
create table if not exists public.members (
  id             integer primary key,
  name           text not null,
  short_name     text not null,
  role           text not null,
  bio            text not null default '',
  tags           text[] not null default '{}',
  github         text not null default '',
  linkedin       text not null default '',
  photo_url      text,
  cv             text,
  portfolio      text,
  cv_url         text,          -- dead column, unused by app code
  portfolio_url  text,          -- dead column, unused by app code
  updated_at     timestamptz not null default now()
);

alter table public.members enable row level security;

drop policy if exists "members_public_read" on public.members;
create policy "members_public_read"
  on public.members for select
  to anon, authenticated
  using (true);
-- Writes to `members` only ever happen through /api/members using
-- getServiceSupabase() (service-role, bypasses RLS) — no anon/authenticated
-- write policy currently exists.

-- ─────────────────────────────────────────────────────────────
-- projects  — public portfolio showcase, NOT client work
-- ─────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id                 text primary key,
  name               text not null,
  type               text not null,
  categories         text[] not null default '{}',
  status             text not null default 'shipped',
  emoji              text not null default '🚀',
  gradient_from      text not null default '#161616',
  gradient_to        text not null default '#272727',
  featured           boolean not null default false,
  members            integer[] not null default '{}',
  description        text not null default '',
  stack              text[] not null default '{}',
  overview           text not null default '',
  challenge          text not null default '',
  solution           text not null default '',
  year               text not null,
  role               text not null default '',
  link               text,
  preview_url        text,
  preview_image_url  text default '',   -- dead column, unused by app code
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  to anon, authenticated
  using (true);
-- Writes only via /api/projects using service-role.

-- ─────────────────────────────────────────────────────────────
-- pricing
-- ─────────────────────────────────────────────────────────────
create table if not exists public.pricing (
  id          text primary key,
  name        text not null,
  price       text not null,
  tagline     text not null,
  features    text[] not null default '{}',
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.pricing enable row level security;

drop policy if exists "pricing_public_read" on public.pricing;
create policy "pricing_public_read"
  on public.pricing for select
  to anon, authenticated
  using (true);
-- Writes only via /api/pricing using service-role.

-- ─────────────────────────────────────────────────────────────
-- timeline
-- ─────────────────────────────────────────────────────────────
create table if not exists public.timeline (
  id          text primary key,
  year        text not null,
  month       text not null,
  type        text not null default 'project',
  title       text not null,
  description text not null default '',
  member_id   integer not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.timeline enable row level security;

drop policy if exists "timeline_public_read" on public.timeline;
create policy "timeline_public_read"
  on public.timeline for select
  to anon, authenticated
  using (true);
-- Writes only via /api/timeline using service-role.

-- ─────────────────────────────────────────────────────────────
-- contact_submissions — active contact form table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  service     text not null default '',
  budget      text not null default '',
  company     text not null default '',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_public_insert" on public.contact_submissions;
create policy "contact_submissions_public_insert"
  on public.contact_submissions for insert
  to anon
  with check (true);
-- Reads/updates/deletes only via /api/contact using service-role
-- (dashboard inquiries section). No public select policy.

-- ─────────────────────────────────────────────────────────────
-- contact_messages — LEGACY, unused by any current app code.
-- Kept as-is per the "don't touch existing schema" rule; not
-- referenced by src/lib/supabase.ts or any route handler.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          bigint generated by default as identity primary key,
  name        text not null,
  email       text not null,
  company     text,
  service     text,
  budget      text,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.contact_messages enable row level security;
-- No policy reconstructed — table is dead code, access pattern unknown.
-- Left RLS enabled with default-deny (no policies) so it fails closed.
