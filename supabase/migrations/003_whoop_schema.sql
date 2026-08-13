-- WHOOP OAuth tokens + durable daily snapshots (incremental upsert, not wipe-on-reconnect)

create table public.whoop_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  whoop_user_id bigint,
  email text,
  first_name text,
  last_name text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whoop_connections enable row level security;

create policy "Users can read own whoop connection"
  on public.whoop_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own whoop connection"
  on public.whoop_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own whoop connection"
  on public.whoop_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own whoop connection"
  on public.whoop_connections for delete
  using (auth.uid() = user_id);

create table public.whoop_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  snapshot_date date not null,
  source text not null default 'WHOOP',
  cycle_id bigint,
  sleep_id text,
  score_state text not null check (
    score_state in ('SCORED', 'PENDING_SCORE', 'UNSCORABLE')
  ),
  recovery integer,
  hrv integer,
  resting_hr integer,
  sleep_score integer,
  strain numeric(4, 1),
  sleep_efficiency integer,
  respiratory_rate numeric(5, 2),
  spo2 numeric(5, 2),
  skin_temp_celsius numeric(4, 2),
  kilojoule numeric,
  avg_hr integer,
  max_hr integer,
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create index whoop_snapshots_user_date_idx
  on public.whoop_snapshots (user_id, snapshot_date desc);

alter table public.whoop_snapshots enable row level security;

create policy "Users can read own whoop snapshots"
  on public.whoop_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own whoop snapshots"
  on public.whoop_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own whoop snapshots"
  on public.whoop_snapshots for update
  using (auth.uid() = user_id);

create policy "Users can delete own whoop snapshots"
  on public.whoop_snapshots for delete
  using (auth.uid() = user_id);
