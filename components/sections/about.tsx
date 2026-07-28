"use client";

import Image from "next/image";
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
 * Full-bleed About.
 *
 * WIDTH: no max-w container — the column is the viewport minus a gutter,
 * matching the Living Soil section. That's also what lets the headline get
 * big: vw sizing only behaves when the column grows with the viewport.
 *
 * The headline is stacked into three short lines on purpose. "The way
 * nature intended" on one line inside a ~45% column would have to be set
 * small, and scale is the whole point.
 */

const HEADING = ["The",  "way", "nature", "intended"];

const STATS = [
  { k: "Founded", v: "2017" },
  { k: "Based in", v: "Oakland, CA" },
];

/** Shared gutter. Keep in sync with the other full-bleed sections. */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 30%"],
  });

  const { scrollYProgress: imgProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });

  /**
   * Photo exits upward. imgY -100% (of the element's own height) and
   * marginBottom -125% (of the parent's WIDTH, and the frame is 4:5 so its
   * height is 125% of its width) are the SAME pixel distance. Different
   * denominators, identical travel — so the copy below follows the photo's
   * bottom edge exactly, with no gap and no overlap.
   */
  const marginBottom = useTransform(imgProgress, [0.45, 0.95], ["0%", "-125%"]);
  const imgY = useTransform(imgProgress, [0.45, 0.95], ["0%", "-100%"]);

  return (
    // No overflow-hidden — an overflow-hidden ancestor silently disables
    // position:sticky for every descendant.
    <section
      ref={sectionRef}
      id="about"
      className={`scroll-mt-20 border-t border-neutral-200 py-28 sm:py-40 ${GUTTER}`}
    >
      <div className="flex flex-col gap-14 lg:flex-row lg:gap-16">
        {/* LEFT — pins while the right column scrolls */}
        <div className="lg:sticky lg:top-28 lg:h-fit lg:w-[46%] lg:shrink-0">
          <Reveal>
            <SectionLabel number="01">About Us</SectionLabel>
          </Reveal>

          <h2 className="mt-10 font-display uppercase leading-[0.86] tracking-[-0.04em]">
            {HEADING.map((line, i) => (
              <HeadingLine
                key={line}
                text={line}
                index={i}
                progress={sectionProgress}
                disabled={!!reduce}
              />
            ))}
          </h2>
        </div>

        {/* RIGHT — scrolls past */}
        <div className="lg:flex-1">
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden">
            <motion.div
              style={reduce ? undefined : { marginBottom }}
              className="absolute inset-0"
            >
              <motion.div
                style={reduce ? undefined : { y: imgY }}
                className="relative h-full w-full will-change-transform"
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
          </div>

          <div className="mt-12 max-w-2xl space-y-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-neutral-600">
                At Flora &amp; Flame, every plant is nurtured with care.
                We&apos;re a small team of craft cannabis cultivators based in
                Oakland, California. We grow flower the way it&apos;s supposed
                to be grown: in living soil, by hand, pesticide free, with no
                shortcuts and no synthetic inputs.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <p className="text-lg leading-relaxed text-neutral-600">
                Every plant is nurtured from seed to harvest in our indoor
                no-till facility. Every bud is hand-trimmed and hand-packaged.
                We don&apos;t use machines because machines don&apos;t give a
                f*ck about trichomes.
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
          </div>

          <dl className="mt-16 flex flex-wrap gap-x-20 gap-y-8 border-t border-neutral-200 pt-10">
            {STATS.map((stat, i) => (
              <Stat
                key={stat.k}
                stat={stat}
                index={i}
                progress={sectionProgress}
                disabled={!!reduce}
              />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * One headline line, sliding in from the left.
 *
 * Each line travels a DIFFERENT distance — 70px, 110px, 150px — on its own
 * overlapping slice of the scroll. Equal travel would read as one block
 * sliding; unequal travel reads as depth, with the furthest-travelling line
 * appearing closest to the viewer.
 *
 * Scroll-linked rather than triggered, so scrolling back up reverses it.
 */
const TRAVEL = [70, 110, 150];

function HeadingLine({
  text,
  index,
  progress,
  disabled,
}: {
  text: string;
  index: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.15 + index * 0.14;
  const end = start + 0.4;

  const x = useTransform(progress, [start, end], [-TRAVEL[index % 3], 0]);
  const opacity = useTransform(progress, [start, start + 0.22], [0, 1]);

  const size = "text-[clamp(2.75rem,7.5vw,10rem)]";

  if (disabled) {
    return <span className={`block ${size}`}>{text}</span>;
  }

  return (
    <motion.span
      style={{ x, opacity }}
      className={`block will-change-transform ${size}`}
    >
      {text}
    </motion.span>
  );
}

/** One figure, on its own staggered slice of the section's scroll. */
function Stat({
  stat,
  index,
  progress,
  disabled,
}: {
  stat: { k: string; v: string };
  index: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.45 + index * 0.12;
  const end = start + 0.35;

  const y = useTransform(progress, [start, end], [40, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  if (disabled) {
    return (
      <div>
        <dt className="text-xs tracking-[0.04em] text-neutral-500">{stat.k}</dt>
        <dd className="mt-2 font-display text-3xl">{stat.v}</dd>
      </div>
    );
  }

  return (
    <motion.div style={{ y, opacity }} className="will-change-transform">
      <dt className="text-xs tracking-[0.04em] text-neutral-500">{stat.k}</dt>
      <dd className="mt-2 font-display text-3xl">{stat.v}</dd>
    </motion.div>
  );
}