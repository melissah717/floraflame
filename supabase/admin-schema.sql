-- Admin schema — everything the /admin pages read and write.
--
-- Run this whole file once in the Supabase SQL editor (Project -> SQL
-- Editor -> New query). It is idempotent: safe to re-run after an edit.
--
-- What it does:
--   1. Creates an `admin_users` allowlist, keyed to Supabase Auth users.
--   2. Creates `blog_posts` and `stockists` — the two tables that replace
--      the Google Sheets (see lib/blog.ts, lib/stockists.ts).
--   3. Opens a WRITE path on all three content tables, but only for rows
--      in the allowlist. Public read access is unchanged.
--
-- TRUST MODEL — worth reading before you change a policy.
--
-- The site reads with the public anon key, which ships to the browser.
-- That is fine because every policy below grants anon SELECT only. Writes
-- require a JWT whose `auth.uid()` appears in `admin_users`, so being a
-- signed-in Supabase user is NOT enough on its own — someone would have to
-- be added to the allowlist by hand. That means leaving signups enabled in
-- the Supabase dashboard is not, by itself, a way in.


-- ─────────────────────────────────────────────────────────────────────────
-- 1. Admin allowlist
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

/*
 * `is_admin()` is what every write policy below calls.
 *
 * SECURITY DEFINER is required, not a shortcut: the policies on
 * admin_users would otherwise be re-evaluated while we are in the middle
 * of evaluating a policy, which recurses. Running the lookup as the
 * function owner sidesteps that.
 *
 * search_path is pinned to empty and every name below is schema-qualified,
 * so a caller cannot shadow `admin_users` with a table of their own and
 * talk their way into a true.
 */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

-- An admin can see the allowlist (the /admin header shows who you are).
-- Nobody can write it from the app — add and remove admins from the
-- Supabase table editor, deliberately.
drop policy if exists "Admins can read the allowlist" on public.admin_users;
create policy "Admins can read the allowlist"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────
-- 2. Shared updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ─────────────────────────────────────────────────────────────────────────
-- 3. blog_posts — replaces the BLOG_URL Google Sheet
-- ─────────────────────────────────────────────────────────────────────────
--
-- The sheet had one row per post with P1..P10 Title/Body/Image columns
-- flattened across it. Here those are a single jsonb array of
-- {title, image, body} objects, so a post isn't capped at ten paragraphs
-- and empty middle slots aren't a thing that can happen.

create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,

  slug text not null unique,          -- URL segment under /learn/the-knowledge
  title text not null,
  bucket text not null default 'General',  -- section heading posts group under
  hero_image text,                    -- Cloudinary URL
  blurb text,

  -- [{ "title": "...", "image": "...", "body": "..." }, ...]
  paragraphs jsonb not null default '[]'::jsonb,

  -- Draft posts are invisible to the public policy below, so a half-written
  -- post can be saved without going live.
  published boolean not null default false,

  -- Ascending. Controls order within a bucket, and the order buckets
  -- themselves first appear on the index page.
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();

create index if not exists blog_posts_order_idx
  on public.blog_posts (sort_order, id);

-- Public sees published posts only.
drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "Admins can write posts" on public.blog_posts;
create policy "Admins can write posts"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────
-- 4. stockists — replaces the STOCKISTS_CSV_URL Google Sheet
-- ─────────────────────────────────────────────────────────────────────────
--
-- lat/lng were filled in by an Apps Script attached to the sheet. The admin
-- now geocodes on save instead (see lib/admin/geocode.ts), so they arrive
-- already populated — but they stay nullable, because a save should not
-- fail just because Mapbox didn't recognise an address.

create table if not exists public.stockists (
  id bigint generated always as identity primary key,

  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip text not null,

  lat double precision,
  lng double precision,

  status text not null default 'carrying'
    check (status in ('carrying', 'restocking', 'paused')),

  phone text,
  notes text,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stockists enable row level security;

drop trigger if exists stockists_touch_updated_at on public.stockists;
create trigger stockists_touch_updated_at
  before update on public.stockists
  for each row execute function public.touch_updated_at();

create index if not exists stockists_order_idx
  on public.stockists (sort_order, name);

drop policy if exists "Public can read stockists" on public.stockists;
create policy "Public can read stockists"
  on public.stockists
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can write stockists" on public.stockists;
create policy "Admins can write stockists"
  on public.stockists
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────
-- 5. drop_batches — add the write path
-- ─────────────────────────────────────────────────────────────────────────
--
-- The table and its public SELECT policy are created by schema.sql; this
-- only adds the admin write policy that file deliberately left out back
-- when batches were edited from the Supabase table editor.

drop policy if exists "Admins can write drop batches" on public.drop_batches;
create policy "Admins can write drop batches"
  on public.drop_batches
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- `updated_at` didn't exist on drop_batches — the admin's list view sorts
-- by it so the thing you just edited is easy to find again.
alter table public.drop_batches
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists drop_batches_touch_updated_at on public.drop_batches;
create trigger drop_batches_touch_updated_at
  before update on public.drop_batches
  for each row execute function public.touch_updated_at();


-- ─────────────────────────────────────────────────────────────────────────
-- 6. Make yourself an admin
-- ─────────────────────────────────────────────────────────────────────────
--
-- Create the user first: Supabase dashboard -> Authentication -> Users ->
-- Add user -> "Auto Confirm User" checked, so there's no email to click.
-- Then run this with that address to put them on the allowlist.
--
--   insert into public.admin_users (user_id, email)
--   select id, email from auth.users where email = 'you@example.com'
--   on conflict (user_id) do nothing;
