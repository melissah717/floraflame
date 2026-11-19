"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { verifySession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import {
  bool,
  fail,
  int,
  ok,
  text,
  textOrNull,
  type ActionState,
} from "@/lib/admin/form"
import { pacificToIso, slugify } from "@/lib/events"

/**
 * Events for /events. Table: supabase/events.sql.
 *
 * Times are entered as Pacific wall-clock date + time (every event is in
 * California) and stored as timestamptz, so the page can format them for
 * any reader and decide on its own when an event has passed.
 */

const ADMIN_SELECT =
  "id, slug, title, kind, starts_at, ends_at, date_label, venue_name, venue_address, venue_city, description, poster, poster_alt, link_label, link_url, published, updated_at"

export type AdminEvent = {
  id: number
  slug: string
  title: string
  kind: string | null
  starts_at: string | null
  ends_at: string | null
  date_label: string | null
  venue_name: string | null
  venue_address: string | null
  venue_city: string | null
  description: string
  poster: string | null
  poster_alt: string | null
  link_label: string | null
  link_url: string | null
  published: boolean
  updated_at: string | null
}

/** Postgres / PostgREST codes for "that table doesn't exist". */
function isMissingTable(error: { code?: string; message: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /could not find the table|does not exist/i.test(error.message)
  )
}

const MISSING_TABLE =
  "The events table doesn't exist yet. Run supabase/events.sql in the Supabase SQL editor, then reload."

export async function listEvents(): Promise<{
  events: AdminEvent[]
  error: string | null
}> {
  await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("events")
    .select(ADMIN_SELECT)
    .order("starts_at", { ascending: false, nullsFirst: true })

  if (error) {
    console.error("[admin] listEvents failed:", error.message)
    return {
      events: [],
      error: isMissingTable(error) ? MISSING_TABLE : error.message,
    }
  }

  return { events: (data ?? []) as AdminEvent[], error: null }
}

export async function getEvent(id: number): Promise<AdminEvent | null> {
  await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("events")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[admin] getEvent failed:", error.message)
    return null
  }

  return (data as AdminEvent) ?? null
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/

function revalidateEvents() {
  revalidatePath("/events")
  revalidatePath("/admin/events")
  revalidatePath("/admin")
}

export async function saveEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession()
  const supabase = await createClient()

  const id = int(formData, "id", 0)
  const title = text(formData, "title")
  const slug = text(formData, "slug") || slugify(title)

  const date = text(formData, "start_date")
  const startTime = text(formData, "start_time")
  const endTime = text(formData, "end_time")

  const venueName = textOrNull(formData, "venue_name")
  const venueCity = textOrNull(formData, "venue_city")
  const poster = textOrNull(formData, "poster")
  const linkUrl = textOrNull(formData, "link_url")

  const fieldErrors: Record<string, string> = {}
  if (!title) fieldErrors.title = "Required."
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = "Lowercase letters, numbers and dashes only."
  }
  if (date && !DATE.test(date)) fieldErrors.start_date = "Pick a date."
  if (date && !TIME.test(startTime)) {
    fieldErrors.start_time = "Add a start time, or clear the date."
  }
  if (!date && startTime) {
    fieldErrors.start_date = "Add the date for this start time."
  }
  if (endTime && !TIME.test(endTime)) fieldErrors.end_time = "Pick a time."
  if (endTime && !date) fieldErrors.end_time = "Add the date first."
  if (venueName && !venueCity) fieldErrors.venue_city = "Add the city."
  if (poster && !/^https:\/\//.test(poster)) {
    fieldErrors.poster = "Must be an https:// link."
  }
  if (linkUrl && !/^https?:\/\//.test(linkUrl)) {
    fieldErrors.link_url = "Must start with https://"
  }

  if (Object.keys(fieldErrors).length) {
    return fail("Check the highlighted fields.", fieldErrors)
  }

  const startsAt = date ? pacificToIso(date, startTime) : null
  let endsAt: string | null = null
  if (date && endTime) {
    endsAt = pacificToIso(date, endTime)
    // An end time earlier than the start means it runs past midnight.
    if (startsAt && endsAt <= startsAt) {
      endsAt = new Date(
        new Date(endsAt).getTime() + 24 * 60 * 60 * 1000
      ).toISOString()
    }
  }

  const row = {
    slug,
    title,
    kind: textOrNull(formData, "kind"),
    starts_at: startsAt,
    ends_at: endsAt,
    date_label: startsAt ? null : textOrNull(formData, "date_label"),
    venue_name: venueName,
    venue_address: venueName ? textOrNull(formData, "venue_address") : null,
    venue_city: venueName ? venueCity : null,
    description: text(formData, "description"),
    poster,
    poster_alt: textOrNull(formData, "poster_alt"),
    link_label: linkUrl ? textOrNull(formData, "link_label") : null,
    link_url: linkUrl,
    published: bool(formData, "published"),
  }

  const duplicate = (error: { code?: string }) =>
    error.code === "23505"
      ? fail("Check the highlighted fields.", {
          slug: "Another event already uses this. Change it to something unique.",
        })
      : null

  if (id) {
    const { error } = await supabase.from("events").update(row).eq("id", id)
    if (error) {
      console.error("[admin] saveEvent update failed:", error.message)
      return duplicate(error) ?? fail(error.message)
    }
    revalidateEvents()
    return ok(
      row.published
        ? `Saved “${title}”. It's live on /events.`
        : `Saved “${title}” as a draft. It's hidden from /events.`
    )
  }

  const { data, error } = await supabase
    .from("events")
    .insert(row)
    .select("id")
    .single()

  if (error) {
    console.error("[admin] saveEvent insert failed:", error.message)
    return duplicate(error) ?? fail(error.message)
  }

  revalidateEvents()
  redirect(`/admin/events/${data.id}?created=1`)
}

export async function deleteEvent(formData: FormData): Promise<void> {
  await verifySession()
  const supabase = await createClient()

  const id = int(formData, "id", 0)
  if (!id) return

  const { error } = await supabase.from("events").delete().eq("id", id)
  if (error) {
    console.error("[admin] deleteEvent failed:", error.message)
    return
  }

  revalidateEvents()
  redirect("/admin/events")
}
