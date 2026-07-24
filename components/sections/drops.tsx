"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { DROPS, type Drop } from "@/lib/data";
import { Reveal, RevealSide, SectionLabel } from "@/components/scroll-primitives";

export function Drops() {
  return (
    <section id="drops" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="01">Latest Drops</SectionLabel>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-[20ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-6xl">
            Every harvest is its own thing. Here is what is on the shelf now.
          </h2>
        </Reveal>

        {/* Alternating full-width rows instead of a flat grid —
            each one enters from the side its image sits on. */}
        <div className="mt-24 space-y-28 sm:space-y-40">
          {DROPS.map((drop, i) => (
            <DropRow key={drop.slug} drop={drop} index={i} flipped={i % 2 === 1} />
          ))}
        </div>

        <Reveal className="mt-24">
          <Link
            href="/drops"
            className="group inline-flex items-center gap-2 text-sm tracking-[0.02em]"
          >
            See all drops
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function DropRow({
  drop,
  index,
  flipped,
}: {
  drop: Drop;
  index: number;
  flipped: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Image drifts vertically inside its frame as the row passes.
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  // Oversized index numeral slides opposite the content for counterweight.
  const numX = useTransform(
    scrollYProgress,
    [0, 1],
    flipped ? ["10%", "-10%"] : ["-10%", "10%"]
  );

  return (
    <div ref={ref} className="relative">
      {/* Ghost numeral behind the row. */}
      <motion.span
        aria-hidden
        style={reduce ? undefined : { x: numX }}
        className={[
          "pointer-events-none absolute -top-12 select-none font-display text-[22vw] leading-none text-neutral-100 sm:text-[16vw]",
          flipped ? "right-0" : "left-0",
        ].join(" ")}
      >
        0{index + 1}
      </motion.span>

      <div
        className={[
          "relative grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
          flipped ? "lg:[&>*:first-child]:order-2" : "",
        ].join(" ")}
      >
        <RevealSide from={flipped ? "right" : "left"} distance={90}>
          <Link href={`/drops/${drop.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 lg:aspect-[4/5]">
              <motion.div
                style={reduce ? undefined : { y: imgY }}
                className="relative h-[116%] w-full"
              >
                <Image
                  src={drop.image}
                  alt={drop.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </motion.div>

              {drop.status !== "available" && (
                <span className="absolute left-4 top-4 bg-neutral-50 px-3 py-1.5 text-xs tracking-[0.04em]">
                  {drop.status}
                </span>
              )}
            </div>
          </Link>
        </RevealSide>

        <RevealSide from={flipped ? "left" : "right"} distance={60} delay={0.12}>
          <div className={flipped ? "lg:pr-8" : "lg:pl-8"}>
            <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs tracking-[0.04em] text-neutral-500">
                {drop.category}
              </span>
              <span className="text-[11px] tabular-nums text-neutral-400">
                {drop.year}
              </span>
            </div>

            <h3 className="mt-6 font-display text-5xl leading-[0.95] tracking-[-0.01em] sm:text-6xl">
              {drop.name}
            </h3>

            <p className="mt-3 text-xs tracking-[0.04em] text-neutral-500">
              {drop.lineage}
            </p>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-500">
              {drop.blurb}
            </p>

            <Link
              href={`/drops/${drop.slug}`}
              className="group mt-8 inline-flex items-center gap-2 text-sm tracking-[0.02em]"
            >
              View drop
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </RevealSide>
      </div>
    </div>
  );
}