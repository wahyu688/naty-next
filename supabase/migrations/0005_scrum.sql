-- ═══════════════════════════════════════════════════════════════
-- 0005_scrum.sql — M6
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.sprints (
  id             uuid primary key default gen_random_uuid(),
  engagement_id  uuid not null references public.engagements(id) on delete cascade,
  number         integer not null,
  start_date     date,
  end_date       date,
  goal           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (engagement_id, number)
);
alter table public.sprints enable row level security;

create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  engagement_id  uuid not null references public.engagements(id) on delete cascade,
  sprint_id      uuid references public.sprints(id) on delete set null,
  title          text not null,
  description    text,
  status         text not null default 'BACKLOG',
  assignee_id    bigint references public.members(id),
  discipline     text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

do $$ begin
  alter table public.tasks add constraint tasks_status_check
    check (status in ('BACKLOG','DIKERJAKAN','DIREVIEW','SELESAI'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.tasks add constraint tasks_discipline_check
    check (discipline is null or discipline in ('BACKEND','FRONTEND','DESIGN','PM_QA'));
exception when duplicate_object then null;
end $$;

alter table public.tasks enable row level security;

create table if not exists public.standups (
  id          uuid primary key default gen_random_uuid(),
  sprint_id   uuid not null references public.sprints(id) on delete cascade,
  member_id   bigint not null references public.members(id),
  date        date not null,
  yesterday   text,
  today       text,
  blocker     text,
  created_at  timestamptz not null default now(),
  unique (sprint_id, member_id, date)
);
alter table public.standups enable row level security;

create table if not exists public.change_requests (
  id             uuid primary key default gen_random_uuid(),
  engagement_id  uuid not null references public.engagements(id) on delete cascade,
  description    text not null,
  decision       text, -- GRATIS | BERBAYAR | FASE_2, null = belum diputuskan
  extra_charge   bigint not null default 0,
  decided_by     bigint references public.members(id),
  decided_at     timestamptz,
  created_at     timestamptz not null default now()
);

do $$ begin
  alter table public.change_requests add constraint change_requests_decision_check
    check (decision is null or decision in ('GRATIS','BERBAYAR','FASE_2'));
exception when duplicate_object then null;
end $$;

alter table public.change_requests enable row level security;
-- No anon/authenticated policies on any of the above — internal only,
-- accessed exclusively via service-role through /api/* routes.
