-- Roomio schema upgrade (non-destructive)
-- Run this in Supabase SQL Editor on the project with your old 20 hostels.

create extension if not exists "pgcrypto";

-- 1) Upgrade existing hostels table (keeps existing rows)
alter table if exists public.hostels
  add column if not exists video text,
  add column if not exists images text[] default '{}'::text[],
  add column if not exists phone text,
  add column if not exists price text,
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Optional trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hostels_updated_at on public.hostels;
create trigger trg_hostels_updated_at
before update on public.hostels
for each row
execute function public.set_updated_at();

-- 2) Global reactions table (like/dislike)
create table if not exists public.hostel_reactions (
  id uuid primary key default gen_random_uuid(),
  hostel_id text not null references public.hostels(id) on delete cascade,
  user_id text not null, -- custom auth user id/email
  reaction text not null check (reaction in ('like','dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, user_id)
);

drop trigger if exists trg_hostel_reactions_updated_at on public.hostel_reactions;
create trigger trg_hostel_reactions_updated_at
before update on public.hostel_reactions
for each row
execute function public.set_updated_at();

create index if not exists idx_hostel_reactions_hostel on public.hostel_reactions(hostel_id);
create index if not exists idx_hostel_reactions_user on public.hostel_reactions(user_id);

-- 3) Global comments table
create table if not exists public.hostel_comments (
  id uuid primary key default gen_random_uuid(),
  hostel_id text not null references public.hostels(id) on delete cascade,
  user_id text not null, -- custom auth user id/email
  author_name text,
  content text not null check (char_length(content) between 2 and 800),
  created_at timestamptz not null default now()
);

create index if not exists idx_hostel_comments_hostel on public.hostel_comments(hostel_id);
create index if not exists idx_hostel_comments_user on public.hostel_comments(user_id);

-- 4) Shorts table (video path or URL)
create table if not exists public.hostel_shorts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  hostel_id text null references public.hostels(id) on delete set null,
  title text not null,
  video_url text not null,
  price text not null,
  description text not null,
  location text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_hostel_shorts_hostel on public.hostel_shorts(hostel_id);
create index if not exists idx_hostel_shorts_user on public.hostel_shorts(user_id);

-- 5) Popularity view: likes*2 + comments - dislikes
create or replace view public.hostel_popularity as
select
  h.id as hostel_id,
  h.name,
  coalesce(sum(case when r.reaction = 'like' then 1 else 0 end), 0) as likes,
  coalesce(sum(case when r.reaction = 'dislike' then 1 else 0 end), 0) as dislikes,
  coalesce(c.comment_count, 0) as comments,
  (
    coalesce(sum(case when r.reaction = 'like' then 1 else 0 end), 0) * 2
    + coalesce(c.comment_count, 0)
    - coalesce(sum(case when r.reaction = 'dislike' then 1 else 0 end), 0)
  ) as popularity_score
from public.hostels h
left join public.hostel_reactions r on r.hostel_id = h.id
left join (
  select hostel_id, count(*) as comment_count
  from public.hostel_comments
  group by hostel_id
) c on c.hostel_id = h.id
group by h.id, h.name, c.comment_count;

-- 6) Basic RLS (adjust later if needed)
alter table public.hostels enable row level security;
alter table public.hostel_reactions enable row level security;
alter table public.hostel_comments enable row level security;
alter table public.hostel_shorts enable row level security;

drop policy if exists "hostels public read" on public.hostels;
create policy "hostels public read"
  on public.hostels
  for select
  using (true);

drop policy if exists "hostels full access for anon+auth" on public.hostels;
create policy "hostels full access for anon+auth"
  on public.hostels
  for all
  using (true)
  with check (true);

drop policy if exists "reactions public read" on public.hostel_reactions;
create policy "reactions public read"
  on public.hostel_reactions
  for select
  using (true);

drop policy if exists "reactions full access for anon+auth" on public.hostel_reactions;
create policy "reactions full access for anon+auth"
  on public.hostel_reactions
  for all
  using (true)
  with check (true);

drop policy if exists "comments public read" on public.hostel_comments;
create policy "comments public read"
  on public.hostel_comments
  for select
  using (true);

drop policy if exists "comments full access for anon+auth" on public.hostel_comments;
create policy "comments full access for anon+auth"
  on public.hostel_comments
  for all
  using (true)
  with check (true);

drop policy if exists "shorts public read" on public.hostel_shorts;
create policy "shorts public read"
  on public.hostel_shorts
  for select
  using (true);

drop policy if exists "shorts full access for anon+auth" on public.hostel_shorts;
create policy "shorts full access for anon+auth"
  on public.hostel_shorts
  for all
  using (true)
  with check (true);
