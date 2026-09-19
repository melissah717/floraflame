import { AgeGate } from "@/components/age-gate";
import { CookieConsent } from "@/components/cookie-consent";
import { Preloader } from "@/components/preloader";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";

/**
 * The public site's shell. Everything that used to sit in the root layout
 * and wrap every route now wraps only the routes in this group, so /admin
 * gets a clean page instead of inheriting the age gate and the preloader.
 *
 * `(site)` is a route group: it scopes this layout without appearing in
 * any URL. /, /strains, /learn and /merch are all exactly where they were.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-neutral-50 focus:px-5 focus:py-3 focus:text-sm focus:text-neutral-900"
      >
        Skip to main content
      </a>
      <AgeGate />
      <CookieConsent />
      <Preloader />
      <SmoothScroll />
      <Navbar />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
