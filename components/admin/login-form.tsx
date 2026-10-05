"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Field, TextInput } from "@/components/admin/ui";

/**
 * Sign-in for /admin.
 *
 * This is the one place the browser talks to Supabase directly: the SDK
 * needs to run in the browser to write the session cookies that proxy.ts
 * and the server client then read. Every actual content mutation happens
 * in a Server Action instead.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Set by proxy.ts when it bounces a logged-out request, and by
  // verifySession() when a signed-in user isn't on the allowlist.
  const reason = searchParams.get("error");
  const nextPath = searchParams.get("next") ?? "/admin";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      // Supabase deliberately doesn't say which half was wrong, and
      // neither do we — it would confirm whether an address has an account.
      setError("That email and password didn't match.");
      setPending(false);
      return;
    }

    // refresh() before push() so the server re-renders with the cookies the
    // SDK just set. Without it the admin layout still sees a logged-out
    // request and proxy.ts bounces straight back here.
    router.refresh();
    router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
  }

  async function onSignOut() {
    await createClient().auth.signOut();
    router.refresh();
    router.push("/admin/login");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl tracking-[-0.01em] text-neutral-50">
          Flora &amp; Flame admin
        </h1>
        <p className="text-sm text-neutral-400">Sign in to manage site content.</p>
      </div>

      {reason === "denied" && (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          <p>
            That account is signed in but isn&apos;t on the admin allowlist, so
            there&apos;s nothing it can do here.
          </p>
          <p className="text-xs text-red-300/80">
            Add it with the insert in supabase/SETUP.md step 3, or sign out and use
            a different account.
          </p>
          {/* Without this they're stuck: the session is valid, so signing in
              again changes nothing, and every /admin visit lands right back
              on this page. */}
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-red-400/50 px-3 py-1 text-xs text-red-100 transition-colors hover:border-red-300"
          >
            Sign out
          </button>
        </div>
      )}
      {reason === "lookup" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Couldn&apos;t check the admin allowlist. Has supabase/admin-schema.sql been run?
        </p>
      )}

      <Field label="Email" htmlFor="email">
        <TextInput
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@floraflame.ca"
        />
      </Field>

      <Field label="Password" htmlFor="password" error={error ?? undefined}>
        <TextInput
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={error ?? undefined}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
