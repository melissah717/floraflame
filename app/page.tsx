import { Hero } from "@/components/sections/hero";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { Drops } from "@/components/sections/drops";
import { About } from "@/components/sections/about";
import { SectionTransition } from "@/components/sections/section-transition";
import { Wholesale } from "@/components/sections/wholesale";
import { FindUs } from "@/components/sections/find-us";
import { LivingSoil } from "@/components/sections/living-soil";
import { getCurrentDrops } from "@/lib/strains";

// Re-checks Supabase for new/updated drops every hour rather than only at
// build time, without giving up static generation for the rest of the
// page the way force-dynamic would.
export const revalidate = 3600;

// Organization schema, not LocalBusiness — Flora & Flame sells wholesale to
// licensed retailers rather than operating its own public storefront, so
// there's no street address to publish. Add `sameAs` social URLs here once
// the footer's Instagram/Weedmaps/Leafly links are wired to real profiles.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Flora & Flame",
  url: "https://floraflame.ca",
  logo: "https://floraflame.ca/logo.png",
  description:
    "Small-batch, no-till living soil cannabis cultivator based in Oakland, California.",
  foundingDate: "2017",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Oakland",
    addressRegion: "CA",
    addressCountry: "US",
  },
};

export default async function HomePage() {
  const strains = await getCurrentDrops();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
      />
      <Hero />

      {/*
        Everything below the hero scrolls OVER it.
        - relative z-10 puts it above the sticky hero
        - bg-neutral-50 makes it opaque, so the hero doesn't show through
        Sections with their own bg (marquee band, wholesale) override it.
      */}
      <div className="relative z-10 bg-neutral-50">
        <About />
        <LivingSoil />
        <Drops strains={strains} />
        <SectionTransition />
        <Wholesale />
        <FindUs />
      </div>
    </>
  );
}