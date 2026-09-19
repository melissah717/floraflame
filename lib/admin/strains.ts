"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { SPECTRUM_POSITIONS, type SpectrumPosition } from "@/lib/strains";
import {
  bool,
  dateOrNull,
  fail,
  int,
  list,
  numberOrNull,
  ok,
  text,
  textOrNull,
  type ActionState,
} from "@/lib/admin/form";

/**
 * Drop batches — the strains on the homepage and /strains.
 *
 * Writes go through the caller's own session, so Postgres re-checks
 * is_admin() on every statement (supabase/admin-schema.sql). verifySession()
 * here is belt-and-braces: it gives a useful error instead of an opaque RLS
 * rejection, and Next's auth guide is explicit that a Server Action is a
 * public endpoint and must check for itself.
 */

// One string literal, not a concatenation: supabase-js infers the row type
// by parsing this at the type level, and `"a, b" + "c"` widens to `string`,
// which collapses the result type to GenericStringError.
// prettier-ignore
const ADMIN_SELECT = "id, slug, name, image, nug_image, spectrum, is_current, tags, description, genetics, terpenes, ideal_time, batch_number, new_until, produced_at, collected_at, completed_at, lab_report_url, thc_percent, updated_at";

export type AdminBatch = {
  id: number;
  slug: string;
  name: string;
  image: string;
  nug_image: string | null;
  spectrum: SpectrumPosition;
  is_current: boolean;
  tags: string[] | null;
  description: string;
  genetics: string | null;
  terpenes: string[] | null;
  ideal_time: string | null;
  batch_number: string | null;
  new_until: string | null;
  produced_at: string | null;
  collected_at: string | null;
  completed_at: string | null;
  lab_report_url: string | null;
  thc_percent: number | null;
  updated_at: string | null;
};

/** Every batch, current first, then most recently touched. */
export async function listBatches(): Promise<AdminBatch[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drop_batches")
    .select(ADMIN_SELECT)
    .order("is_current", { ascending: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin] listBatches failed:", error.message);
    return [];
  }

  return (data ?? []) as AdminBatch[];
}

export async function getBatch(id: number): Promise<AdminBatch | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drop_batches")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getBatch failed:", error.message);
    return null;
  }

  return (data as AdminBatch) ?? null;
}

/**
 * The public pages are statically generated with `revalidate = 3600`, so
 * without this an edit wouldn't show up for an hour.
 */
function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/strains");
}

export async function saveBatch(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  const slug = text(formData, "slug");
  const name = text(formData, "name");
  const image = text(formData, "image");
  const spectrum = text(formData, "spectrum");
  const description = text(formData, "description");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Required.";
  if (!slug) fieldErrors.slug = "Required.";
  if (!image) fieldErrors.image = "Required — the homepage card has nothing to show without it.";
  if (!description) fieldErrors.description = "Required.";
  if (!(SPECTRUM_POSITIONS as readonly string[]).includes(spectrum)) {
    fieldErrors.spectrum = "Pick one of the five spectrum positions.";
  }

  if (Object.keys(fieldErrors).length) {
    return fail("Check the highlighted fields.", fieldErrors);
  }

  const row = {
    slug,
    name,
    image,
    nug_image: textOrNull(formData, "nug_image"),
    spectrum,
    is_current: bool(formData, "is_current"),
    tags: list(formData, "tags"),
    description,
    genetics: textOrNull(formData, "genetics"),
    terpenes: list(formData, "terpenes"),
    ideal_time: textOrNull(formData, "ideal_time"),
    batch_number: textOrNull(formData, "batch_number"),
    new_until: dateOrNull(formData, "new_until"),
    produced_at: dateOrNull(formData, "produced_at"),
    collected_at: dateOrNull(formData, "collected_at"),
    completed_at: dateOrNull(formData, "completed_at"),
    lab_report_url: textOrNull(formData, "lab_report_url"),
    // Still a column because the COA has it, but nothing on the site
    // renders it — percentages move batch to batch, so we don't quote one.
    thc_percent: numberOrNull(formData, "thc_percent"),
  };

  if (id) {
    const { error } = await supabase.from("drop_batches").update(row).eq("id", id);
    if (error) {
      console.error("[admin] saveBatch update failed:", error.message);
      return fail(error.message);
    }
    revalidatePublicPages();
    revalidatePath("/admin/strains");
    return ok(`Saved “${name}”.`);
  }

  const { data, error } = await supabase
    .from("drop_batches")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[admin] saveBatch insert failed:", error.message);
    return fail(error.message);
  }

  revalidatePublicPages();
  revalidatePath("/admin/strains");
  // Straight to the new row's own edit page, so "create" and "keep
  // editing" aren't two separate navigations.
  redirect(`/admin/strains/${data.id}?created=1`);
}

/** The list view's in-rotation switch. */
export async function toggleCurrent(formData: FormData): Promise<void> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  if (!id) return;

  const { error } = await supabase
    .from("drop_batches")
    .update({ is_current: bool(formData, "next") })
    .eq("id", id);

  if (error) {
    console.error("[admin] toggleCurrent failed:", error.message);
    return;
  }

  revalidatePublicPages();
  revalidatePath("/admin/strains");
}

export async function deleteBatch(formData: FormData): Promise<void> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  if (!id) return;

  const { error } = await supabase.from("drop_batches").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteBatch failed:", error.message);
    return;
  }

  revalidatePublicPages();
  revalidatePath("/admin/strains");
  redirect("/admin/strains");
}
