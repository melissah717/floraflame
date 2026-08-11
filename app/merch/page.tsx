import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

const TEASER_IMAGE =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786469936/slowmo_floratees_1_fc1jnc.gif";

/**
 * Skeleton page — placeholder product grid. No storefront yet (waiting
 * on the Stripe integration); this is the layout scaffold to build the
 * actual shop into once that's wired up.
 */
const PLACEHOLDER_COUNT = 8;

// noindex until there's real product content — an empty skeleton grid is
// exactly the kind of thin page that can drag down how search engines
// weigh the rest of the site. Drop this once merch actually ships.
const TITLE = "Merch"
const DESCRIPTION = "Flora & Flame merch, coming soon."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/merch" },
  robots: { index: false, follow: true },
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

export default function MerchPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <SectionLabel number="—">Merch</SectionLabel>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
          Gear for the shelf.
        </h1>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 sm:mt-10">
        <ComingSoonBanner>
          Coming soon, the shop isn&apos;t open yet.
        </ComingSoonBanner>
      </Reveal>

      <Reveal delay={0.08} className="mt-8 sm:mt-10">
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-950 shadow-[0_0_0_1px_rgb(250_248_244_/_0.02)]">
          {/* GIF, so unoptimized — Next's image optimizer strips animation
              from GIFs when it processes them, same reason the-farm's video
              and the navbar's SVG logo bypass it too. */}
          <Image
            src={TEASER_IMAGE}
            alt="A first look at Flora & Flame merch"
            fill
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover"
            unoptimized
          />
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-2xl bg-neutral-800" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-neutral-800" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
