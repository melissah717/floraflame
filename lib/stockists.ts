/**
 * Stockist data + location helpers.
 *
 * Rows live in Supabase `stockists` and are edited at /admin/stockists.
 * lat/lng are geocoded from the address when the row is saved, so nothing
 * fills them in by hand.
 */

import { supabase } from "@/lib/supabase";

export type Stockist = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  status: "carrying" | "restocking" | "paused";
  phone?: string;
  notes?: string;
};

/** Placeholder rows. Only used when the sheet fetch fails — see below. */
export const STOCKISTS: Stockist[] = [
  {
    name: "Blue Fire",
    address: "1975 W Olive Ave",
    city: "Merced",
    state: "CA",
    zip: "95348",
    lat: 37.3115,
    lng: -120.4977,
    status: "carrying",
  },
  {
    name: "Flavors",
    address: "2213 Patterson Rd",
    city: "Riverbank",
    state: "CA",
    zip: "95367",
    lat: 37.7361,
    lng: -120.9355,
    status: "carrying",
  },
  {
    name: "Firehouse",
    address: "1601 W Main St",
    city: "Turlock",
    state: "CA",
    zip: "95380",
    lat: 37.4947,
    lng: -120.8666,
    status: "carrying",
  },
  {
    name: "Patient Care First",
    address: "1442 Angie Ave",
    city: "Modesto",
    state: "CA",
    zip: "95351",
    lat: 37.6193,
    lng: -121.0027,
    status: "carrying",
  },
];

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

/**
 * City centres for search. A lookup table, not a geocoding API — searches
 * resolve instantly, cost nothing, and work offline. California-only is a
 * small enough space to enumerate.
 *
 * Aliases matter more than you'd expect: people type "SF", not
 * "San Francisco". Add entries as you see real searches fail.
 */
export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  sf: { lat: 37.7749, lng: -122.4194 },
  "the city": { lat: 37.7749, lng: -122.4194 },
  oakland: { lat: 37.8044, lng: -122.2712 },
  berkeley: { lat: 37.8715, lng: -122.273 },
  "san jose": { lat: 37.3382, lng: -121.8863 },
  sacramento: { lat: 38.5816, lng: -121.4944 },
  sac: { lat: 38.5816, lng: -121.4944 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  la: { lat: 34.0522, lng: -118.2437 },
  "long beach": { lat: 33.7701, lng: -118.1937 },
  "san diego": { lat: 32.7157, lng: -117.1611 },
  fresno: { lat: 36.7378, lng: -119.7871 },
  modesto: { lat: 37.6391, lng: -120.9969 },
  stockton: { lat: 37.9577, lng: -121.2908 },
  merced: { lat: 37.3022, lng: -120.4829 },
  turlock: { lat: 37.4947, lng: -120.8466 },
  riverbank: { lat: 37.7361, lng: -120.9355 },
  chico: { lat: 39.7285, lng: -121.8375 },
  "santa cruz": { lat: 36.9741, lng: -122.0308 },
  "santa rosa": { lat: 38.4404, lng: -122.7141 },
  "palm springs": { lat: 33.8303, lng: -116.5453 },
  bakersfield: { lat: 35.3733, lng: -119.0187 },
  "san luis obispo": { lat: 35.2828, lng: -120.6596 },
  slo: { lat: 35.2828, lng: -120.6596 },
  eureka: { lat: 40.8021, lng: -124.1637 },
  "south lake tahoe": { lat: 38.9399, lng: -119.9772 },
  tahoe: { lat: 38.9399, lng: -119.9772 },
};

/**
 * Great-circle distance in miles (haversine).
 * Straight-line, not driving distance — fine for "which is nearest", not
 * for an ETA.
 */
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Turns a free-text query into a coordinate to measure from.
 * Order matters: named cities beat zip codes beat stockist-name matches,
 * because "Oakland" should mean the city even if a shop is called Oakland
 * Wellness.
 */
export function resolveQuery(
  query: string,
  stockists: Stockist[]
): { lat: number; lng: number } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (CITY_CENTERS[q]) return CITY_CENTERS[q];

  // Partial city match — "san fran" should still land
  const cityKey = Object.keys(CITY_CENTERS).find(
    (k) => k.startsWith(q) || q.startsWith(k)
  );
  if (cityKey) return CITY_CENTERS[cityKey];

  const byZip = stockists.find((s) => s.zip === q);
  if (byZip) return { lat: byZip.lat, lng: byZip.lng };

  const byCity = stockists.find((s) => s.city.toLowerCase().includes(q));
  if (byCity) return { lat: byCity.lat, lng: byCity.lng };

  const byName = stockists.find((s) => s.name.toLowerCase().includes(q));
  if (byName) return { lat: byName.lat, lng: byName.lng };

  return null;
}

/**
 * Resolve anything the local table doesn't know — zips, neighbourhoods,
 * street addresses — via Mapbox Geocoding.
 *
 * resolveQuery() stays the fast path: instant, free, and covers the common
 * searches. This only runs when that misses, so a typical search never
 * touches the network.
 *
 * bbox constrains results to California. Without it a bare zip can resolve
 * to another state and the nearest-shop list becomes nonsense.
 */
export async function geocodeQuery(
  query: string
): Promise<{ lat: number; lng: number; label: string } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !query.trim()) return null;

  const url =
    `https://api.mapbox.com/search/geocode/v6/forward` +
    `?q=${encodeURIComponent(query.trim())}` +
    `&access_token=${token}` +
    `&country=us` +
    `&limit=1` +
    `&bbox=-124.5,32.5,-114.1,42.1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const hit = data?.features?.[0];
    if (!hit?.geometry?.coordinates) return null;

    const [lng, lat] = hit.geometry.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const label =
      hit.properties?.name_preferred ||
      hit.properties?.name ||
      hit.properties?.place_formatted ||
      query.trim();

    return { lat, lng, label };
  } catch {
    return null;
  }
}

/** Sorts by distance from an origin, attaching the computed miles. */
export function sortByDistance(
  stockists: Stockist[],
  origin: { lat: number; lng: number }
): (Stockist & { miles: number })[] {
  return stockists
    .map((s) => ({ ...s, miles: distanceMiles(origin, s) }))
    .sort((a, b) => a.miles - b.miles);
}

/**
 * Stable identity for a shop. Name alone isn't unique — California Street
 * Cannabis has several entries — so coordinates are folded in. Used to match
 * a clicked list item to its map marker.
 */
export function stockistKey(s: Stockist): string {
  return `${s.name}|${s.lat}|${s.lng}`;
}

/** Google Maps directions link — opens the native app on mobile. */
export function directionsUrl(s: Stockist): string {
  const dest = encodeURIComponent(
    `${s.name}, ${s.address}, ${s.city}, ${s.state} ${s.zip}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

/* ------------------------------------------------------------------ */
/* Supabase                                                            */
/* ------------------------------------------------------------------ */

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
