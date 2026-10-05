/**
 * One-time migration: Google Sheets → Supabase.
 *
 * Reads the two sheets the site used to fetch at runtime (BLOG_URL and
 * STOCKISTS_CSV_URL) and writes them into `blog_posts` and `stockists`.
 * Run it once, confirm the rows look right in /admin, then delete those
 * two variables from .env.local and from Vercel.
 *
 *   node scripts/migrate-sheets.js            # dry run, prints what it would write
 *   node scripts/migrate-sheets.js --write    # actually writes
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in the environment. That key bypasses
 * row-level security, which is exactly why it lives here in a script you
 * run by hand and never in the app — nothing in app/ or lib/ reads it.
 * Grab it from Supabase → Project Settings → API → service_role, and pass
 * it inline rather than saving it:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ… node scripts/migrate-sheets.js --write
 *
 * Idempotent: posts upsert on `slug`, stockists are matched on
 * (name, address). Re-running updates rather than duplicating.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const WRITE = process.argv.includes("--write");
/*
 * --sql prints INSERT statements instead of writing over the network.
 * Paste them into the Supabase SQL editor and no service-role key is
 * needed anywhere — the editor already runs as the project owner. That
 * makes it the easier path for a one-off migration, and it means the
 * credential that bypasses RLS never has to leave the dashboard.
 */
const AS_SQL = process.argv.includes("--sql");

/*
 * Progress chatter goes to stderr in --sql mode so `> file.sql` captures
 * the statements and nothing else. Without this the file opens with
 * "1 post(s) parsed." and Postgres rejects the whole paste.
 */
const info = (...args) => (AS_SQL ? console.error(...args) : console.log(...args));

/** Postgres string literal: double the single quotes, or NULL. */
function q(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function num(value) {
  return value == null || !Number.isFinite(value) ? "NULL" : String(value);
}
const MAX_PARAGRAPHS = 10;

/* ── env ────────────────────────────────────────────────────────────── */

// The script runs outside Next, so .env.local isn't loaded for us.
function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) fatal("NEXT_PUBLIC_SUPABASE_URL is not set.");

// Only the --write pass needs a write credential. A dry run just reads the
// two sheets, so it should work with nothing but the sheet URLs — that's
// the run you want to be able to do freely before committing to anything.
if (WRITE && !SERVICE_KEY) {
  fatal(
    "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
      "  Supabase → Project Settings → API → service_role, then:\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=… node scripts/migrate-sheets.js --write"
  );
}

const supabase = SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

function fatal(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/* ── CSV ────────────────────────────────────────────────────────────── */

/**
 * Same parser the app used to ship in lib/csv.ts, inlined here because
 * that file went away with the sheets. Google quotes any cell containing a
 * comma, so a naive split(",") shreds addresses and paragraph bodies.
 */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function csvUrlFrom(sheetUrl) {
  const id = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!id) return null;
  const gid = sheetUrl.match(/gid=(\d+)/);
  return `https://docs.google.com/spreadsheets/d/${id[1]}/export?format=csv&gid=${
    gid ? gid[1] : "0"
  }`;
}

async function fetchSheet(label, rawUrl) {
  if (!rawUrl) {
    info(`  – ${label}: no URL set, skipping.`);
    return null;
  }

  /*
   * Two URL shapes are in play and they need opposite handling:
   *
   *   publish-to-web  …/spreadsheets/d/e/2PACX-…/pub?…&output=csv  — already CSV
   *   a share link    …/spreadsheets/d/{id}/edit?gid=0            — needs /export
   *
   * Checking for CSV-ness first matters: the /d/e/ form still matches the
   * "/d/(something)" pattern, so rewriting it scrapes out a sheet id of
   * literally "e" and 404s.
   */
  const alreadyCsv = rawUrl.includes("output=csv") || rawUrl.includes("/export?");
  const url = alreadyCsv ? rawUrl : csvUrlFrom(rawUrl);
  if (!url) fatal(`${label}: couldn't parse a sheet id out of ${rawUrl}`);

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) fatal(`${label}: HTTP ${res.status} ${res.statusText}`);

  const body = await res.text();
  // Private sheets answer 200 with an HTML sign-in page, which parses into
  // garbage rather than failing — the same trap the old runtime code had.
  if (body.trimStart().startsWith("<")) {
    fatal(
      `${label}: got HTML, not CSV. The sheet's sharing is probably not ` +
        `"Anyone with the link can view".`
    );
  }

  const lines = body
    .replace(/^﻿/, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n");

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const get = (key) => {
      const i = headers.indexOf(key);
      return i === -1 ? "" : (cells[i] ?? "").replace(/^"|"$/g, "").trim();
    };
    return get;
  });

  return { headers, rows };
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ── posts ──────────────────────────────────────────────────────────── */

async function migratePosts() {
  info("\nBlog posts");
  const sheet = await fetchSheet("BLOG_URL", process.env.BLOG_URL);
  if (!sheet) return;

  if (!sheet.headers.includes("title")) {
    fatal(`BLOG_URL: no "title" column. Found: ${sheet.headers.join(", ")}`);
  }

  const seen = new Set();
  const posts = [];

  for (const get of sheet.rows) {
    const title = get("title");
    if (!title) continue;

    const slug = slugify(title);
    if (seen.has(slug)) {
      console.warn(`  ! duplicate slug "${slug}" (from "${title}") — skipped.`);
      continue;
    }
    seen.add(slug);

    const paragraphs = [];
    for (let p = 1; p <= MAX_PARAGRAPHS; p++) {
      const entry = {
        title: get(`p${p} title`),
        image: get(`p${p} image`),
        body: get(`p${p} body`),
      };
      if (entry.title || entry.image || entry.body) paragraphs.push(entry);
    }

    posts.push({
      slug,
      title,
      bucket: get("bucket") || "General",
      hero_image: get("hero image") || null,
      blurb: get("blurb") || null,
      paragraphs,
      // Everything already in the sheet was live, so it stays live.
      published: true,
      sort_order: posts.length,
    });
  }

  info(`  ${posts.length} post(s) parsed.`);
  for (const post of posts) {
    info(`    · ${post.title} (${post.bucket}, ${post.paragraphs.length} sections)`);
  }

  if (AS_SQL && posts.length) {
    console.log("\n-- ── blog_posts ──────────────────────────────────────");
    for (const p of posts) {
      console.log(
        `insert into public.blog_posts (slug, title, bucket, hero_image, blurb, paragraphs, published, sort_order) values (` +
          `${q(p.slug)}, ${q(p.title)}, ${q(p.bucket)}, ${q(p.hero_image)}, ${q(p.blurb)}, ` +
          `${q(JSON.stringify(p.paragraphs))}::jsonb, ${p.published}, ${p.sort_order})\n` +
          `on conflict (slug) do update set title = excluded.title, bucket = excluded.bucket, ` +
          `hero_image = excluded.hero_image, blurb = excluded.blurb, ` +
          `paragraphs = excluded.paragraphs, published = excluded.published, ` +
          `sort_order = excluded.sort_order;`
      );
    }
    return;
  }

  if (!WRITE || !posts.length) return;

  const { error } = await supabase
    .from("blog_posts")
    .upsert(posts, { onConflict: "slug" });

  if (error) fatal(`blog_posts upsert failed: ${error.message}`);
  console.log(`  ✓ wrote ${posts.length} post(s).`);
}

/* ── stockists ──────────────────────────────────────────────────────── */

async function migrateStockists() {
  info("\nStockists");
  const sheet = await fetchSheet("STOCKISTS_CSV_URL", process.env.STOCKISTS_CSV_URL);
  if (!sheet) return;

  if (!sheet.headers.includes("name")) {
    fatal(`STOCKISTS_CSV_URL: no "name" column. Found: ${sheet.headers.join(", ")}`);
  }

  const stockists = [];

  for (const get of sheet.rows) {
    const name = get("name");
    if (!name) continue;

    const lat = Number(get("lat"));
    const lng = Number(get("lng"));
    const status = get("status").toLowerCase();

    stockists.push({
      name,
      address: get("address"),
      city: get("city"),
      state: get("state") || "CA",
      zip: get("zip"),
      // The Apps Script already geocoded these; carry them over rather than
      // re-geocoding and burning Mapbox calls on rows that are already fine.
      lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
      lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
      status: ["carrying", "restocking", "paused"].includes(status) ? status : "carrying",
      phone: get("phone") || null,
      notes: get("notes") || null,
      sort_order: stockists.length,
    });
  }

  const unpinned = stockists.filter((s) => s.lat == null).length;
  info(`  ${stockists.length} stockist(s) parsed.`);

  /*
   * The write path below matches on (name, address) because the table has
   * no natural unique key. That means two sheet rows sharing BOTH would
   * collapse into one row — which is the right call for an accidental
   * duplicate and the wrong one for two real locations, so say which this
   * is rather than quietly picking.
   */
  const byKey = new Map();
  for (const s of stockists) {
    const key = `${s.name}|${s.address}`.toLowerCase();
    byKey.set(key, (byKey.get(key) ?? 0) + 1);
  }
  const collisions = [...byKey.entries()].filter(([, n]) => n > 1);
  if (collisions.length) {
    info(
      `  ! ${collisions.length} duplicate name+address pair(s) — these MERGE into ` +
        `one row each on write:`
    );
    for (const [key, n] of collisions) {
      info(`      ${key.split("|")[0]} ×${n}`);
    }
  }

  if (unpinned) {
    info(
      `  ! ${unpinned} without coordinates — open each in /admin/stockists and ` +
        `save to geocode.`
    );
  }
  for (const s of stockists) {
    info(`    · ${s.name} — ${s.city}, ${s.state}${s.lat == null ? "  (no pin)" : ""}`);
  }

  if (AS_SQL && stockists.length) {
    console.log("\n-- ── stockists ───────────────────────────────────────");
    // No unique key on this table, so clear and reinsert rather than
    // upsert — keeps a second paste from duplicating all 45 rows.
    console.log("delete from public.stockists;");
    for (const s of stockists) {
      console.log(
        `insert into public.stockists (name, address, city, state, zip, lat, lng, status, phone, notes, sort_order) values (` +
          `${q(s.name)}, ${q(s.address)}, ${q(s.city)}, ${q(s.state)}, ${q(s.zip)}, ` +
          `${num(s.lat)}, ${num(s.lng)}, ${q(s.status)}, ${q(s.phone)}, ${q(s.notes)}, ${s.sort_order});`
      );
    }
    return;
  }

  if (!WRITE || !stockists.length) return;

  // No natural unique key on this table, so match on (name, address) and
  // update in place. Keeps a second run from duplicating every row.
  for (const stockist of stockists) {
    const { data: existing } = await supabase
      .from("stockists")
      .select("id")
      .eq("name", stockist.name)
      .eq("address", stockist.address)
      .maybeSingle();

    const { error } = existing
      ? await supabase.from("stockists").update(stockist).eq("id", existing.id)
      : await supabase.from("stockists").insert(stockist);

    if (error) fatal(`stockists write failed for "${stockist.name}": ${error.message}`);
  }

  console.log(`  ✓ wrote ${stockists.length} stockist(s).`);
}

/* ── run ────────────────────────────────────────────────────────────── */

if (!AS_SQL) {
  console.log(
    WRITE
      ? "Migrating sheets → Supabase."
      : "DRY RUN — nothing will be written. Re-run with --write to commit."
  );
}

await migratePosts();
await migrateStockists();

if (!AS_SQL) {
  console.log(
    WRITE
      ? "\nDone. Check /admin, then remove BLOG_URL and STOCKISTS_CSV_URL from .env.local and Vercel.\n"
      : "\nDry run complete. Re-run with --write when this looks right.\n"
  );
}
