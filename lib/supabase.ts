import { createClient } from "@supabase/supabase-js";

/**
 * Read-only client for the site's Supabase project. The anon key is safe
 * to use here (including in Server Components) because drop_batches has
 * row-level security enabled with a public SELECT-only policy — see
 * supabase/schema.sql. There's no write path from the app.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
