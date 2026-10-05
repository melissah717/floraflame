import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
};

/**
 * The single place that answers "is this request an admin?".
 *
 * Every admin page and every Server Action calls this first. Next's own
 * guidance is explicit that proxy.ts is an optimistic check only — it sees
 * a cookie, not a verified user — so this is the check that actually
 * counts, and it runs adjacent to the data rather than at the edge.
 *
 * getUser(), not getSession(): getSession() decodes whatever cookie the
 * browser sent without verifying it, so it can be forged. getUser() round
 * trips to Supabase to validate the JWT signature.
 *
 * Wrapped in React's cache() so the several components in one admin render
 * that need the session share a single verification rather than each
 * making their own network call.
 */
export const verifySession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Being signed in is not being an admin. The allowlist is the real
  // gate — same table the RLS policies check, so the UI and the database
  // can never disagree about who is allowed in.
  const { data: adminRow, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[admin] Allowlist lookup failed:", error.message);
    redirect("/admin/login?error=lookup");
  }

  if (!adminRow) {
    redirect("/admin/login?error=denied");
  }

  return { userId: user.id, email: user.email ?? "" };
});

/**
 * Same check, but for callers that want to handle the failure themselves
 * instead of being redirected — Server Actions that return a message to a
 * form, mostly.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return null;

  return { userId: user.id, email: user.email ?? "" };
}
