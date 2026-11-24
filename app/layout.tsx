import type { Metadata, Viewport } from "next";
import { Archivo, Karla } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Archivo — a sturdy grotesque with a wide weight range and a width axis.
 * Modern and poster-like at display sizes, clean at paragraph sizes. Loaded
 * as a variable font so `font-variation-settings: 'wght'` overrides work.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

/**
 * Karla — humanist grotesque with a bit of character in the leg of the R
 * and the a. Warmer and less corporate than Inter at body sizes.
 */
const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

// "Official Website" is deliberate: an older domain still presents itself
// as the brand's site, and this phrase (with the matching WebSite and
// Organization schema on the home page) is how searchers and search engines
// tell which one is current.
const SITE_TITLE = "Flora & Flame | Official Website – Indoor Living Soil Cannabis";
const SITE_DESCRIPTION =
  "The official website of Flora & Flame: small-batch indoor living soil cannabis, grown by hand in Oakland, California. See strains, events and where to buy.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "indoor living soil cannabis",
    "living soil cannabis",
    "Oakland cannabis cultivator",
    "Flora and Flame",
    "Flora & Flame official website",
    "craft cannabis California",
    "small batch cannabis flower",
    "California cannabis wholesale",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // No title/description here on purpose: Next copies each page's own
  // title and description into og:/twitter: tags when these are absent, so
  // a shared /strains link previews as "Strains", not the homepage. Pages
  // should NOT set their own `openGraph` either — Next merges it shallowly,
  // so a page-level block would replace siteName/locale below wholesale.
  // The share image comes from app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    // "./" resolves against each page's own path, so every page gets its
    // own og:url instead of none.
    url: "./",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  // Favicon/apple-touch-icon come from app/icon.png + app/apple-icon.png —
  // Next's file convention picks those up automatically, no manual `icons`
  // entry needed (and one here would just fight the convention).
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Deliberately bare: <html>, <body>, the font variables, and the two
   * Vercel beacons. Nothing else.
   *
   * The public site's chrome — age gate, cookie banner, preloader, Lenis
   * smooth scroll, nav and footer — lives one level down in
   * app/(site)/layout.tsx. That split is what lets /admin exist: an age
   * gate over the login form, a preloader in front of it, and Lenis
   * hijacking scroll inside a long form are all wrong for a back office,
   * and there is no way to opt a route OUT of a layout above it.
   *
   * Route groups don't appear in URLs, so nothing the site serves moved.
   */
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${karla.variable} bg-neutral-900`}
      // The public site's age-gate script adds data-age-verified to this
      // element before React loads; this tells React that's expected.
      suppressHydrationWarning
    >
      <body className="bg-neutral-900 font-sans text-neutral-50 antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
