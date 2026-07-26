"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { DROPS, type Drop } from "@/lib/data";
import { SectionLabel } from "@/components/scroll-primitives";

/**
 * Scroll-driven horizontal carousel.
 *
 * SIZING RULE: inside a pinned h-svh container, cards must be sized by
 * HEIGHT, never width. A w-[38vw] card with aspect-[4/5] is ~680px tall on
 * a 1400px screen — taller than the viewport, so overflow-hidden clips it.
 * Here the row is a flex-1 region and cards are h-full, so they can never
 * exceed the space available no matter the screen.
 *
 * Desktop: pinned, vertical scroll drives horizontal movement. Travel
 * distance is measured from the row's real scrollWidth, so the pin ends
 * exactly when the last card is flush — add a fourth drop and it adapts.
 *
 * Mobile: native overflow-x + scroll-snap. Pinned horizontal scroll fights
 * the browser's touch gestures, and swiping is the expectation anyway.
 */
export function Drops() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const measure = () => {
      const isDesktop = mq.matches && !reduce;
      setPinned(isDesktop);

      if (isDesktop && rowRef.current) {
        const overflow = rowRef.current.scrollWidth - window.innerWidth;
        setDistance(Math.max(0, overflow + 64));
      } else {
        setDistance(0);
      }
    };

    // rAF lets layout settle before measuring, otherwise scrollWidth can
    // read stale on first paint.
    const raf = requestAnimationFrame(measure);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // ---------- Mobile / reduced motion ----------
  if (!pinned) {
    return (
      <section id="drops" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel number="01">Latest Drops</SectionLabel>
          <h2 className="mt-6 max-w-[20ch] font-display text-4xl leading-[1.05] tracking-[-0.01em]">
            Every harvest is its own thing. Here is what is on the shelf now.
          </h2>
        </div>

        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DROPS.map((drop, i) => (
            <div
              key={drop.slug}
              className="w-[78vw] shrink-0 snap-center sm:w-[46vw]"
            >
              <DropCard drop={drop} index={i} />
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs text-neutral-500">Swipe to browse →</p>
        </div>
      </section>
    );
  }

  // ---------- Desktop: pinned horizontal ----------
  return (
    <section
      id="drops"
      ref={trackRef}
      className="relative scroll-mt-20"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      {/* flex column: header (fixed) / row (flexible) / rail (fixed).
          min-h-0 on the row is what lets it shrink instead of overflowing. */}
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pb-8 pt-28">
        <div className="mx-auto w-full max-w-7xl shrink-0 px-8">
          <SectionLabel number="01">Latest Drops</SectionLabel>
          <h2 className="mt-4 max-w-[26ch] font-display text-3xl leading-[1.05] tracking-[-0.01em] xl:text-4xl">
            Every harvest is its own thing. Here is what is on the shelf now.
          </h2>
        </div>

        <div className="mt-8 flex min-h-0 flex-1 items-stretch">
          <motion.div
            ref={rowRef}
            style={{ x }}
            className="flex w-max gap-8 px-8 will-change-transform"
          >
            {DROPS.map((drop, i) => (
              <div
                key={drop.slug}
                className="h-full w-[26vw] max-w-[420px] shrink-0"
              >
                <DropCard drop={drop} index={i} fill />
              </div>
            ))}

            <Link
              href="/drops"
              className="group flex h-full w-[22vw] max-w-[300px] shrink-0 flex-col justify-end border-l border-neutral-200 pb-4 pl-8"
            >
              <span className="font-display text-3xl leading-tight">
                See the full archive
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors group-hover:text-neutral-900">
                Every drop we&apos;ve run
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-7xl shrink-0 px-8">
          <div className="h-px w-full bg-neutral-200">
            <motion.div
              style={{ width: progressWidth }}
              className="h-px bg-neutral-900"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DropCard({
  drop,
  index,
  fill = false,
}: {
  drop: Drop;
  index: number;
  /** true = fill the parent's height (pinned desktop layout) */
  fill?: boolean;
}) {
  return (
    <Link
      href={`/drops/${drop.slug}`}
      className={fill ? "group flex h-full flex-col" : "group block"}
    >
      <div
        className={[
          "relative overflow-hidden bg-neutral-100",
          fill ? "min-h-0 flex-1" : "aspect-[4/5]",
        ].join(" ")}
      >
        <Image
          src={drop.image}
          alt={drop.name}
          fill
          sizes="(max-width: 1024px) 78vw, 26vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        <span className="absolute left-4 top-4 font-display text-sm text-neutral-50 mix-blend-difference">
          0{index + 1}
        </span>

        {drop.status !== "available" && (
          <span className="absolute right-4 top-4 bg-neutral-50 px-3 py-1.5 text-xs tracking-[0.04em]">
            {drop.status}
          </span>
        )}
      </div>

      <div className="shrink-0">
        <div className="mt-4 flex items-baseline justify-between border-b border-neutral-200 pb-2">
          <span className="text-xs tracking-[0.04em] text-neutral-500">
            {drop.category}
          </span>
          <span className="text-xs tabular-nums text-neutral-500">
            {drop.year}
          </span>
        </div>

        <h3 className="mt-3 font-display text-3xl leading-none">{drop.name}</h3>
        <p className="mt-1.5 text-xs tracking-[0.04em] text-neutral-500">
          {drop.lineage}
        </p>

        {/* Blurb only in the non-pinned layout — vertical space is scarce
            in the pinned one and the image should win. */}
        {!fill && (
          <p className="mt-3 line-clamp-3 text-base leading-relaxed text-neutral-500">
            {drop.blurb}
          </p>
        )}
      </div>
    </Link>
  );
}