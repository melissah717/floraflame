import type { Metadata, Viewport } from "next";
import { Archivo, Karla } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AgeGate } from "@/components/age-gate";
import { CookieConsent } from "@/components/cookie-consent";
import { Preloader } from "@/components/preloader";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css";

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

const SITE_URL = "https://floraflame.ca";
const SITE_NAME = "Flora & Flame";
const SITE_TITLE = "Flora & Flame · Living Soil Cannabis, Oakland CA";
const SITE_DESCRIPTION =
  "Small-batch, no-till living soil cannabis grown by hand in Oakland, California. Pesticide-free, hand-trimmed flower for licensed retailers statewide.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "living soil cannabis",
    "Oakland cannabis cultivator",
    "no-till cannabis",
    "craft cannabis California",
    "small batch cannabis flower",
    "California cannabis wholesale",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
  alternates: {
    canonical: "/",
  },
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
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
  return (
    <html lang="en" className={`${archivo.variable} ${karla.variable} bg-neutral-900`}>
      <body className="bg-neutral-900 font-sans text-neutral-50 antialiased">
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}