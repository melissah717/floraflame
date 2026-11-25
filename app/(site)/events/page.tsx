import type { Metadata } from "next"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "@/components/scroll-primitives"
import { BreadcrumbJsonLd, jsonLd } from "@/lib/json-ld"
import {
  eventDateParts,
  formatEventDate,
  formatEventTime,
  getEvents,
  isOptimizableImage,
  splitEvents,
  toPacificIso,
  type SiteEvent,
} from "@/lib/events"
import { SITE_URL } from "@/lib/site"

// Re-rendered hourly, so an event moves from Upcoming to Past on its own
// the day after it happens, without a deploy.
export const revalidate = 3600

const TITLE = "Cannabis Events & Lounge Seshes"
const DESCRIPTION =
  "Where to find Flora & Flame in person: lounge seshes, pop-ups and events around California, with dates, venues and details. 21+ only."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/events" },
}

const GUTTER = "px-5 sm:px-8 lg:px-14"
const INSTAGRAM = "https://www.instagram.com/floraandflameca/"

export default async function EventsPage() {
  const { upcoming, past } = splitEvents(await getEvents())

  return (
    <div
      className={`bg-neutral-900 pt-32 pb-24 text-neutral-50 sm:pt-48 sm:pb-32 ${GUTTER}`}
    >
      <BreadcrumbJsonLd trail={[["Events", "/events"]]} />
      {[...upcoming, ...past].map((event) => {
        const data = eventJsonLd(event)
        return data ? (
          <script
            key={event.slug}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
          />
        ) : null
      })}

      <Reveal>
        <h1 className="font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.88] tracking-[-0.03em] uppercase">
          Events
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
          Lounge seshes, pop-ups and nights out where you can find Flora &amp; Flame. 21+ only.
        </p>
      </Reveal>

      <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
        {upcoming.length === 0 ? (
          <Reveal>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-300">
              Nothing on the calendar right now. The next one goes up on{" "}
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener"
                className="underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-50"
              >
                Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              first.
            </p>
          </Reveal>
        ) : (
          upcoming.map((event, index) => (
            <Reveal key={event.slug}>
              <EventRow
                event={event}
                flip={index % 2 === 1}
                priority={index === 0}
              />
            </Reveal>
          ))
        )}
      </div>

      {past.length > 0 && (
        <section aria-labelledby="past-events" className="mt-28 sm:mt-36">
          <h2
            id="past-events"
            className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.9] uppercase"
          >
            Past events
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {past.map((event) => (
              <li key={event.slug} id={event.slug} className="scroll-mt-28">
                <Poster
                  event={event}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  muted
                />
                <h3 className="mt-4 font-display text-xl leading-tight">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {formatEventDate(event)}
                  {event.venue ? ` · ${event.venue.name}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** One upcoming event: the poster beside everything you need to show up. */
function EventRow({
  event,
  flip,
  priority,
}: {
  event: SiteEvent
  flip: boolean
  priority: boolean
}) {
  const time = formatEventTime(event)

  return (
    <article
      id={event.slug}
      className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-12 lg:gap-16"
    >
      <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <Poster
          event={event}
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority={priority}
        />
      </div>

      <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
        <p className="font-display text-2xl leading-none text-neutral-400 uppercase sm:text-3xl">
          {formatEventDate(event)}
          {event.kind ? ` · ${event.kind}` : ""}
        </p>
        <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,5rem)] leading-[0.88] tracking-[-0.03em] [overflow-wrap:break-word] uppercase">
          {event.title}
        </h2>

        <dl className="mt-10 grid max-w-xl gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-400">When</dt>
            <dd className="mt-1 text-lg leading-snug">
              {event.startsAt ? (
                <>
                  <time dateTime={toPacificIso(event.startsAt)}>
                    {formatEventDate(event)}
                  </time>
                  {time && (
                    <span className="block text-neutral-300">{time}</span>
                  )}
                </>
              ) : (
                <>
                  {formatEventDate(event)}
                  <span className="block text-neutral-300">
                    Time to be announced
                  </span>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">Where</dt>
            <dd className="mt-1 text-lg leading-snug">
              {event.venue ? (
                <>
                  {event.venue.name}
                  <span className="block text-neutral-300">
                    {event.venue.address ? `${event.venue.address}, ` : ""}
                    {event.venue.city}
                  </span>
                </>
              ) : (
                <>
                  Lounge to be announced
                  <span className="block text-neutral-300">California</span>
                </>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-10 max-w-xl space-y-5">
          {event.description.map((text) => (
            <p key={text} className="text-lg leading-relaxed text-neutral-300">
              {text}
            </p>
          ))}
        </div>

        {event.link && (
          <a
            href={event.link.href}
            target="_blank"
            rel="noopener"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-neutral-50 px-7 py-3.5 text-base text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50"
          >
            {event.link.label}
            <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  )
}

/**
 * The event's poster, or, until there is one, a typographic stand-in in
 * the same 4:5 frame so a row never looks like an image failed to load.
 */
function Poster({
  event,
  sizes,
  priority = false,
  muted = false,
}: {
  event: SiteEvent
  sizes: string
  priority?: boolean
  muted?: boolean
}) {
  const parts = eventDateParts(event)

  return (
    <div
      className={`@container relative aspect-[4/5] overflow-hidden rounded-md bg-neutral-700/50 ${
        muted ? "opacity-70" : ""
      }`}
    >
      {event.poster ? (
        <Image
          src={event.poster}
          alt={event.posterAlt ?? `Poster for ${event.title}`}
          fill
          sizes={sizes}
          preload={priority}
          // A poster pasted from anywhere but our Cloudinary account is
          // shown as-is; next/image would refuse to optimize that host.
          unoptimized={!isOptimizableImage(event.poster)}
          className="object-cover"
        />
      ) : (
        // Type is sized in cqw (percent of the poster's own width), not
        // vw: the poster is full width on a phone, 40% of the page on
        // desktop and a quarter of it in Past events, and a 12-letter word
        // like THANKSGIVING has to fit across all of them.
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col justify-between p-[7cqw]"
        >
          <div className="font-display leading-[0.85] uppercase">
            {parts ? (
              <>
                <span className="block text-[8cqw] text-neutral-400">
                  {parts[0]}
                </span>
                <span className="block text-[30cqw]">{parts[1]}</span>
              </>
            ) : (
              <span className="block text-[8cqw] text-neutral-400">
                {formatEventDate(event)}
              </span>
            )}
          </div>
          <div>
            <p className="font-display text-[10cqw] leading-[0.88] tracking-[-0.03em] [overflow-wrap:anywhere] uppercase">
              {event.title}
            </p>
            <p className="mt-[5cqw] flex items-center justify-between gap-4 text-[clamp(0.75rem,3.6cqw,0.95rem)] text-neutral-400">
              <span>Flora &amp; Flame</span>
              <span>21+</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * schema.org Event, which can earn an event rich result in Google. Only
 * built once the event has a start time and a venue: Google rejects an
 * Event missing either, so publishing a half-filled one gains nothing.
 */
function eventJsonLd(event: SiteEvent) {
  if (!event.startsAt || !event.venue) return null
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: toPacificIso(event.startsAt),
    ...(event.endsAt ? { endDate: toPacificIso(event.endsAt) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        ...(event.venue.address ? { streetAddress: event.venue.address } : {}),
        addressLocality: event.venue.city,
        addressRegion: "CA",
        addressCountry: "US",
      },
    },
    description: event.description.join(" "),
    ...(event.poster ? { image: event.poster } : {}),
    organizer: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}/events#${event.slug}`,
    typicalAgeRange: "21-",
  }
}
