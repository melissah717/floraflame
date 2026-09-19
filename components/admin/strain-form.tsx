"use client";

import { useActionState } from "react";
import Link from "next/link";

import { saveBatch, deleteBatch, type AdminBatch } from "@/lib/admin/strains";
import { SPECTRUM_POSITIONS } from "@/lib/strains";
import type { ActionState } from "@/lib/admin/form";
import { ImageField } from "@/components/admin/image-field";
import {
  Banner,
  Checkbox,
  DeleteButton,
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/ui";

export function StrainForm({ batch }: { batch: AdminBatch | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveBatch, null);
  const errors = state?.fieldErrors ?? {};
  const isNew = !batch;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/strains" className="text-xs text-neutral-500 hover:text-neutral-300">
            ← Strains
          </Link>
          <h1 className="font-display text-2xl tracking-[-0.01em]">
            {isNew ? "New strain" : batch.name}
          </h1>
        </div>

        {!isNew && (
          <form action={deleteBatch}>
            <input type="hidden" name="id" value={batch.id} />
            <DeleteButton
              confirmText={`Delete “${batch.name}”? This removes the batch permanently.`}
            />
          </form>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="id" value={batch.id} />}
        <Banner state={state} />

        <FormSection title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={errors.name}>
              <TextInput
                name="name"
                defaultValue={batch?.name ?? ""}
                error={errors.name}
                placeholder="Crunch Berries"
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              error={errors.slug}
              hint="Shared across a strain's batches. Lowercase, hyphenated."
            >
              <TextInput
                name="slug"
                defaultValue={batch?.slug ?? ""}
                error={errors.slug}
                placeholder="crunch-berries"
              />
            </Field>
          </div>

          <Field
            label="Spectrum"
            htmlFor="spectrum"
            error={errors.spectrum}
            hint="Drives the colour of the glow behind the card."
          >
            <Select
              name="spectrum"
              options={SPECTRUM_POSITIONS}
              defaultValue={batch?.spectrum ?? "Balanced Hybrid"}
              error={errors.spectrum}
            />
          </Field>

          <Checkbox
            name="is_current"
            label="In rotation"
            hint="Shows in Latest Drops on the homepage. Anything off still appears on /strains."
            defaultChecked={batch?.is_current ?? true}
          />
        </FormSection>

        <FormSection
          title="Photos"
          description="Upload a file or paste a URL. Delivery is optimised automatically — no need to shrink anything first."
        >
          <ImageField
            name="image"
            label="Product photo"
            error={errors.image}
            hint="Container + nug. Used on the homepage card."
            defaultValue={batch?.image}
          />
          <ImageField
            name="nug_image"
            label="Nug close-up"
            hint="Optional. Used on /strains; falls back to the product photo."
            defaultValue={batch?.nug_image}
          />
        </FormSection>

        <FormSection title="Profile">
          <Field label="Description" htmlFor="description" error={errors.description}>
            <TextArea
              name="description"
              rows={4}
              defaultValue={batch?.description ?? ""}
              error={errors.description}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags" htmlFor="tags" hint="Comma separated. Shown as chips.">
              <TextInput
                name="tags"
                defaultValue={(batch?.tags ?? []).join(", ")}
                placeholder="Berry, Dessert, Relaxing"
              />
            </Field>
            <Field
              label="Terpenes"
              htmlFor="terpenes"
              hint="Comma separated, most dominant first."
            >
              <TextInput
                name="terpenes"
                defaultValue={(batch?.terpenes ?? []).join(", ")}
                placeholder="Caryophyllene, Limonene, Myrcene"
              />
            </Field>
            <Field label="Genetics" htmlFor="genetics">
              <TextInput
                name="genetics"
                defaultValue={batch?.genetics ?? ""}
                placeholder="Zkittlez x Do-Si-Dos"
              />
            </Field>
            <Field label="Best time" htmlFor="ideal_time">
              <TextInput
                name="ideal_time"
                defaultValue={batch?.ideal_time ?? ""}
                placeholder="Evenings"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Batch record"
          description="Kept for your records. None of this renders on the site — percentages move batch to batch, so the site doesn't quote one."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch number" htmlFor="batch_number">
              <TextInput name="batch_number" defaultValue={batch?.batch_number ?? ""} />
            </Field>
            <Field label="THC %" htmlFor="thc_percent" hint="From the COA. Not displayed.">
              <TextInput
                name="thc_percent"
                type="number"
                step="0.1"
                defaultValue={batch?.thc_percent ?? ""}
              />
            </Field>
            <Field label="Lab report URL" htmlFor="lab_report_url">
              <TextInput name="lab_report_url" defaultValue={batch?.lab_report_url ?? ""} />
            </Field>
            <Field
              label="New until"
              htmlFor="new_until"
              hint="Shows a New badge up to this date."
            >
              <TextInput
                name="new_until"
                type="date"
                defaultValue={batch?.new_until ?? ""}
              />
            </Field>
            <Field label="Produced" htmlFor="produced_at">
              <TextInput name="produced_at" type="date" defaultValue={batch?.produced_at ?? ""} />
            </Field>
            <Field label="Collected" htmlFor="collected_at" hint="Sorts /strains, newest first.">
              <TextInput
                name="collected_at"
                type="date"
                defaultValue={batch?.collected_at ?? ""}
              />
            </Field>
            <Field label="Completed" htmlFor="completed_at">
              <TextInput
                name="completed_at"
                type="date"
                defaultValue={batch?.completed_at ?? ""}
              />
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center gap-3">
          <SubmitButton>{isNew ? "Create strain" : "Save changes"}</SubmitButton>
          <Link
            href="/admin/strains"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
