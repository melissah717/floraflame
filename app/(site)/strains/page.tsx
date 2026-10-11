import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd, jsonLd } from "@/lib/json-ld"
import { Reveal } from "@/components/scroll-primitives"
import { ArchiveClient } from "@/components/archive-client"
import { getArchiveBatches } from "@/lib/strains"

// Re-checks Supabase for new batches every hour rather than only at build
// time, without giving up static generation the way force-dynamic would.
export const revalidate = 3600

const TITLE = "Living Soil Cannabis Strains"
const DESCRIPTION =
  "Every strain Flora & Flame has grown in Oakland, California: what's in rotation now, with genetics and terpene profiles, plus the full archive of past batches."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/strains" },
}

export default async function StrainsPage() {
  const batches = await getArchiveBatches()

  /*
   * ItemList, not a bare list of Products.
   *
   * The whole catalogue lives behind a card-at-a-time browser, so a crawler
   * reading the HTML sees one strain's name and nothing about the other six.
   * This is the only machine-readable description of what the page actually
   * covers.
   *
   * Deliberately NOT Product schema: Product wants an `offers` block with a
   * price and availability, and Flora & Flame sells wholesale to licensed
   * retailers rather than direct — inventing offers to satisfy a schema
   * validator would be a lie that Google is good at catching. ItemList
   * describes the collection honestly.
   */
  const catalogueJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Flora & Flame strains",
    description: DESCRIPTION,
    numberOfItems: batches.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: batches.map((batch, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: batch.name,
        description: batch.description,
        ...(batch.image ? { image: batch.image } : {}),
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Spectrum",
            value: batch.spectrum,
          },
          ...(batch.genetics
            ? [
                {
                  "@type": "PropertyValue",
                  name: "Genetics",
                  value: batch.genetics,
                },
              ]
            : []),
          ...(batch.terpenes?.length
            ? [
                {
                  "@type": "PropertyValue",
                  name: "Dominant terpenes",
                  value: batch.terpenes.join(", "),
                },
              ]
            : []),
        ],
      },
    })),
  }

  return (
    <div className="bg-neutral-900 text-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(catalogueJsonLd) }}
      />
      <BreadcrumbJsonLd trail={[["Strains", "/strains"]]} />
      <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
        <Reveal>
          <h1 className="max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
            Every batch we&apos;ve tested.
          </h1>
        </Reveal>

        <Reveal delay={0.05} className="mt-12 sm:mt-16">
          <ArchiveClient batches={batches} />
        </Reveal>

        {/*
          Plain-HTML index of every strain. The browser above shows one at a
          time, so without this a crawler (or a screen reader user skimming
          headings) only ever sees a single strain's name.
        */}
        {batches.length > 0 && (
          <section
            aria-labelledby="strain-index"
            className="mt-24 border-t border-neutral-700 pt-12 sm:mt-32"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="strain-index"
                className="font-display text-3xl tracking-[-0.01em] sm:text-4xl"
              >
                All strains
              </h2>
              <Link
                href="/find-us"
                className="text-sm text-neutral-300 underline underline-offset-4 hover:text-neutral-50"
              >
                Find Flora &amp; Flame at a shop near you
              </Link>
            </div>

            <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <li
                  key={batch.slug}
                  className="border-t border-neutral-700 pt-5"
                >
                  <h3 className="font-display text-xl">{batch.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    {[batch.spectrum, batch.genetics]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {batch.terpenes?.length ? (
                    <p className="mt-1 text-sm text-neutral-400">
                      Terpenes: {batch.terpenes.join(", ")}
                    </p>
                  ) : null}
                  {batch.description && (
                    <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                      {batch.description}
                    </p>
                  )}
                  {batch.labReportUrl && (
                    <a
                      href={batch.labReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-neutral-300 underline underline-offset-4 hover:text-neutral-50"
                    >
                      Lab results (PDF)
                      <span className="sr-only">
                        {" "}
                        for {batch.name}, opens in a new tab
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
