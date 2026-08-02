-- ═══════════════════════════════════════════════════════════════
-- 0002_members_auth.sql — M2: per-member Supabase Auth accounts
--
-- Adds auth linkage + access control columns to the existing
-- `members` table (per CLAUDE.md §5.2 — no new members table).
-- `role` (the existing column, public-facing job title) is left
-- untouched; access control uses the new `access_role` column only.
-- ═══════════════════════════════════════════════════════════════

alter table public.members
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null,
  add column if not exists email        text unique,
  add column if not exists access_role  text not null default 'MEMBER',
  add column if not exists status       text not null default 'AKTIF';

do $$ begin
  alter table public.members
    add constraint members_access_role_check check (access_role in ('ADMIN','PM','MEMBER'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.members
    add constraint members_status_check check (status in ('AKTIF','CUTI','TIDAK_AKTIF'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.members
    add constraint members_email_domain_check check (email is null or email like '%@natynext.com');
exception when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Column-level privilege tightening.
--
-- `members` has an existing row-level policy (`members_public_read`,
-- USING (true)) so public pages can read team profiles with the
-- anon key. That key is inherently public (ships in client JS), so
-- anyone can call the Supabase REST API directly — RLS alone only
-- restricts ROWS, not COLUMNS. Without this, `email` (and the new
-- access-control columns) would be readable by anyone who curls
-- `{SUPABASE_URL}/rest/v1/members?select=*` with the public anon key.
--
-- This revokes blanket table SELECT from anon/authenticated and
-- re-grants it only for the columns the public site actually needs.
-- Service-role (used by every /api/* route) bypasses RLS/grants
-- entirely and is unaffected.
--
-- NOTE: this means anon/authenticated callers can no longer do a
-- bare `select('*')` against `members` — they must list columns.
-- The three public pages that queried `select('*')` on members
-- (`src/app/page.tsx`, `works/page.tsx`, `timeline/page.tsx`) were
-- updated in this same milestone to select an explicit column list
-- instead. No rendered output changes — see M2 report.
-- ─────────────────────────────────────────────────────────────
revoke select on public.members from anon, authenticated;
grant select (
  id, name, short_name, role, bio, tags, github, linkedin,
  cv, portfolio, photo_url, updated_at
) on public.members to anon, authenticated;
