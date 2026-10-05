import type { Metadata } from "next";
import { Reveal } from "@/components/scroll-primitives";
import { ArchiveClient } from "@/components/archive-client";
import { getArchiveBatches } from "@/lib/strains";

// Re-checks Supabase for new batches every hour rather than only at build
// time, without giving up static generation the way force-dynamic would.
export const revalidate = 3600;

const TITLE = "Strains"
const DESCRIPTION =
  "Every batch Flora & Flame has ever tested: what's currently in rotation and the full history of strains grown in Oakland."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/strains" },
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

export default async function StrainsPage() {
  const batches = await getArchiveBatches();

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
            ? [{ "@type": "PropertyValue", name: "Genetics", value: batch.genetics }]
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
  };

  return (
    <div className="bg-neutral-900 text-neutral-50">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogueJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <h1 className="max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
            Every batch we&apos;ve tested.
          </h1>
        </Reveal>

        <Reveal delay={0.05} className="mt-12 sm:mt-16">
          <ArchiveClient batches={batches} />
        </Reveal>
      </div>
    </div>
  );
}
