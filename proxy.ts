import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next 16 renamed Middleware to Proxy — same file-at-the-root convention,
 * same runtime position, new name. Only one of these is allowed per
 * project, so keep everything admin-shaped inside the matcher below.
 *
 * Two jobs, and only two:
 *
 *   1. Refresh the Supabase auth token and hand the new cookies back on
 *      the response. Server Components can't write cookies, so without
 *      this the session would expire mid-session and never renew.
 *
 *   2. An OPTIMISTIC redirect: no user, no /admin. Next's auth guide is
 *      pointed about this being a UX shortcut and not a security boundary
 *      — it keeps a logged-out visitor from watching an admin page paint
 *      before it bounces them. The real check is verifySession() in
 *      lib/admin/auth.ts, which every page and action calls, plus the RLS
 *      policies that would reject the write anyway.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // The refreshed cookies have to land on BOTH sides: on the
          // request so anything downstream in this same pass sees the new
          // token, and on the response so the browser stores it.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Do not remove: this call is what performs the refresh. It also has to
  // stay between creating the client and returning the response, or the
  // rewritten cookies never make it onto `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    // So the login form can bounce them back where they were headed.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /*
   * Signed in and on the login page? Normally bounce to /admin — except
   * when something sent them here deliberately with a reason.
   *
   * Without that exemption this is an infinite loop, and the exact loop
   * that matters: a signed-in user who ISN'T on the admin_users allowlist
   * gets redirected here by verifySession() with ?error=denied, and this
   * rule throws them straight back at /admin, which bounces them here
   * again. They never get to read why. The session is valid, so nothing
   * about it expiring would break the cycle either.
   */
  const hasReason = request.nextUrl.searchParams.has("error");

  if (user && isLoginPage && !hasReason) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  // Admin paths only. The public site is statically generated and has no
  // session to refresh, so running this on it would be pure latency.
  matcher: ["/admin/:path*"],
};
