"use client"

import { useActionState } from "react"
import Link from "next/link"

import { saveEvent, deleteEvent, type AdminEvent } from "@/lib/admin/events"
import type { ActionState } from "@/lib/admin/form"
import { ImageField } from "@/components/admin/image-field"
import {
  Banner,
  Checkbox,
  DeleteButton,
  Field,
  FormSection,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/ui"

/**
 * `times` is the event's start and end already converted to Pacific
 * wall-clock values by the page (a server component), so this client
 * form doesn't have to pull the time-zone helpers into the browser.
 */
export function EventForm({
  event,
  times,
  created = false,
}: {
  event: AdminEvent | null
  times: { date: string; start: string; end: string }
  created?: boolean
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveEvent,
    created ? { ok: true, message: "Event created." } : null
  )
  const errors = state?.fieldErrors ?? {}
  const isNew = !event

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/events"
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            ← Events
          </Link>
          <h1 className="font-display text-2xl tracking-[-0.01em]">
            {isNew ? "New event" : event.title}
          </h1>
          {!isNew && event.published && (
            <a
              href={`/events#${event.slug}`}
              target="_blank"
              rel="noopener"
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              /events#{event.slug} ↗
            </a>
          )}
        </div>

        {!isNew && (
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={event.id} />
            <DeleteButton
              confirmText={`Delete “${event.title}”? This can't be undone.`}
            />
          </form>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="id" value={event.id} />}
        <Banner state={state} />

        <FormSection title="Event">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <TextInput
              name="title"
              defaultValue={event?.title ?? ""}
              error={errors.title}
              placeholder="Lady Namastizzle’s DabsGiving 2026"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Type"
              htmlFor="kind"
              hint="Optional. Shown beside the date."
            >
              <TextInput
                name="kind"
                defaultValue={event?.kind ?? ""}
                placeholder="Pop-up"
              />
            </Field>
            <Field
              label="Link name"
              htmlFor="slug"
              error={errors.slug}
              hint="Optional. Made from the title if left blank."
            >
              <TextInput
                name="slug"
                defaultValue={event?.slug ?? ""}
                error={errors.slug}
                placeholder="dabsgiving-2026"
              />
            </Field>
          </div>

          <Checkbox
            name="published"
            label="Show on the site"
            hint="Untick to keep it as a draft that only admins can see."
            defaultChecked={event?.published ?? true}
          />
        </FormSection>

        <FormSection
          title="When"
          description="Pacific time. Leave the date blank if it isn't confirmed yet. The event moves to Past events on its own once it ends."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date" htmlFor="start_date" error={errors.start_date}>
              <TextInput
                name="start_date"
                type="date"
                defaultValue={times.date}
                error={errors.start_date}
              />
            </Field>
            <Field
              label="Starts"
              htmlFor="start_time"
              error={errors.start_time}
            >
              <TextInput
                name="start_time"
                type="time"
                defaultValue={times.start}
                error={errors.start_time}
              />
            </Field>
            <Field
              label="Ends"
              htmlFor="end_time"
              error={errors.end_time}
              hint="Optional."
            >
              <TextInput
                name="end_time"
                type="time"
                defaultValue={times.end}
                error={errors.end_time}
              />
            </Field>
          </div>

          <Field
            label="Date text"
            htmlFor="date_label"
            hint="Only used while there's no date, e.g. “Thanksgiving week”."
          >
            <TextInput
              name="date_label"
              defaultValue={event?.date_label ?? ""}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Where"
          description="Leave the venue blank if it hasn't been announced. Google only shows an event in search once it has a date, a start time and a venue."
        >
          <Field label="Venue" htmlFor="venue_name">
            <TextInput
              name="venue_name"
              defaultValue={event?.venue_name ?? ""}
              placeholder="Moe Greens Dispensary & Lounge"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street address" htmlFor="venue_address">
              <TextInput
                name="venue_address"
                defaultValue={event?.venue_address ?? ""}
                placeholder="1276 Market St"
              />
            </Field>
            <Field label="City" htmlFor="venue_city" error={errors.venue_city}>
              <TextInput
                name="venue_city"
                defaultValue={event?.venue_city ?? ""}
                error={errors.venue_city}
                placeholder="San Francisco"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Details">
          <Field
            label="Description"
            htmlFor="description"
            hint="Leave a blank line between paragraphs."
          >
            <TextArea
              name="description"
              rows={6}
              defaultValue={event?.description ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Field
              label="Button text"
              htmlFor="link_label"
              hint="Optional, e.g. RSVP."
            >
              <TextInput
                name="link_label"
                defaultValue={event?.link_label ?? ""}
                placeholder="RSVP"
              />
            </Field>
            <Field
              label="Button link"
              htmlFor="link_url"
              error={errors.link_url}
              hint="Tickets, RSVP or the venue's event page. No button without it."
            >
              <TextInput
                name="link_url"
                type="url"
                defaultValue={event?.link_url ?? ""}
                error={errors.link_url}
                placeholder="https://"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Poster"
          description="Portrait, 4:5 works best. Without one, the page draws a text poster from the title and date."
        >
          <ImageField
            name="poster"
            label="Poster image"
            error={errors.poster}
            defaultValue={event?.poster}
          />
          <Field
            label="Poster description"
            htmlFor="poster_alt"
            hint="For screen readers and image search. Describe what's on it."
          >
            <TextInput
              name="poster_alt"
              defaultValue={event?.poster_alt ?? ""}
            />
          </Field>
        </FormSection>

        <div className="flex items-center gap-3">
          <SubmitButton>{isNew ? "Create event" : "Save changes"}</SubmitButton>
          <Link
            href="/admin/events"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
