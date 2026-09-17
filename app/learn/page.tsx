import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/scroll-primitives";

const TITLE = "Learn"
const DESCRIPTION =
  "Cannabinoids and terpenes, the no-till growing method, life inside the Oakland facility, and notes from the grow, all in one place."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn" },
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

const IMG = "https://res.cloudinary.com/g0mcdcfr/image/upload";

/**
 * Four square cards, each a photo under a dark wash with the title on top.
 * No accent colours, numbers or kickers: the photo does the differentiating
 * and the type stays one voice across all four.
 */
const ENTRIES = [
  {
    slug: "the-leaf",
    title: "The Leaf",
    excerpt:
      "Cannabinoids, terpenes, plant anatomy, and how different consumption methods actually feel. The stuff that matters more than the number on the label.",
    image: `${IMG}/v1785616995/PINEAPPLE-2_nr7vcn.jpg`,
    alt: "Close-up of a cured flower",
  },
  {
    slug: "the-soil",
    title: "The Soil",
    excerpt:
      "No-till. No synthetics. No pesticides. The whole method comes down to one idea, and it isn't a shortcut.",
    image: `${IMG}/v1789683610/FF_1_t0sthh.jpg`,
    alt: "Living soil bed",
  },
  {
    slug: "the-farm",
    title: "The Farm",
    excerpt:
      "Photos and video from the Oakland facility. The plants, the room, the hands actually doing the work.",
    image: `${IMG}/v1789669950/aisle-center-view.jpg`,
    alt: "Center aisle of the Oakland grow room",
  },
  {
    slug: "the-knowledge",
    title: "The Knowledge",
    excerpt:
      "Everything else worth writing down, grouped by topic and added to as we go.",
    image: `${IMG}/v1786498062/plant-pots.jpg`,
    alt: "Plant pots in the grow room",
  },
];

/** Shared side padding — matches the other full-bleed sections
 * (living-soil.tsx, breakdown.tsx). */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export default function LearnPage() {
  return (
    <div className={`bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48 ${GUTTER}`}>
      <Reveal>
        <h1 className="max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
          More than what&apos;s on the label
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
          Good flower deserves more than lazy numbers and buzzwords. Learn what matters,
          what changes the high, and what separates real care from marketing.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {ENTRIES.map((entry, index) => (
          <Reveal key={entry.slug} delay={index * 0.06}>
            <LearnCard entry={entry} priority={index < 2} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function LearnCard({
  entry,
  priority,
}: {
  entry: (typeof ENTRIES)[number];
  priority: boolean;
}) {
  return (
    <Link
      href={`/learn/${entry.slug}`}
      className="group relative block aspect-square overflow-hidden rounded-md bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-50/70"
    >
      {/* Photo — eases in a touch on hover, behind everything. */}
      <Image
        src={entry.image}
        alt={entry.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      {/* Black wash. Sits heavy at rest so the type reads, lifts slightly on
          hover so the photo comes forward. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black/60 transition-colors duration-500 group-hover:bg-black/45"
      />

      {/* Content — centred, like the mock. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center sm:p-8">
        <h2 className="font-display uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(2.25rem,5vw,4.5rem)] transition-transform duration-500 ease-out group-hover:-translate-y-1">
          {entry.title}
        </h2>
        <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-neutral-200 sm:text-base">
          {entry.excerpt}
        </p>
      </div>

      {/* Read cue — bottom right, fades up on hover. */}
      <span className="absolute bottom-5 right-5 flex items-center gap-2 text-xs tracking-[0.08em] text-neutral-100 opacity-0 transition-all duration-400 group-hover:opacity-100 group-hover:-translate-y-0.5 sm:bottom-6 sm:right-6">
        Read
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
