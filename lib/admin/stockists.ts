"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { geocodeStockist } from "@/lib/admin/geocode";
import {
  fail,
  int,
  ok,
  text,
  textOrNull,
  type ActionState,
} from "@/lib/admin/form";

/**
 * Stockists for the homepage's Find Us map.
 *
 * Replaces the STOCKISTS_CSV_URL sheet and the Apps Script that geocoded
 * it on a timer — saving a row geocodes it right here, so a new stockist
 * is pinnable immediately.
 */

const ADMIN_SELECT =
  "id, name, address, city, state, zip, lat, lng, status, phone, notes, sort_order, updated_at";

export type AdminStockist = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  status: "carrying" | "restocking" | "paused";
  phone: string | null;
  notes: string | null;
  sort_order: number;
  updated_at: string | null;
};

const STATUSES = ["carrying", "restocking", "paused"] as const;

export async function listStockists(): Promise<AdminStockist[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stockists")
    .select(ADMIN_SELECT)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin] listStockists failed:", error.message);
    return [];
  }

  return (data ?? []) as AdminStockist[];
}

export async function getStockist(id: number): Promise<AdminStockist | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stockists")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getStockist failed:", error.message);
    return null;
  }

  return (data as AdminStockist) ?? null;
}

export async function saveStockist(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  const name = text(formData, "name");
  const address = text(formData, "address");
  const city = text(formData, "city");
  const state = text(formData, "state") || "CA";
  const zip = text(formData, "zip");
  const status = text(formData, "status");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Required.";
  if (!address) fieldErrors.address = "Required — it's what gets geocoded.";
  if (!city) fieldErrors.city = "Required.";
  if (!zip) fieldErrors.zip = "Required.";
  if (!(STATUSES as readonly string[]).includes(status)) {
    fieldErrors.status = "Pick carrying, restocking, or paused.";
  }

  if (Object.keys(fieldErrors).length) {
    return fail("Check the highlighted fields.", fieldErrors);
  }

  const coords = await geocodeStockist({ address, city, state, zip });

  const row = {
    name,
    address,
    city,
    state,
    zip,
    status,
    phone: textOrNull(formData, "phone"),
    notes: textOrNull(formData, "notes"),
    sort_order: int(formData, "sort_order", 0),
    // Only overwrite coordinates when geocoding actually succeeded. A bad
    // address on an edit shouldn't wipe the pin a previous save earned.
    ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
  };

  // Said plainly, because the consequence is invisible otherwise: the row
  // saves, but fetchStockists drops it and it never appears on the map.
  const geocodeNote = coords
    ? ""
    : " Couldn't geocode that address, so it won't appear on the map until it resolves — check the street address and save again.";

  if (id) {
    const { error } = await supabase.from("stockists").update(row).eq("id", id);
    if (error) {
      console.error("[admin] saveStockist update failed:", error.message);
      return fail(error.message);
    }
    revalidatePath("/");
    revalidatePath("/admin/stockists");
    return coords
      ? ok(`Saved “${name}”.`)
      : fail(`Saved “${name}”.${geocodeNote}`);
  }

  const { data, error } = await supabase
    .from("stockists")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[admin] saveStockist insert failed:", error.message);
    return fail(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/stockists");
  redirect(`/admin/stockists/${data.id}?created=1${coords ? "" : "&geocode=failed"}`);
}

export async function deleteStockist(formData: FormData): Promise<void> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  if (!id) return;

  const { error } = await supabase.from("stockists").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteStockist failed:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin/stockists");
  redirect("/admin/stockists");
}
