-- ─────────────────────────────────────────────────────────────────────────
-- events — the /events page, edited at /admin/events
-- ─────────────────────────────────────────────────────────────────────────
--
-- Run once in Supabase → SQL Editor, after admin-schema.sql (it uses the
-- is_admin() and touch_updated_at() functions defined there). Safe to
-- re-run: every statement is idempotent, and the seed row is skipped if
-- an event with that slug already exists.
--
-- Same trust model as the other tables: the public (anon) key can only
-- read published rows; writes need a signed-in user on admin_users.

create table if not exists public.events (
  id bigint generated always as identity primary key,

  slug text not null unique,          -- anchor on /events, e.g. #dabsgiving-2026
  title text not null,
  kind text,                          -- "Pop-up", "Lounge sesh", shown by the date

  -- Null while the date isn't confirmed; the page then shows date_label.
  starts_at timestamptz,
  ends_at timestamptz,
  date_label text,

  venue_name text,
  venue_address text,
  venue_city text,

  -- Paragraphs separated by a blank line.
  description text not null default '',

  poster text,                        -- Cloudinary URL, portrait 4:5
  poster_alt text,

  link_label text,                    -- "RSVP", "Tickets"
  link_url text,

  -- Drafts are invisible to the public policy below, so an event can be
  -- saved before it's ready to announce.
  published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_ends_after_start
    check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

alter table public.events enable row level security;

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

create index if not exists events_starts_at_idx on public.events (starts_at);

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
  on public.events
  for select
  to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "Admins can write events" on public.events;
create policy "Admins can write events"
  on public.events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- The first event, so the page isn't empty the moment this runs.
insert into public.events (
  slug, title, kind, starts_at, ends_at,
  venue_name, venue_address, venue_city,
  description, published
) values (
  'dabsgiving-2026',
  'Lady Namastizzle’s DabsGiving 2026',
  'Pop-up',
  '2026-11-21 14:00:00-08',
  '2026-11-21 19:00:00-08',
  'Moe Greens Dispensary & Lounge',
  '1276 Market St',
  'San Francisco',
  E'A dab bar takeover at Moe Greens’ lounge, hosted by Lady Namastizzle and featuring Dr. Dabber and Sluggers. Flora & Flame will be there alongside Space Gem and Kikoko, with music from Made By Harry & Geo.\n\n21+ with valid ID.',
  true
)
on conflict (slug) do nothing;
