-- Optional: fake batches for previewing what a NOT-in-rotation strain
-- looks like on /archive. Not part of the real catalog — slugs/names are
-- prefixed "test-" / "(Test)" so they're unmistakable and easy to find.
--
-- Run in Supabase SQL Editor -> New query. Delete the query at the
-- bottom whenever you're done previewing.

insert into public.drop_batches
  (slug, name, spectrum, image, tags, description, genetics, terpenes, ideal_time,
   thc_percent, lab_report_url, batch_number, produced_at, collected_at, completed_at,
   is_current)
values
  (
    'test-placeholder-one', 'Placeholder One (Test)', 'Balanced Hybrid',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465455/Moonbow_rbrofk.png',
    array['Placeholder', 'Test'],
    'Fake archive row for previewing the archived (not-in-rotation) card state. Safe to delete.',
    null, null, null,
    22.5, null, 'TEST-0001',
    '2025-11-01', '2025-11-08', '2025-11-12',
    false
  ),
  (
    'test-placeholder-two', 'Placeholder Two (Test)', 'Sativa',
    'https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465456/Super_Silver_Haze_ee00qh.png',
    array['Placeholder', 'Test'],
    'Second fake archive row — same purpose as the first, just so the "Full archive" grid has more than one non-current thumbnail to look at.',
    null, null, null,
    17.2, null, 'TEST-0002',
    '2025-09-14', '2025-09-20', '2025-09-25',
    false
  );

-- Cleanup — run this whenever you're done previewing:
-- delete from public.drop_batches where slug like 'test-placeholder-%';
