import { supabase } from "@/lib/supabase"

/**
 * Events for /events.
 *
 * They live in the Supabase `events` table and are edited at
 * /admin/events (see supabase/events.sql for the table). If that fetch
 * fails, for example before the table has been created, the page falls
 * back to the hand-written EVENTS list below, so it never renders empty
 * because of an outage.
 *
 * Only a title is required. Anything left blank shows a sensible
 * stand-in ("Time to be announced", a typographic poster instead of an
 * image). Search engines only get Event structured data once an event
 * has a real start time and venue, because Google rejects an Event
 * without them.
 */

export type SiteEvent = {
  /** URL-safe id, unique. Used for the anchor link to the event. */
  slug: string
  title: string
  /** Short type shown beside the date, e.g. "Pop-up" or "Lounge sesh". */
  kind?: string | null
  /** Start as an ISO date-time. Null while the date isn't confirmed. */
  startsAt: string | null
  /** Optional end, same format. Used to decide when an event is past. */
  endsAt?: string | null
  /**
   * What to show for the date when `startsAt` is null, e.g.
   * "Thanksgiving week". Ignored once `startsAt` is set.
   */
  dateLabel?: string | null
  venue: {
    name: string
    address?: string | null
    city: string
  } | null
  /** One or two short paragraphs. */
  description: string[]
  /** Poster image URL. Portrait 4:5 looks best. */
  poster: string | null
  posterAlt?: string | null
  /** RSVP, tickets or the venue's own event page. */
  link?: { label: string; href: string } | null
}

/** Fallback only: what the page shows if the database can't be reached. */
export const EVENTS: SiteEvent[] = [
  {
    slug: "dabsgiving-2026",
    title: "Lady Namastizzle’s DabsGiving 2026",
    kind: "Pop-up",
    startsAt: "2026-11-21T14:00:00-08:00",
    endsAt: "2026-11-21T19:00:00-08:00",
    venue: {
      name: "Moe Greens Dispensary & Lounge",
      address: "1276 Market St",
      city: "San Francisco",
    },
    description: [
      "A dab bar takeover at Moe Greens’ lounge, hosted by Lady Namastizzle and featuring Dr. Dabber and Sluggers. Flora & Flame will be there alongside Space Gem and Kikoko, with music from Made By Harry & Geo.",
      "21+ with valid ID.",
    ],
    poster: null,
    link: null,
  },
]

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

const LOG = "[events]"

export const EVENT_COLUMNS =
  "slug, title, kind, starts_at, ends_at, date_label, venue_name, venue_address, venue_city, description, poster, poster_alt, link_label, link_url"

export type EventRow = {
  slug: string
  title: string
  kind: string | null
  starts_at: string | null
  ends_at: string | null
  date_label: string | null
  venue_name: string | null
  venue_address: string | null
  venue_city: string | null
  description: string | null
  poster: string | null
  poster_alt: string | null
  link_label: string | null
  link_url: string | null
}

/** Paragraphs are stored as one text field, separated by blank lines. */
export function splitParagraphs(text: string | null | undefined) {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function rowToEvent(row: EventRow): SiteEvent {
  return {
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    dateLabel: row.date_label,
    venue: row.venue_name
      ? {
          name: row.venue_name,
          address: row.venue_address,
          city: row.venue_city ?? "",
        }
      : null,
    description: splitParagraphs(row.description),
    poster: row.poster,
    posterAlt: row.poster_alt,
    link: row.link_url
      ? { label: row.link_label || "Details", href: row.link_url }
      : null,
  }
}

/**
 * Published events. Drafts are filtered out by the table's row-level
 * security policy, not here, so a draft can't leak through a query that
 * forgets to filter.
 */
export async function getEvents(): Promise<SiteEvent[]> {
  const { data, error } = await supabase.from("events").select(EVENT_COLUMNS)

  if (error) {
    console.error(
      `${LOG} getEvents failed, using the fallback list:`,
      error.message
    )
    return EVENTS
  }

  return ((data ?? []) as EventRow[]).map(rowToEvent)
}

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

/**
 * An event counts as past once its end (or, without one, its start plus
 * a day) is behind us. Undated events always count as upcoming: they're
 * announcements of something that hasn't been scheduled yet.
 */
export function isPast(event: SiteEvent, now = new Date()) {
  if (!event.startsAt) return false
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(new Date(event.startsAt).getTime() + 24 * 60 * 60 * 1000)
  return end < now
}

/** Upcoming soonest-first (undated last), past most-recent-first. */
export function splitEvents(events: SiteEvent[], now = new Date()) {
  const time = (e: SiteEvent) =>
    e.startsAt ? new Date(e.startsAt).getTime() : Infinity
  const upcoming = events
    .filter((e) => !isPast(e, now))
    .sort((a, b) => time(a) - time(b))
  const past = events
    .filter((e) => isPast(e, now))
    .sort((a, b) => time(b) - time(a))
  return { upcoming, past }
}

/* ------------------------------------------------------------------ */
/* Pacific time                                                        */
/* ------------------------------------------------------------------ */

/** Every event is in California, so every time is shown in Pacific. */
export const EVENT_TZ = "America/Los_Angeles"

/** Minutes the zone is ahead of UTC at that instant (-480 for PST). */
function zoneOffsetMinutes(date: Date, timeZone = EVENT_TZ) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  )
  return Math.round((wall - date.getTime()) / 60000)
}

/**
 * A Pacific wall-clock date and time ("2026-11-21", "14:00") → the ISO
 * instant, accounting for daylight saving on that date.
 */
export function pacificToIso(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  let offset = zoneOffsetMinutes(new Date(wall))
  // A second pass settles the hour either side of a DST switch.
  const corrected = zoneOffsetMinutes(new Date(wall - offset * 60000))
  if (corrected !== offset) offset = corrected
  return new Date(wall - offset * 60000).toISOString()
}

/** ISO instant → Pacific { date: "2026-11-21", time: "14:00" }, for forms. */
export function isoToPacificParts(iso: string | null) {
  if (!iso) return { date: "", time: "" }
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d)
  return { date, time }
}

/**
 * ISO instant → the same instant written with the Pacific offset, e.g.
 * "2026-11-21T14:00:00-08:00". The database hands times back in UTC;
 * this is the friendlier form for structured data and <time>.
 */
export function toPacificIso(iso: string) {
  const d = new Date(iso)
  const offset = zoneOffsetMinutes(d)
  const local = new Date(d.getTime() + offset * 60000)
    .toISOString()
    .slice(0, 19)
  const sign = offset < 0 ? "-" : "+"
  const abs = Math.abs(offset)
  const hh = String(Math.floor(abs / 60)).padStart(2, "0")
  const mm = String(abs % 60).padStart(2, "0")
  return `${local}${sign}${hh}:${mm}`
}

/* ------------------------------------------------------------------ */
/* Display                                                             */
/* ------------------------------------------------------------------ */

/** "Sat, Nov 21", or the event's dateLabel when it has no date yet. */
export function formatEventDate(event: SiteEvent) {
  if (!event.startsAt) return event.dateLabel || "Date coming soon"
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: EVENT_TZ,
  }).format(new Date(event.startsAt))
}

/** "2 PM PT" or "2 PM – 7 PM PT". Null when there is no date. */
export function formatEventTime(event: SiteEvent) {
  if (!event.startsAt) return null
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: EVENT_TZ,
    })
      .format(new Date(iso))
      .replace(":00", "")
  const range = event.endsAt
    ? `${fmt(event.startsAt)} – ${fmt(event.endsAt)}`
    : fmt(event.startsAt)
  return `${range} PT`
}

/** Month and day for the big date block on a poster, e.g. ["Nov", "21"]. */
export function eventDateParts(event: SiteEvent): [string, string] | null {
  if (!event.startsAt) return null
  const d = new Date(event.startsAt)
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: EVENT_TZ,
  }).format(d)
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: EVENT_TZ,
  }).format(d)
  return [month, day]
}

/** Title → URL-safe slug: "DabsGiving 2026!" → "dabsgiving-2026". */
export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** next/image only optimizes hosts listed in next.config.ts. */
export function isOptimizableImage(url: string) {
  return url.startsWith("https://res.cloudinary.com/g0mcdcfr/")
}
