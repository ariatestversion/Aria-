-- Run once in Supabase → SQL Editor
-- Stores profile fields linked to auth.users (passwords stay in Auth only)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Practice takes + Aria feedback (follow the account across devices / URLs)
create table if not exists public.practice_sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  piece_name text,
  has_partition boolean,
  created_at timestamptz not null default now(),
  feedback_headline text,
  take_number int,
  feedback jsonb,
  has_audio boolean
);

alter table public.practice_sessions enable row level security;

create policy "Users can read own sessions"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.practice_sessions for update
  using (auth.uid() = user_id);
