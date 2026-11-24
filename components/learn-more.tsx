import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BreadcrumbJsonLd } from "@/lib/json-ld"

const PAGES = [
  { href: "/learn/the-leaf", title: "The Leaf", blurb: "Cannabinoids, terpenes and plant anatomy" },
  { href: "/learn/the-soil", title: "The Soil", blurb: "How indoor living soil works" },
  { href: "/learn/the-farm", title: "The Farm", blurb: "Inside the Oakland grow" },
] as const

type LearnHref = (typeof PAGES)[number]["href"]

/**
 * Footer for each Learn page: links to the other two, plus the page's
 * breadcrumb structured data. Pages that only link "up" to /learn leave
 * Google (and readers) a dead end; cross-links pass relevance between them
 * and keep people reading.
 */
export function LearnMore({ current }: { current: LearnHref }) {
  const page = PAGES.find((p) => p.href === current)!
  const others = PAGES.filter((p) => p.href !== current)

  return (
    <nav
      aria-label="Keep learning"
      className="bg-neutral-900 px-5 py-16 text-neutral-50 sm:px-8 sm:py-20 lg:px-14"
    >
      <BreadcrumbJsonLd
        trail={[
          ["Learn", "/learn"],
          [page.title, page.href],
        ]}
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {others.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group flex h-full items-start justify-between gap-4 rounded-2xl bg-neutral-700/50 p-6 transition-colors hover:bg-neutral-700/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50 motion-reduce:transition-none sm:p-7"
            >
              <span>
                <span className="block font-display text-2xl">{p.title}</span>
                <span className="mt-1 block text-sm text-neutral-400">{p.blurb}</span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="mt-2 size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
