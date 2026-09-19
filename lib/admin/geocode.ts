import "server-only";

import { geocodeQuery } from "@/lib/stockists";

/**
 * Turn a stockist's address fields into coordinates at save time.
 *
 * This replaces the Apps Script that used to sit on the stockists sheet
 * and backfill lat/lng on a timer. Doing it on save means a new stockist
 * is pinnable the moment it's written, instead of whenever the script
 * next happened to run.
 *
 * Returns null rather than throwing: a typo'd address should leave the
 * row saved and unpinned (fetchStockists filters those out and says so in
 * the build log), not reject the write and lose what was typed.
 */
export async function geocodeStockist(fields: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): Promise<{ lat: number; lng: number } | null> {
  const query = [fields.address, fields.city, `${fields.state} ${fields.zip}`.trim()]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  if (!query) return null;

  const hit = await geocodeQuery(query);
  if (!hit) {
    console.warn(`[admin] Could not geocode: ${query}`);
    return null;
  }

  return { lat: hit.lat, lng: hit.lng };
}
