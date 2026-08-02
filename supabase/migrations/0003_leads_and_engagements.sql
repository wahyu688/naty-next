-- ═══════════════════════════════════════════════════════════════
-- 0003_leads_and_engagements.sql — M3 + M4 foundation
--
-- `engagements` is created here (earlier than its M4 label suggests)
-- because M3's "Jadikan engagement" action needs somewhere to insert
-- into. M4 builds the phase-gate UI/detail page on top of a table
-- that already exists as of this migration.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- contact_submissions — lead pipeline columns (§8)
-- ─────────────────────────────────────────────────────────────
alter table public.contact_submissions
  add column if not exists status        text not null default 'BARU',
  add column if not exists finder_id      bigint references public.members(id),
  add column if not exists closed_reason  text;

do $$ begin
  alter table public.contact_submissions
    add constraint contact_submissions_status_check
    check (status in ('BARU','DIKUALIFIKASI','DITUTUP','JADI_ENGAGEMENT'));
exception when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- engagements — client work, distinct from public `projects` (§3, §7)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.engagements (
  id                    uuid primary key default gen_random_uuid(),
  code                  text unique not null,        -- NTY-YYYY-NNN
  public_slug           text unique not null,         -- 12-char random, used in /track/[slug]
  client_name           text not null,
  client_contact        text,
  submission_id         uuid references public.contact_submissions(id),
  finder_id             bigint references public.members(id),
  value                 bigint not null,               -- integer rupiah, never float
  phase                 text not null default 'LEAD_MASUK',
  revision_quota        integer not null default 0,
  revision_used         integer not null default 0,
  dp_received_at        timestamptz,
  paid_off_at           timestamptz,
  target_date           date,
  progress_percent      integer not null default 0,
  public_note           text,
  published_project_id  text references public.projects(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

do $$ begin
  alter table public.engagements add constraint engagements_phase_check check (phase in (
    'LEAD_MASUK','KUALIFIKASI','SCOPING','PENAWARAN_KONTRAK',
    'KICKOFF','EKSEKUSI','QA_REVISI','SERAH_TERIMA'
  ));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.engagements add constraint engagements_progress_check
    check (progress_percent between 0 and 100);
exception when duplicate_object then null;
end $$;

alter table public.engagements enable row level security;
-- Deliberately NO anon/authenticated policy: engagements are internal.
-- Public read for the client portal happens through /track/[slug]
-- (M7), which queries with the service-role key and an explicit,
-- public-safe column list server-side — never a table-level policy
-- that anon could query directly for arbitrary engagements.

-- ─────────────────────────────────────────────────────────────
-- activity_logs (§7) — engagement_id AND submission_id are both
-- nullable so this one table can also record pre-engagement lead
-- actions (e.g. ADMIN overriding a claimed finder_id per §8), not
-- just post-engagement phase/scope/payout events.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.activity_logs (
  id             uuid primary key default gen_random_uuid(),
  engagement_id  uuid references public.engagements(id),
  submission_id  uuid references public.contact_submissions(id),
  actor_id       bigint references public.members(id),
  action         text not null,
  metadata       jsonb not null default '{}',
  created_at     timestamptz not null default now()
);

alter table public.activity_logs enable row level security;
-- No anon/authenticated policy — internal only, service-role access.
