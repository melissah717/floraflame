"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  saveStockist,
  deleteStockist,
  type AdminStockist,
} from "@/lib/admin/stockists";
import type { ActionState } from "@/lib/admin/form";
import {
  Banner,
  DeleteButton,
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/ui";

const STATUSES = ["carrying", "restocking", "paused"] as const;

export function StockistForm({ stockist }: { stockist: AdminStockist | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveStockist, null);
  const errors = state?.fieldErrors ?? {};
  const isNew = !stockist;
  const pinned = stockist?.lat != null && stockist?.lng != null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/stockists"
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            ← Stockists
          </Link>
          <h1 className="font-display text-2xl tracking-[-0.01em]">
            {isNew ? "New stockist" : stockist.name}
          </h1>
        </div>

        {!isNew && (
          <form action={deleteStockist}>
            <input type="hidden" name="id" value={stockist.id} />
            <DeleteButton confirmText={`Delete “${stockist.name}”? This can't be undone.`} />
          </form>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="id" value={stockist.id} />}
        <Banner state={state} />

        <FormSection
          title="Location"
          description="Coordinates are looked up from this address every time you save — there's nothing to fill in by hand."
        >
          <Field label="Name" htmlFor="name" error={errors.name}>
            <TextInput name="name" defaultValue={stockist?.name ?? ""} error={errors.name} />
          </Field>

          <Field label="Street address" htmlFor="address" error={errors.address}>
            <TextInput
              name="address"
              defaultValue={stockist?.address ?? ""}
              error={errors.address}
              placeholder="1975 W Olive Ave"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" htmlFor="city" error={errors.city}>
              <TextInput name="city" defaultValue={stockist?.city ?? ""} error={errors.city} />
            </Field>
            <Field label="State" htmlFor="state">
              <TextInput name="state" defaultValue={stockist?.state ?? "CA"} maxLength={2} />
            </Field>
            <Field label="ZIP" htmlFor="zip" error={errors.zip}>
              <TextInput name="zip" defaultValue={stockist?.zip ?? ""} error={errors.zip} />
            </Field>
          </div>

          {!isNew && (
            <p
              className={`text-xs ${pinned ? "text-neutral-500" : "text-amber-300"}`}
            >
              {pinned
                ? `Pinned at ${stockist.lat?.toFixed(4)}, ${stockist.lng?.toFixed(4)}.`
                : "No coordinates — this location is not on the map. Check the street address and save again."}
            </p>
          )}
        </FormSection>

        <FormSection title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Status"
              htmlFor="status"
              error={errors.status}
              hint="Drives the pin's colour and label."
            >
              <Select
                name="status"
                options={STATUSES}
                defaultValue={stockist?.status ?? "carrying"}
                error={errors.status}
              />
            </Field>
            <Field label="Sort order" htmlFor="sort_order" hint="Ascending. Ties break by name.">
              <TextInput
                name="sort_order"
                type="number"
                defaultValue={stockist?.sort_order ?? 0}
              />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <TextInput name="phone" type="tel" defaultValue={stockist?.phone ?? ""} />
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes" hint="Optional. Shown in the location card.">
            <TextArea name="notes" rows={3} defaultValue={stockist?.notes ?? ""} />
          </Field>
        </FormSection>

        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Geocoding…">
            {isNew ? "Create stockist" : "Save changes"}
          </SubmitButton>
          <Link
            href="/admin/stockists"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
