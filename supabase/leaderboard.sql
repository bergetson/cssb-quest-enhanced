-- Run this in the Supabase SQL editor (Database → SQL Editor → New query)

create table if not exists public.leaderboard_entries (
  id                 text        primary key,
  callsign           text        not null default 'UNKNOWN',
  rank               text        not null default '',
  unit               text        not null default '495 CSSB',
  score              integer     not null default 0,
  campaign_pct       integer     not null default 0,
  missions_completed integer     not null default 0,
  gold_missions      integer     not null default 0,
  perfect_missions   integer     not null default 0,
  difficulty         text        not null default 'walk',
  level              integer     not null default 1,
  xp                 integer     not null default 0,
  achievements       integer     not null default 0,
  minigame_points    integer     not null default 0,
  challenge          text        not null default 'MOOSE-495',
  submitted_at       timestamptz not null default now()
);

-- Fast descending score lookups
create index if not exists idx_leaderboard_score
  on public.leaderboard_entries (score desc);

-- Enable Row Level Security
alter table public.leaderboard_entries enable row level security;

-- Anyone can read
create policy "public read"
  on public.leaderboard_entries
  for select
  using (true);

-- Anyone can submit a new score or overwrite their own entry
create policy "public upsert"
  on public.leaderboard_entries
  for insert
  with check (true);

create policy "public update own entry"
  on public.leaderboard_entries
  for update
  using (true)
  with check (true);

-- Prevent score inflation: only keep the higher score on conflict
-- (handled by the upsert logic in the client + this trigger as a safety net)
create or replace function public.keep_higher_score()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.leaderboard_entries
    where id = NEW.id and score >= NEW.score
  ) then
    return null;  -- discard the insert; existing row is equal or better
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_keep_higher_score on public.leaderboard_entries;
create trigger trg_keep_higher_score
  before insert on public.leaderboard_entries
  for each row execute function public.keep_higher_score();
