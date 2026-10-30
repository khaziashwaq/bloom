-- Bloom: persistent storage for shared bouquets.
-- Run this once in the Supabase SQL editor, then set
--   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- and share links become short: https://your-site/b/<id>

create table if not exists public.bouquets (
  id text primary key check (id ~ '^[A-Za-z0-9]{6,24}$'),
  data jsonb not null check (pg_column_size(data) < 64000),
  created_at timestamptz not null default now()
);

alter table public.bouquets enable row level security;

-- Anyone may create a bouquet...
drop policy if exists "anyone can create bouquets" on public.bouquets;
create policy "anyone can create bouquets"
  on public.bouquets for insert
  to anon, authenticated
  with check (true);

-- ...but nobody can list or browse them. There is deliberately no SELECT
-- policy: a bouquet can only be opened by someone who knows its id,
-- through this function.
create or replace function public.get_bouquet(bouquet_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select data from public.bouquets where id = bouquet_id;
$$;

revoke all on function public.get_bouquet(text) from public;
grant execute on function public.get_bouquet(text) to anon, authenticated;
