import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  // The admin has no business in an index, and robots.ts should agree.
  robots: { index: false, follow: false },
};

/**
 * Sits OUTSIDE app/admin/(dashboard), which is what keeps it reachable:
 * that group's layout calls verifySession(), which redirects here, so a
 * login page underneath it would redirect to itself forever.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-16">
      {/* LoginForm reads ?next and ?error, and useSearchParams() needs a
          Suspense boundary above it or the route can't be prerendered. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
