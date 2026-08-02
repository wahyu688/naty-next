-- ═══════════════════════════════════════════════════════════════
-- 0004_scoping_and_payouts.sql — M5
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.scope_items (
  id               uuid primary key default gen_random_uuid(),
  engagement_id    uuid not null references public.engagements(id) on delete cascade,
  discipline       text not null,
  level            integer not null,
  points           integer not null,
  penalty_percent  integer not null default 0,
  penalty_reason   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (engagement_id, discipline)
);

do $$ begin
  alter table public.scope_items add constraint scope_items_discipline_check
    check (discipline in ('BACKEND','FRONTEND','DESIGN','PM_QA'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.scope_items add constraint scope_items_level_check check (level between 0 and 5);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.scope_items add constraint scope_items_penalty_check check (penalty_percent between 0 and 20);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.scope_items add constraint scope_items_penalty_reason_check
    check (penalty_percent = 0 or (penalty_reason is not null and length(trim(penalty_reason)) > 0));
exception when duplicate_object then null;
end $$;

alter table public.scope_items enable row level security;
-- No anon/authenticated policy — internal only.

create table if not exists public.assignments (
  id              uuid primary key default gen_random_uuid(),
  scope_item_id   uuid not null references public.scope_items(id) on delete cascade,
  member_id       bigint not null references public.members(id),
  share_percent   integer not null default 100,
  created_at      timestamptz not null default now()
);

do $$ begin
  alter table public.assignments add constraint assignments_share_check
    check (share_percent > 0 and share_percent <= 100);
exception when duplicate_object then null;
end $$;

alter table public.assignments enable row level security;

-- payouts — snapshot rows, never recomputed after the fact even if
-- scope_items/assignments change later (§7 "Bersifat snapshot").
create table if not exists public.payouts (
  id             uuid primary key default gen_random_uuid(),
  engagement_id  uuid not null references public.engagements(id),
  member_id      bigint references public.members(id), -- null = kas
  type           text not null,
  amount         bigint not null,
  calculated_at  timestamptz not null default now()
);

do $$ begin
  alter table public.payouts add constraint payouts_type_check
    check (type in ('FINDER_FEE','WORK_SHARE','KAS'));
exception when duplicate_object then null;
end $$;

alter table public.payouts enable row level security;
-- No anon/authenticated policy. View filtering (ADMIN/PM see all,
-- MEMBER sees only their own rows) happens in the API route, not RLS,
-- since all dashboard access goes through the service-role key.
