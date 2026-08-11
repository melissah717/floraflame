import type { Metadata } from "next";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
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

  return (
    <div className="bg-neutral-900 text-neutral-50">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <SectionLabel number="—" tone="light">
            Strains
          </SectionLabel>
          <h1 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
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
