"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";

/**
 * JSX collapses newlines in a text node into a single space, so multi-line
 * source renders as one run-on line. Each entry here is its own block.
 */
const HEADING = [
  "Our Story.",
  "The Way Nature Intended",
  "Living Soil",
  "Small Batch by Design",
  "Oakland Grown",
];

const STATS = [
  { k: "Founded", v: "2017" },
  { k: "Based in", v: "Oakland, CA" },
  { k: "Stockists", v: "30+ statewide" },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /**
   * Scroll-LINKED, not triggered. whileInView fires once and stays, and the
   * left column is sticky so it never leaves the viewport to re-trigger.
   * Binding to scroll gives reverse-on-scroll-up for free.
   */
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  const { scrollYProgress: imgProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });

  /**
   * Slide-up, no fade. The two values below must travel the SAME distance
   * or the copy overlaps a photo that's still on screen.
   *
   *   imgY  -100%  → percentages on translate resolve against the ELEMENT's
   *                  own height, and the element fills the frame. So -100%
   *                  is exactly one frame height.
   *   margin -125%  → percentages on margin resolve against the parent's
   *                  WIDTH. The frame is aspect-[4/5], so its height is
   *                  125% of its width. Also exactly one frame height.
   *
   * Different denominators, same pixel distance. The photo's bottom edge
   * and the top of the copy below move in lockstep: no gap opens beneath
   * the photo, and nothing ever slides over it.
   */
  const marginBottom = useTransform(imgProgress, [0.45, 0.95], ["0%", "-125%"]);
  const imgY = useTransform(imgProgress, [0.45, 0.95], ["0%", "-100%"]);

  return (
    // NO overflow-hidden here — an overflow-hidden ancestor silently
    // disables position:sticky for every descendant.
    <section
      ref={sectionRef}
      id="about"
      className="scroll-mt-20 border-t border-neutral-200 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <SectionLabel number="01">About Us</SectionLabel>
          </Reveal>

          <h2 className="mt-8 font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            {HEADING.map((line, i) => (
              <HeadingLine
                key={line}
                text={line}
                index={i}
                total={HEADING.length}
                progress={sectionProgress}
                disabled={!!reduce}
              />
            ))}
          </h2>

          <Reveal delay={0.15}>
            <p className="mt-8 max-w-md text-base leading-relaxed text-neutral-500">
              No-till. No synthetics. No pesticides. No shortcuts.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm tracking-[0.02em]"
            >
              Get to know us
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="space-y-10">
          {/* aspect-[4/5] sizes the frame at all times, so <Image fill>
              always has a positioned ancestor with real height. */}
          <motion.div
            ref={imgRef}
            style={reduce ? undefined : { marginBottom }}
            className="relative aspect-[4/5] w-full overflow-hidden"
          >
            <motion.div
              style={reduce ? undefined : { y: imgY }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src="/about.webp"
                alt="Hand-tending plants in the Oakland grow room"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          <Reveal>
            <p className="text-lg leading-relaxed text-neutral-600">
              At Flora &amp; Flame, every plant is nurtured with care.
              We&apos;re a small team of craft cannabis cultivators based in
              Oakland, California. We grow flower the way it&apos;s supposed to
              be grown: in living soil, by hand, pesticide free, with no
              shortcuts and no synthetic inputs.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="text-lg leading-relaxed text-neutral-600">
              Every plant is nurtured from seed to harvest in our indoor
              no-till facility. Every bud is hand-trimmed and hand-packaged. We
              don&apos;t use machines because machines don&apos;t give a f*ck
              about trichomes.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="text-lg leading-relaxed text-neutral-600">
              We&apos;re not trying to be the biggest cannabis brand in
              California. We&apos;re trying to grow the best flower we can,
              batch after batch, and work with retail partners who understand
              the difference.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-neutral-200 pt-10 sm:grid-cols-3">
              {STATS.map(({ k, v }) => (
                <div key={k}>
                  <dt className="text-xs tracking-[0.04em] text-neutral-500">
                    {k}
                  </dt>
                  <dd className="mt-2 font-display text-2xl">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * One heading line. Each takes its own slice of the section's scroll range,
 * so they arrive in sequence and retreat in sequence on the way back up.
 */
function HeadingLine({
  text,
  index,
  total,
  progress,
  disabled,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.2 + (index / total) * 0.5;
  const end = start + 0.22;

  const y = useTransform(progress, [start, end], ["115%", "0%"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  if (disabled) {
    return <span className="block pb-1">{text}</span>;
  }

  return (
    <span className="block overflow-hidden pb-1">
      <motion.span style={{ y, opacity }} className="block will-change-transform">
        {text}
      </motion.span>
    </span>
  );
}