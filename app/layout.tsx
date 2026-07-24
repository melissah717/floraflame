import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Flora & Flame — Living Soil Cannabis, Oakland CA",
  description:
    "Placeholder meta description. Living soil cannabis grown in Oakland, California.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="bg-neutral-50 font-sans text-neutral-900 antialiased">
        <Preloader />
        <Navbar />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}