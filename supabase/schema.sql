-- Drop batches — one row per harvest/COA batch of a strain.
--
-- A strain (e.g. "Crunch Berries") can have multiple rows over time as new
-- batches come through the lab. `is_current` marks which batch is the one
-- shown in the "Latest Drops" section on the homepage; everything else is
-- what the /archive page lists, newest (by collected_at) first.
--
-- Run this whole file once in the Supabase SQL editor (Project -> SQL
-- Editor -> New query) to create the table, lock it to public read-only
-- access, and seed it with the 7 strains currently live on the site.

create table if not exists public.drop_batches (
  id bigint generated always as identity primary key,

  -- Identity / grouping
  slug text not null,                -- e.g. "crunch-berries" — shared across a strain's batches
  name text not null,                -- e.g. "Crunch Berries"

  -- Profile (mostly stable across a strain's batches, but stored per-row
  -- so a future re-cross or rename doesn't have to touch old history)
  spectrum text not null check (
    spectrum in (
      'Indica',
      'Indica-Leaning Hybrid',
      'Balanced Hybrid',
      'Sativa-Leaning Hybrid',
      'Sativa'
    )
  ),
  image text not null,               -- product photo path/URL
  tags text[] not null default '{}', -- flavor/effect chips
  description text not null,
  genetics text,                     -- e.g. "Zkittlez x Do-Si-Dos"
  terpenes text[],                   -- dominant terpenes, descending order
  ideal_time text,                   -- e.g. "Evening", "Before bed"

  -- Per-batch lab data
  thc_percent numeric(4, 1),         -- e.g. 19.8
  lab_report_url text,               -- COA PDF
  batch_number text,                 -- e.g. "CB040326", from METRC/COA
  produced_at date,
  collected_at date,
  completed_at date,

  -- Which batch is "the" current drop for this strain on the homepage
  is_current boolean not null default false,

  created_at timestamptz not null default now()
);

-- If you already ran an earlier version of this file that had quarter/year
-- columns, this drops them; harmless no-op on a fresh install.
alter table public.drop_batches drop column if exists quarter;
alter table public.drop_batches drop column if exists year;

-- Anyone can read (the site fetches this with the public anon key);
-- nobody can write through the app. Add/edit batches from the Supabase
-- table editor or a service-role script, same trust model as editing the
-- blog's Google Sheet by hand.
alter table public.drop_batches enable row level security;

drop policy if exists "Public can read drop batches" on public.drop_batches;
create policy "Public can read drop batches"
  on public.drop_batches
  for select
  to anon, authenticated
  using (true);

-- Seed: the 7 strains currently hardcoded in lib/strains.ts, as their
-- most recent (and only, so far) batch. Photos are hosted on Cloudinary;
-- lab_report_url still points at the existing /public/lab-reports PDFs —
-- swap for a hosted URL if you move those off the repo later.
insert into public.drop_batches
  (slug, name, spectrum, image, tags, description, genetics, terpenes, ideal_time,
   thc_percent, lab_report_url, batch_number, produced_at, collected_at, completed_at,
   is_current)
values
  (
    'crunch-berries', 'Crunch Berries', 'Indica',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465450/Crunch_Berries_uw9pkj.png',
    array['Berry', 'Dessert', 'Relaxing'],
    'A dessert-leaning indica with a jammy berry nose and a slow, heavy-lidded body high built for the end of the day. Caryophyllene, limonene, and myrcene lead a terpene profile that reads more cinnamon and pine than the name lets on.',
    'Gassius Clay x Billy Kimber x Sweet Retreat',
    array['Caryophyllene', 'Limonene', 'Myrcene', 'Linalool', 'Humulene'],
    'Evenings',
    19.8, '/lab-reports/crunch_berries_lab.pdf', 'CB040326',
    '2026-03-23', '2026-04-03', '2026-04-08',
    true
  ),
  (
    'donny-burger', 'Donny Burger', 'Indica-Leaning Hybrid',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465451/Donny_Burger_lgppcw.png',
    array['Savory', 'Gassy', 'Heavy'],
    'Burger lineage through and through — funky and savory, built for couch-lock rather than conversation. Myrcene and limonene do most of the work behind that funk.',
    'GMO x Han Solo Burger',
    array['Myrcene', 'Limonene', 'Caryophyllene', 'Linalool', 'Pinene', 'Humulene'],
    'Before bed',
    30.3, '/lab-reports/donny_burger_lab.pdf', '041626DB',
    '2026-03-23', '2026-04-16', '2026-04-20',
    true
  ),
  (
    'gg4', 'GG4', 'Indica',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465452/GG4_w4rfte.png',
    array['Diesel', 'Earthy', 'Potent'],
    'The strain that needs no introduction: sticky, diesel-heavy, and reliably one of the stronger jars on the shelf. Caryophyllene and limonene carry the diesel-and-cinnamon nose lab results back up.',
    'Chem''s Sister x Sour Dubb x Chocolate Diesel',
    array['Caryophyllene', 'Limonene', 'Myrcene', 'Humulene', 'Linalool'],
    'Before bed, weekends',
    23.0, '/lab-reports/gorilla_glue_lab.pdf', 'GG040326',
    null, '2026-04-02', '2026-04-08',
    true
  ),
  (
    'moonbow', 'Moonbow', 'Indica-Leaning Hybrid',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465455/Moonbow_rbrofk.png',
    array['Fruity', 'Balanced', 'Uplifting'],
    'A true middle-of-the-road hybrid — bright fruit up front, with a calm, even effect that doesn''t tip too far either way, despite being one of the stronger jars on the shelf.',
    'Zkittlez x Do-Si-Dos',
    array['Caryophyllene', 'Limonene', 'Myrcene', 'Linalool'],
    'Evening',
    32.8, '/lab-reports/moonbow_lab.pdf', 'MB5132026',
    null, '2026-05-13', '2026-05-18',
    true
  ),
  (
    'jammerz', 'Jammerz', 'Sativa-Leaning Hybrid',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465454/Jammerz_pkrmau.png',
    array['Tropical', 'Sweet', 'Social'],
    'Sweet and tropical with just enough lift to keep a conversation going without losing the thread — currently the most potent jar on the shelf.',
    null, null, null,
    34.1, '/lab-reports/jammerz_lab.pdf', 'MZ5132026',
    null, '2026-05-13', '2026-05-18',
    true
  ),
  (
    'guavanade', 'Guavanade', 'Indica-Leaning Hybrid',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465453/Guavanade_uvbyjk.png',
    array['Citrus', 'Tart', 'Energizing'],
    'Guava and lemonade in name and in nose — tart, juicy, and leaning toward the brighter, more energetic side of the shelf. Limonene leads the terpene profile by a wide margin, which tracks.',
    'Gelonade x Sherb BX',
    array['Limonene', 'Myrcene', 'Linalool', 'Pinene'],
    'Evening, after work',
    18.1, '/lab-reports/guavanade_lab.pdf', 'GN040326',
    '2026-03-23', '2026-04-03', '2026-04-08',
    true
  ),
  (
    'super-silver-haze', 'Super Silver Haze', 'Sativa',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465456/Super_Silver_Haze_ee00qh.png',
    array['Haze', 'Sativa', 'Cerebral'],
    'A classic haze — sharp and cerebral, built for daytime, with the lineage to back up the name. Terpinolene leads by a wide margin here, the terpene behind that sharp, turpentine-and-pine edge.',
    'Skunk x Northern Lights x Haze',
    array['Terpinolene', 'Ocimene', 'Caryophyllene', 'Myrcene'],
    'Mornings',
    25.0, '/lab-reports/super_silver_haze_lab.pdf', 'SSH040326',
    '2026-03-23', '2026-04-03', '2026-04-08',
    true
  );
