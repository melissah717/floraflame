import { supabase } from "@/lib/supabase";
import { STOCKISTS, type Stockist } from "@/lib/stockists";

/*
 * Server-side only: the one place stockists are read from the database.
 * Import this from server components and pages, never from a file marked
 * "use client" (see the note at the top of lib/stockists.ts for why).
 */

const LOG = "[stockists]";

/**
 * Pull stockists from Supabase `stockists`, written from /admin/stockists.
 *
 * This used to read a published-to-web Google Sheet as CSV, with an Apps
 * Script bolted to the sheet to fill lat/lng. Both are gone: the admin
 * geocodes on save (see lib/admin/geocode.ts), and coordinates arrive in
 * the row already. The old path also had a failure mode worth not missing
 * — revoking publish-to-web made Google answer 200 with an HTML sign-in
 * page, which parsed into garbage rather than an error.
 *
 * EVERY PATH LOGS, INCLUDING SUCCESS. A fallback that hides why it fired
 * is worse than a crash, and these run at BUILD time (the page is
 * prerendered with revalidate), so look in Vercel's Build Logs.
 */
export async function fetchStockists(): Promise<Stockist[]> {
  const { data, error } = await supabase
    .from("stockists")
    .select("name, address, city, state, zip, lat, lng, status, phone, notes")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error(`${LOG} fetchStockists failed:`, error.message);
    return STOCKISTS;
  }

  const parsed: Stockist[] = (data ?? []).map((row) => ({
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state || "CA",
    zip: row.zip,
    lat: Number(row.lat),
    lng: Number(row.lng),
    status: (["carrying", "restocking", "paused"].includes(row.status)
      ? row.status
      : "carrying") as Stockist["status"],
    phone: row.phone || undefined,
    notes: row.notes || undefined,
  }));

  // Rows without usable coordinates can't be sorted or pinned, so they're
  // dropped rather than rendered. Geocoding is allowed to fail on save
  // (a typo'd address shouldn't block the write), so this stays.
  const usable = parsed.filter(
    (s) =>
      s.name &&
      Number.isFinite(s.lat) &&
      Number.isFinite(s.lng) &&
      s.lat !== 0 &&
      s.lng !== 0
  );

  if (parsed.length && !usable.length) {
    console.error(
      `${LOG} ${parsed.length} row(s), none usable — every row is missing ` +
        `coordinates. Re-save them in /admin/stockists to geocode.`
    );
    return STOCKISTS;
  }

  const dropped = parsed.length - usable.length;
  if (dropped) {
    console.warn(
      `${LOG} ${dropped} row(s) skipped — no coordinates. Re-save them in ` +
        `/admin/stockists to geocode.`
    );
  }

  console.log(`${LOG} Loaded ${usable.length} stockist(s).`);
  return usable;
}
