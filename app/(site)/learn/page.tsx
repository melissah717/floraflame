import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/scroll-primitives";
import { BreadcrumbJsonLd } from "@/lib/json-ld";

const TITLE = "Learn About Indoor Living Soil Cannabis"
const DESCRIPTION =
  "Cannabinoids and terpenes, how no-till living soil works, and a look inside our indoor Oakland grow, from a small-batch California cultivator."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn" },
}

const IMG = "https://res.cloudinary.com/g0mcdcfr/image/upload";

/**
 * Three square cards, each a photo under a dark wash with the title on top.
 * No accent colours, numbers or kickers: the photo does the differentiating
 * and the type stays one voice across all three.
 *
 * Three across on large screens. Between phone and large, two columns would
 * leave the third card alone in a row, so it spans both and goes wide.
 */
const ENTRIES = [
  {
    slug: "the-leaf",
    title: "The Leaf",
    excerpt:
      "Cannabinoids, terpenes, and plant anatomy. The stuff that matters more than the number on the label.",
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
];

/** Shared side padding — matches the other full-bleed sections
 * (living-soil.tsx, breakdown.tsx). */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export default function LearnPage() {
  return (
    <div className={`bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48 ${GUTTER}`}>
      <BreadcrumbJsonLd trail={[["Learn", "/learn"]]} />
      <Reveal>
        <h1 className="max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
          More than what&apos;s on the label
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
          Good flower deserves more than lazy numbers and buzzwords. Learn what matters,
          what changes the high, and what separates real care from marketing.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {ENTRIES.map((entry, index) => {
          const wide = index === ENTRIES.length - 1;
          return (
            <Reveal
              key={entry.slug}
              delay={index * 0.06}
              className={wide ? "sm:col-span-2 lg:col-span-1" : undefined}
            >
              <LearnCard entry={entry} priority={index < 2} wide={wide} />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function LearnCard({
  entry,
  priority,
  wide,
}: {
  entry: (typeof ENTRIES)[number];
  priority: boolean;
  wide: boolean;
}) {
  return (
    <Link
      href={`/learn/${entry.slug}`}
      className={`group relative block overflow-hidden rounded-md bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-50/70 ${
        wide ? "aspect-square sm:aspect-[2/1] lg:aspect-square" : "aspect-square"
      }`}
    >
      {/* Photo — eases in a touch on hover, behind everything.
          will-change-transform is load-bearing, not a micro-optimisation:
          the card clips with overflow-hidden and a rounded corner, so
          without its own compositing layer the browser re-rasterises and
          re-clips the photo on every frame of the scale, which reads as a
          shimmer along the edges. */}
      <Image
        src={entry.image}
        alt={entry.alt}
        fill
        priority={priority}
        sizes={
          wide
            ? "(max-width: 1024px) 100vw, 33vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
      />
      {/* Black wash. Sits heavy at rest so the type reads, lifts slightly on
          hover so the photo comes forward.
          Animates OPACITY, not background-color. Same look, but colour is a
          paint property — transitioning it repainted a full-card overlay
          every frame, directly on top of the photo that was also being
          re-rasterised. Opacity stays on the compositor. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black opacity-60 transition-opacity duration-500 group-hover:opacity-45"
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
      {/* transition-[opacity,transform], not transition-all: `all` makes the
          browser watch every animatable property on the element, including
          layout ones it has no business animating here. */}
      <span className="absolute bottom-5 right-5 flex items-center gap-2 text-xs tracking-[0.08em] text-neutral-100 opacity-0 transition-[opacity,transform] duration-400 will-change-[opacity,transform] group-hover:opacity-100 group-hover:-translate-y-0.5 sm:bottom-6 sm:right-6">
        Read
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
