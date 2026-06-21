-- MyCoach 초기 스키마
-- User 프로필 (Supabase Auth의 auth.users를 확장)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goal
create table public.goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  rolemodel       text not null,
  lifestyle_tags  text[] not null default '{}',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- DailySchedule
create table public.daily_schedules (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- RoutineBlock (DailySchedule의 각 루틴 항목)
create table public.routine_blocks (
  id               uuid primary key default gen_random_uuid(),
  schedule_id      uuid not null references public.daily_schedules(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  time             text not null,          -- "07:00"
  task             text not null,
  duration_label   text not null,          -- "30분"
  duration_minutes integer not null check (duration_minutes > 0),
  status           text not null default 'todo'
                     check (status in ('todo', 'active', 'done', 'delayed', 'skipped')),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- CheckIn
create table public.checkins (
  id               uuid primary key default gen_random_uuid(),
  block_id         uuid not null references public.routine_blocks(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  actual_duration  integer,               -- 실제 소요 시간(분)
  note             text,
  completed_at     timestamptz not null default now()
);

-- Feedback (AI 회고)
create table public.feedbacks (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  date                  date not null,
  ai_summary            text,
  score                 integer check (score between 0 and 100),
  next_schedule_preview jsonb,
  created_at            timestamptz not null default now(),
  unique (user_id, date)
);

-- Streak 집계 뷰 (홈 화면 "스트릭 N일째" 표시용)
create or replace view public.user_streaks as
select
  ds.user_id,
  count(*) filter (
    where exists (
      select 1 from public.routine_blocks rb
      where rb.schedule_id = ds.id
        and rb.status = 'done'
    )
  ) as total_completed_days
from public.daily_schedules ds
group by ds.user_id;

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create trigger trg_routine_blocks_updated_at
  before update on public.routine_blocks
  for each row execute function public.set_updated_at();

-- 신규 유저 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS 활성화
alter table public.profiles        enable row level security;
alter table public.goals           enable row level security;
alter table public.daily_schedules enable row level security;
alter table public.routine_blocks  enable row level security;
alter table public.checkins        enable row level security;
alter table public.feedbacks       enable row level security;

-- RLS 정책: 본인 데이터만 접근
create policy "profiles: 본인만" on public.profiles
  for all using (auth.uid() = id);

create policy "goals: 본인만" on public.goals
  for all using (auth.uid() = user_id);

create policy "daily_schedules: 본인만" on public.daily_schedules
  for all using (auth.uid() = user_id);

create policy "routine_blocks: 본인만" on public.routine_blocks
  for all using (auth.uid() = user_id);

create policy "checkins: 본인만" on public.checkins
  for all using (auth.uid() = user_id);

create policy "feedbacks: 본인만" on public.feedbacks
  for all using (auth.uid() = user_id);

-- 인덱스
create index on public.routine_blocks (schedule_id, sort_order);
create index on public.daily_schedules (user_id, date desc);
create index on public.checkins (block_id);
create index on public.feedbacks (user_id, date desc);
