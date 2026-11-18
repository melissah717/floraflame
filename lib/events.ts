/**
 * Events for /events.
 *
 * Hand-edited for now: add an entry here and redeploy. The shape mirrors
 * how strains are stored, so this list can move to a Supabase table with
 * an admin form later without the page changing.
 *
 * Only `slug` and `title` are required. Leave anything you don't know
 * yet as null and the page shows a sensible stand-in ("Details soon",
 * a typographic poster instead of an image). Search engines only get
 * Event structured data once an event has a real start time and venue,
 * because Google rejects an Event without them.
 */

export type SiteEvent = {
  /** URL-safe id, unique. Used for the anchor link to the event. */
  slug: string
  title: string
  /**
   * Start, as an ISO date-time with the Pacific offset, e.g.
   * "2026-11-27T16:20:00-08:00". Null while the date isn't confirmed.
   */
  startsAt: string | null
  /** Optional end time, same format. Used to decide when an event is past. */
  endsAt?: string | null
  /**
   * What to show for the date when `startsAt` is null, e.g.
   * "Thanksgiving week". Ignored once `startsAt` is set.
   */
  dateLabel?: string
  venue: {
    name: string
    address?: string
    city: string
  } | null
  /** One or two short paragraphs. */
  description: string[]
  /** Cloudinary (or any https) URL of the poster. Portrait 4:5 looks best. */
  poster: string | null
  posterAlt?: string
  /** RSVP, tickets or the venue's own event page. */
  link?: { label: string; href: string } | null
}

export const EVENTS: SiteEvent[] = [
  {
    slug: "thanksgiving-sesh-2026",
    title: "Thanksgiving Sesh",
    // CONFIRM: exact date and time, and which lounge. All we have so far is
    // "a Thanksgiving sesh at a lounge".
    startsAt: null,
    dateLabel: "Thanksgiving 2026",
    venue: null,
    description: [
      "Come through for a Thanksgiving session at the lounge with Flora & Flame flower.",
      "Date, time and location are coming soon. 21+ with valid ID.",
    ],
    poster: null,
    link: null,
  },
]

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
export function splitEvents(events: SiteEvent[] = EVENTS, now = new Date()) {
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

const TZ = "America/Los_Angeles"

/** "Thu, Nov 27" — or the event's dateLabel when it has no date yet. */
export function formatEventDate(event: SiteEvent) {
  if (!event.startsAt) return event.dateLabel ?? "Date coming soon"
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: TZ,
  }).format(new Date(event.startsAt))
}

/** "4:20 PM" or "4:20 – 9 PM". Null when there's no date. */
export function formatEventTime(event: SiteEvent) {
  if (!event.startsAt) return null
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TZ,
    })
      .format(new Date(iso))
      .replace(":00", "")
  return event.endsAt
    ? `${fmt(event.startsAt)} – ${fmt(event.endsAt)}`
    : fmt(event.startsAt)
}

/** Month and day for the big date block on a poster, e.g. ["Nov", "27"]. */
export function eventDateParts(event: SiteEvent): [string, string] | null {
  if (!event.startsAt) return null
  const d = new Date(event.startsAt)
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: TZ,
  }).format(d)
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: TZ,
  }).format(d)
  return [month, day]
}
