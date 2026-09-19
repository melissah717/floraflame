import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cookie-backed Supabase client — the one that knows who is logged in.
 *
 * Use this ONLY on admin paths and in Server Actions. Public pages must
 * keep using the plain anon client in lib/supabase.ts: reading cookies
 * opts a route into dynamic rendering, and the homepage and /strains are
 * deliberately static with `revalidate` (see app/page.tsx).
 *
 * Writes go through this client rather than a service-role key on purpose.
 * A service key bypasses row-level security entirely, so a single missing
 * check in a route handler would be a full write hole. Here the caller's
 * own JWT is what Postgres evaluates `is_admin()` against, which means the
 * database enforces the rule even if the app forgets to.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies. This throw is expected
            // and harmless there — proxy.ts refreshes the session on every
            // admin request, so the token stays fresh without this path.
          }
        },
      },
    }
  );
}
