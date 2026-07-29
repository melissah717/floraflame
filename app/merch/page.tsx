import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

/**
 * Skeleton page — placeholder product grid. No storefront yet (waiting
 * on the Stripe integration); this is the layout scaffold to build the
 * actual shop into once that's wired up.
 */
const PLACEHOLDER_COUNT = 8;

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
          Coming soon — the shop isn&apos;t open yet.
        </ComingSoonBanner>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
