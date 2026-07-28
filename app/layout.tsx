import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { CookieConsent } from "@/components/cookie-consent";
import { Preloader } from "@/components/preloader";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";
import "./globals.css";

/**
 * Fraunces — a "soft serif" with optical size, SOFT and WONK axes.
 * Warm, slightly irregular, agricultural rather than editorial.
 * WONK enables the quirky angled terminals on g/y/w.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

/**
 * Karla — humanist grotesque with a bit of character in the leg of the R
 * and the a. Warmer and less corporate than Inter at body sizes.
 */
const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

const SITE_URL = "https://floraandflame.co";
const SITE_NAME = "Flora & Flame";
const SITE_TITLE = "Flora & Flame — Living Soil Cannabis, Oakland CA";
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
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1915",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="bg-neutral-50 font-sans text-neutral-900 antialiased">
        <AgeGate />
        <CookieConsent />
        <Preloader />
        <Navbar />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}