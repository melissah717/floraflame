import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { RGB } from "@/lib/spectrum";

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

/** Inserts an alpha channel into a legacy-space rgb() string, e.g.
 * "rgb(139 92 246)" -> "rgb(139 92 246 / 0.15)". */
function withAlpha(rgb: string, alpha: number) {
  return rgb.replace(/\)$/, ` / ${alpha})`);
}

const ENTRIES = [
  {
    slug: "the-leaf",
    title: "The Leaf",
    kicker: "Cannabinoids & terpenes",
    excerpt:
      "Cannabinoids, terpenes, plant anatomy, and how different consumption methods actually feel. The stuff that matters more than the number on the label.",
    accent: RGB.sativa,
  },
  {
    slug: "the-soil",
    title: "The Soil",
    kicker: "The method",
    excerpt:
      "No-till. No synthetics. No pesticides. The whole method comes down to one idea, and it isn't a shortcut.",
    accent: RGB.hybrid,
  },
  {
    slug: "the-farm",
    title: "The Farm",
    kicker: "Behind the grow",
    excerpt:
      "Photos and video from the Oakland facility. The plants, the room, the hands actually doing the work.",
    accent: RGB.indica,
  },
  {
    slug: "the-knowledge",
    title: "The Knowledge",
    kicker: "Notes from the grow",
    excerpt:
      "Everything else worth writing down, grouped by topic and added to as we go.",
    accent: RGB.red,
  },
];

/** Shared side padding — matches the other full-bleed sections
 * (living-soil.tsx, breakdown.tsx). */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export default function LearnPage() {
  return (
    <div className="bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48">
      <div className={GUTTER}>
        <Reveal>
          <SectionLabel number="—" tone="light">
            Learn
          </SectionLabel>
          <h1 className="mt-5 max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
            More than what&apos;s on the label
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
            Good flower deserves more than lazy numbers and buzzwords. Learn what matters,
            what changes the high, and what separates real care from marketing.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-20 border-t border-neutral-800 sm:mt-28">
        {ENTRIES.map((entry, index) => (
          <LearnRow key={entry.slug} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function LearnRow({
  entry,
  index,
}: {
  entry: (typeof ENTRIES)[number];
  index: number;
}) {
  return (
    <Reveal delay={index * 0.06}>
      <Link
        href={`/learn/${entry.slug}`}
        className={`group relative flex flex-col gap-6 border-b border-neutral-800 py-12 transition-colors duration-300 sm:py-16 lg:flex-row lg:items-center lg:justify-between ${GUTTER}`}
      >
        {/* Accent wash sweeps in from the left on hover — same idea as the
            chapter-card gradients in breakdown.tsx, just horizontal. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage: `linear-gradient(90deg, ${withAlpha(entry.accent, 0.12)} 0%, transparent 55%)`,
          }}
        />

        <div className="relative flex items-start gap-5 sm:gap-8 lg:items-center">
          <span
            className="font-display text-2xl leading-none sm:text-3xl"
            style={{ color: entry.accent }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="flex items-center gap-3 text-xs tracking-[0.08em] text-neutral-500">
              <span className="h-px w-8" style={{ backgroundColor: entry.accent }} />
              <span>{entry.kicker}</span>
            </div>
            <h2 className="mt-2 font-display uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(2.25rem,6vw,4.5rem)] transition-transform duration-500 ease-out group-hover:translate-x-2">
              {entry.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base">
              {entry.excerpt}
            </p>
          </div>
        </div>

        <span
          className="relative flex shrink-0 items-center gap-2 self-start text-xs tracking-[0.08em] text-neutral-300 lg:self-auto"
        >
          Read
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            style={{ color: entry.accent }}
          />
        </span>
      </Link>
    </Reveal>
  );
}
