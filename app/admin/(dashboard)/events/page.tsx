import Link from "next/link"

import { listEvents } from "@/lib/admin/events"
import { formatEventDate, isPast, rowToEvent } from "@/lib/events"

export const metadata = { title: "Events" }

export default async function AdminEventsPage() {
  const { events, error } = await listEvents()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl tracking-[-0.01em]">Events</h1>
          <p className="text-sm text-neutral-400">
            Shown on /events, soonest first. Past events move to the bottom of
            that page on their own.
          </p>
        </div>
        {!error && (
          <Link
            href="/admin/events/new"
            className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            New event
          </Link>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-200"
        >
          {error}
        </p>
      ) : events.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
          No events yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((row) => {
            const event = rowToEvent(row)
            const past = isPast(event)
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/admin/events/${row.id}`}
                    className="truncate font-display text-base text-neutral-50 hover:underline"
                  >
                    {row.title}
                  </Link>
                  <span className="truncate text-xs text-neutral-500">
                    {formatEventDate(event)}
                    {row.venue_name ? ` · ${row.venue_name}` : ""}
                  </span>
                </div>

                {!row.published ? (
                  <span className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400">
                    Draft
                  </span>
                ) : past ? (
                  <span className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-500">
                    Past
                  </span>
                ) : (
                  <span className="rounded-full border border-lime-500/50 px-3 py-1.5 text-xs text-lime-300">
                    Upcoming
                  </span>
                )}

                <Link
                  href={`/admin/events/${row.id}`}
                  className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
                >
                  Edit
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
