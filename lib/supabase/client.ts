"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Only the login form needs this — it calls
 * signInWithPassword, and the SDK writes the session cookies that
 * proxy.ts and lib/supabase/server.ts then read.
 *
 * Every actual content mutation runs in a Server Action instead, so the
 * admin's write path is never "whatever the browser felt like sending".
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
