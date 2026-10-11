import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
}

const LINKS = [
  ["Home", "/"],
  ["Strains", "/strains"],
  ["Find Us", "/find-us"],
  ["Learn", "/learn"],
] as const

/**
 * Site-wide 404. Renders inside the root layout only (no nav, footer or
 * age gate), so it carries its own way back: a 404 with no links is a
 * dead end for visitors and for crawlers following an old URL, like the
 * ones the previous site left behind.
 */
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center bg-neutral-900 px-5 text-center text-neutral-50"
    >
      <p className="text-[13px] uppercase tracking-[0.18em] text-neutral-400">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-6xl">
        This page isn&apos;t here.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-300">
        It may have moved, or the link may be from our old site. Try one of
        these instead.
      </p>
      <nav aria-label="Main pages" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className="text-lg underline underline-offset-4 hover:text-neutral-300"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
