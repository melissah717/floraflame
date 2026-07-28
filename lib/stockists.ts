/**
 * Stockist data + location helpers.
 *
 * SPREADSHEET SCHEMA — keep the column names identical to these field names
 * and the Google Sheets CSV maps straight onto this type with no translation
 * layer:
 *
 *   name | address | city | state | zip | lat | lng | status | phone | notes
 *
 * lat/lng are filled by the Apps Script — leave them blank while entering
 * data by hand.
 */

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
/* Google Sheets                                                       */
/* ------------------------------------------------------------------ */

/**
 * Parses one CSV line, respecting quoted fields.
 *
 * Google quotes any cell containing a comma — which is most addresses — so
 * a naive line.split(",") shreds the data. This walks character by character
 * and only treats commas outside quotes as separators.
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // A doubled quote inside a quoted field is an escaped quote.
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

const LOG = "[stockists]";

/**
 * Pull stockists from a published Google Sheet.
 *
 * SETUP
 *   Sheet → File → Share → Publish to web → Sheet1 → CSV → copy the URL,
 *   then set STOCKISTS_CSV_URL (in .env.local locally, and in Vercel's
 *   environment variables for production).
 *
 * EVERY PATH LOGS, INCLUDING SUCCESS.
 * The previous version returned placeholder data silently in two cases —
 * a body with under two lines, and zero parsed rows. Both are exactly the
 * failures worth knowing about, and both looked identical to success in the
 * build log. A fallback that hides why it fired is worse than a crash.
 *
 * These run at BUILD time, not runtime: the page is prerendered with
 * revalidate, so look in Vercel's Build Logs, not Runtime Logs.
 */
export async function fetchStockists(): Promise<Stockist[]> {
  const url = process.env.STOCKISTS_CSV_URL;

  if (!url) {
    console.warn(`${LOG} STOCKISTS_CSV_URL not set — using placeholders.`);
    return STOCKISTS;
  }

  try {
    // A stall (rather than an outright failure) can hang page generation
    // past Next's prerender watchdog. The timeout guarantees the catch
    // block actually gets a chance to fall back.
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`${LOG} HTTP ${res.status} ${res.statusText}`);
      return STOCKISTS;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    /**
     * The most common failure, and the sneakiest: when publish-to-web is
     * revoked, Google answers 200 with an HTML sign-in page. res.ok is true,
     * the body is a valid string, and the CSV parser just produces garbage —
     * so without this check it looks exactly like success.
     */
    if (!contentType.includes("csv") && raw.trimStart().startsWith("<")) {
      console.error(
        `${LOG} Expected CSV, got ${contentType || "unknown"}. ` +
          `Body starts: ${raw.slice(0, 120).replace(/\s+/g, " ")}`
      );
      console.error(
        `${LOG} Usually means publish-to-web was revoked. Re-publish: ` +
          `File → Share → Publish to web → Sheet1 → CSV.`
      );
      return STOCKISTS;
    }

    // Strip BOM, normalise Windows line endings.
    const csv = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    const lines = csv.trim().split("\n");

    if (lines.length < 2) {
      console.error(
        `${LOG} Only ${lines.length} line(s) — expected a header plus rows. ` +
          `Body: ${raw.slice(0, 200)}`
      );
      return STOCKISTS;
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

    // A publish URL pointing at the wrong tab is otherwise silent: you get
    // a perfectly valid CSV that happens to have none of the right columns.
    for (const required of ["name", "lat", "lng"]) {
      if (!headers.includes(required)) {
        console.error(
          `${LOG} No "${required}" column. Found: ${headers.join(", ")}. ` +
            `Check the publish URL points at the right tab.`
        );
        return STOCKISTS;
      }
    }

    const col = (row: string[], key: string) => {
      const i = headers.indexOf(key);
      return i === -1 ? "" : (row[i] ?? "").replace(/^"|"$/g, "").trim();
    };

    const parsed = lines
      .slice(1)
      .map(parseCsvLine)
      .map((row) => {
        const rawStatus = col(row, "status").toLowerCase();
        return {
          name: col(row, "name"),
          address: col(row, "address"),
          city: col(row, "city"),
          state: col(row, "state") || "CA",
          zip: col(row, "zip"),
          lat: Number(col(row, "lat")),
          lng: Number(col(row, "lng")),
          status: (["carrying", "restocking", "paused"].includes(rawStatus)
            ? rawStatus
            : "carrying") as Stockist["status"],
          phone: col(row, "phone") || undefined,
          notes: col(row, "notes") || undefined,
        };
      });

    // Rows without usable coordinates can't be sorted or pinned, so they're
    // dropped rather than rendered — a row mid-edit shouldn't break the page.
    const usable = parsed.filter(
      (s) =>
        s.name &&
        Number.isFinite(s.lat) &&
        Number.isFinite(s.lng) &&
        s.lat !== 0 &&
        s.lng !== 0
    );

    if (!usable.length) {
      console.error(
        `${LOG} Parsed ${parsed.length} row(s), none usable — every row is ` +
          `missing a name or coordinates. First: ${JSON.stringify(parsed[0])}`
      );
      return STOCKISTS;
    }

    const dropped = parsed.length - usable.length;
    if (dropped) {
      console.warn(`${LOG} ${dropped} row(s) skipped — missing coordinates.`);
    }

    console.log(`${LOG} Loaded ${usable.length} stockists from the sheet.`);
    return usable;
  } catch (err) {
    // Never let a sheet outage take the page down.
    console.error(`${LOG} Fetch threw:`, err);
    return STOCKISTS;
  }
}