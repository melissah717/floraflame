import { Hero } from "@/components/sections/hero";
import { Drops } from "@/components/sections/drops";
import { About } from "@/components/sections/about";
import { LetsTalk } from "@/components/sections/lets-talk";
import { Wholesale } from "@/components/sections/wholesale";
import { FindUs } from "@/components/sections/find-us";
import { getCurrentDrops } from "@/lib/strains";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Re-checks Supabase for new/updated drops every hour rather than only at
// build time, without giving up static generation for the rest of the
// page the way force-dynamic would.
export const revalidate = 3600;

// Organization schema, not LocalBusiness — Flora & Flame sells wholesale to
// licensed retailers rather than operating its own public storefront, so
// there's no street address to publish.
//
// `sameAs` is how a search engine connects these profiles to the brand
// rather than treating them as unrelated pages that happen to share a name.
// Keep it in step with the socials listed in components/footer.tsx.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Small-batch, no-till living soil cannabis cultivator based in Oakland, California.",
  foundingDate: "2017",
  sameAs: [
    "https://www.youtube.com/@FloraFlameCA",
    "https://instagram.com/floraandflameca",
    "https://weedmaps.com/brands/flora-flame",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Oakland",
    addressRegion: "CA",
    addressCountry: "US",
  },
};

/**
 * WebSite schema is what Google reads for the SITE NAME shown above a
 * result ("Flora & Flame" rather than a bare domain). It only counts on the
 * home page. alternateName covers the ways people actually type the brand.
 */
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["Flora and Flame", "Flora & Flame Cannabis"],
  url: SITE_URL,
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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      <Hero />

      {/*
        Everything below the hero scrolls OVER it.
        - relative z-10 puts it above the sticky hero
        - bg-neutral-900 makes it opaque, so the hero doesn't show through
        Sections with their own bg (marquee band, wholesale) override it.
      */}
      <div className="relative z-10 bg-neutral-900">
        <Drops strains={strains} />
        <About />
        <LetsTalk>
          <Wholesale />
        </LetsTalk>
        <FindUs />
      </div>
    </>
  );
}