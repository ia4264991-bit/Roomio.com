-- Social media extensions for Roomio app
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.hostel_shorts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hostel_id text null,
  title text not null,
  video_url text not null,
  price text not null,
  description text not null,
  location text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hostel_comments (
  id uuid primary key default gen_random_uuid(),
  hostel_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 800),
  created_at timestamptz not null default now()
);

alter table public.hostel_shorts enable row level security;
alter table public.hostel_comments enable row level security;

drop policy if exists "shorts are public read" on public.hostel_shorts;
create policy "shorts are public read"
  on public.hostel_shorts
  for select
  using (true);

drop policy if exists "auth users can create shorts" on public.hostel_shorts;
create policy "auth users can create shorts"
  on public.hostel_shorts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "owners can delete shorts" on public.hostel_shorts;
create policy "owners can delete shorts"
  on public.hostel_shorts
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "comments are public read" on public.hostel_comments;
create policy "comments are public read"
  on public.hostel_comments
  for select
  using (true);

drop policy if exists "auth users can create comments" on public.hostel_comments;
create policy "auth users can create comments"
  on public.hostel_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);
