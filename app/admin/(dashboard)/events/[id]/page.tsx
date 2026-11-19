import { notFound } from "next/navigation"

import { getEvent } from "@/lib/admin/events"
import { isoToPacificParts } from "@/lib/events"
import { EventForm } from "@/components/admin/event-form"

export default async function AdminEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id } = await params
  const { created } = await searchParams

  if (id === "new") {
    return <EventForm event={null} times={{ date: "", start: "", end: "" }} />
  }

  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const event = await getEvent(numericId)
  if (!event) notFound()

  const start = isoToPacificParts(event.starts_at)
  const end = isoToPacificParts(event.ends_at)

  return (
    <EventForm
      event={event}
      times={{ date: start.date, start: start.time, end: end.time }}
      created={created === "1"}
    />
  )
}
