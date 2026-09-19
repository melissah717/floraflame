import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/strains", label: "Strains" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/stockists", label: "Stockists" },
] as const;

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * The guard for every admin page.
 *
 * A layout auth check is NOT sufficient on its own — Next's own auth guide
 * is explicit that layouts don't re-render on every navigation, so a page
 * can render without its layout re-running. That's why each action in
 * lib/admin/* calls verifySession() again for itself, and why the RLS
 * policies exist underneath both. This check is here so the chrome and the
 * redirect happen in one obvious place, not because it's the only lock.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="min-h-svh bg-neutral-950 text-neutral-50">
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <Link
            href="/admin"
            className="font-display text-sm uppercase tracking-[0.12em] text-neutral-50"
          >
            Flora &amp; Flame
          </Link>

          <nav aria-label="Admin" className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              View site ↗
            </Link>
            <span className="hidden text-xs text-neutral-500 sm:inline">
              {session.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
