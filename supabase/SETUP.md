# Admin setup

One-time. Takes about ten minutes, and steps 1–3 have to happen before
`/admin` will let you in.

## 1. Create the tables

Supabase → SQL Editor → New query → paste **`supabase/admin-schema.sql`** →
Run.

It's idempotent, so re-running after an edit is safe. It creates
`admin_users`, `blog_posts` and `stockists`, and adds admin-only write
policies to those plus the existing `drop_batches`.

## 2. Create your login

Supabase → Authentication → Users → **Add user**.

Tick **Auto Confirm User** — otherwise Supabase sends a confirmation email
and the account can't sign in until someone clicks it.

## 3. Put yourself on the allowlist

Being a Supabase user is not the same as being an admin. Back in the SQL
editor, with your address:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;
```

You should now be able to sign in at `/admin/login`.

> Nothing grants write access except a row in this table. That's why
> leaving signups enabled in the Supabase dashboard isn't a way in on its
> own — a new account lands with no allowlist row and gets bounced.

## 4. Move the Google Sheets over

A dry run first — it only reads the sheets and needs no credentials:

```bash
node scripts/migrate-sheets.js
```

Check the counts and names it prints. Then pick one of two ways to commit.

**Via the SQL editor (easier — no credentials anywhere).** Regenerate the
statements and paste them into Supabase → SQL Editor, same as the schema:

```bash
node scripts/migrate-sheets.js --sql > supabase/migrate-data.sql
```

The editor already runs as the project owner, so the key that bypasses
row-level security never has to leave the dashboard.

**Or straight over the network**, with the service-role key inline
(Supabase → Project Settings → API → `service_role`):

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ… node scripts/migrate-sheets.js --write
```

That key bypasses row-level security, which is why it's only ever used by
this script, run by hand. Nothing in `app/` or `lib/` reads it — don't add
it to `.env.local` or Vercel.

Re-running either is safe: posts upsert on `slug`, and the SQL path clears
`stockists` before reinserting rather than duplicating all 45.

## 5. Clean up

Once `/admin` shows the migrated content:

- Delete `BLOG_URL` and `STOCKISTS_CSV_URL` from `.env.local` **and** from
  Vercel's environment variables. Nothing reads them any more.
- Delete the Apps Script attached to the stockists sheet — the admin
  geocodes on save now, so it would only fight with it.
- Keep the sheets themselves around read-only for a while as a backup.

## Where things live now

| Content | Table | Edited at |
| --- | --- | --- |
| Strains / drop batches | `drop_batches` | `/admin/strains` |
| Blog posts | `blog_posts` | `/admin/posts` |
| Stockists | `stockists` | `/admin/stockists` |

"Latest" on the homepage is the `is_current` flag on a batch — toggle it
straight from the list at `/admin/strains`.

Saving anything calls `revalidatePath()` for the public pages it affects,
so edits show up in under a minute rather than waiting out the hour-long
`revalidate` window.
