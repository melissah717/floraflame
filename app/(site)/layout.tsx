import { AgeGate } from "@/components/age-gate"
import { CookieConsent } from "@/components/cookie-consent"
import { Preloader } from "@/components/preloader"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ReducedMotionBoundary } from "@/components/reduced-motion-boundary"

/**
 * The public site's shell. Everything that used to sit in the root layout
 * and wrap every route now wraps only the routes in this group, so /admin
 * gets a clean page instead of inheriting the age gate and the preloader.
 *
 * `(site)` is a route group: it scopes this layout without appearing in
 * any URL. /, /strains and /learn are all exactly where they were.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-full focus:bg-neutral-50 focus:px-5 focus:py-3 focus:text-sm focus:text-neutral-900"
      >
        Skip to main content
      </a>
      {/* Runs while the HTML is still being read, before anything is
          painted: if this browser has already confirmed its age, flag
          <html> so the server-rendered gate below is hidden from the start
          (the rule is in globals.css). Keep the key in step with
          STORAGE_KEY in components/age-gate.tsx. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem("ff-age-verified")==="true")document.documentElement.dataset.ageVerified="true"}catch(e){}`,
        }}
      />
      <AgeGate />
      <CookieConsent />
      <SmoothScroll />
      <ReducedMotionBoundary>
        <Preloader />
        <Navbar />
        {/* tabIndex -1 lets the skip link and the age gate move focus here
          programmatically without adding it to the Tab order. */}
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
      </ReducedMotionBoundary>
    </>
  )
}
