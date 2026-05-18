-- Pulse Check: profiles, lab sessions, interventions, PDF storage

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Lab test sessions (readings stored as JSONB)
create table public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  lab_name text,
  source_file_name text,
  storage_path text,
  biomarker_count integer not null default 0,
  readings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index test_sessions_user_id_idx on public.test_sessions (user_id);
create index test_sessions_session_date_idx on public.test_sessions (user_id, session_date desc);

alter table public.test_sessions enable row level security;

create policy "Users can read own test sessions"
  on public.test_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own test sessions"
  on public.test_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own test sessions"
  on public.test_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own test sessions"
  on public.test_sessions for delete
  using (auth.uid() = user_id);

-- Interventions
create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('supplement', 'medication', 'diet', 'exercise', 'lifestyle')),
  dosage text,
  frequency text,
  start_date date not null,
  end_date date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interventions_user_id_idx on public.interventions (user_id);

alter table public.interventions enable row level security;

create policy "Users can read own interventions"
  on public.interventions for select
  using (auth.uid() = user_id);

create policy "Users can insert own interventions"
  on public.interventions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own interventions"
  on public.interventions for update
  using (auth.uid() = user_id);

create policy "Users can delete own interventions"
  on public.interventions for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for lab PDFs (create bucket in dashboard or via API; policies below)
insert into storage.buckets (id, name, public)
values ('lab-pdfs', 'lab-pdfs', false)
on conflict (id) do nothing;

create policy "Users can read own lab PDFs"
  on storage.objects for select
  using (
    bucket_id = 'lab-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own lab PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'lab-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own lab PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'lab-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
