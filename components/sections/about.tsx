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
 * Full-bleed About with image-masked display type.
 *
 * SCROLL BUDGET — everything runs off one tracker whose range ends when the
 * section's top reaches 20% of the viewport. Every window must FINISH at or
 * before 1.0: progress caps there, so anything ending past it freezes
 * mid-transition and never lands.
 *
 *   0.25 – 0.79   heading lines slide up, staggered
 *   0.55 – 1.00   second photo rises from below (long window = slow)
 *   0.72 – 0.97   stats rise
 */

const HEADING = ["The way", "Nature", "Intended"];

const STATS = [
  { k: "Founded", v: "2017" },
  { k: "Based in", v: "Oakland, CA" },
];

/**
 * MASK SOURCE — the logo, showing through the letterforms.
 *
 * background-clip: text renders NOTHING wherever the source is transparent,
 * so the logo alone produces letters full of holes. MASK_BASE is painted
 * underneath: transparent regions fall back to solid colour and every letter
 * stays readable. It also covers the failure case — a wrong path leaves the
 * type visible instead of invisible, since the text itself is transparent.
 */
const MASK_IMAGE = "/logo.png";
const MASK_BASE = "#1c1915";

/**
 * Logo height, in line-heights. The knob that decides whether black shows
 * through: width follows the aspect ratio, so for a squarish logo the
 * rendered width is roughly MASK_SCALE × line-height. Under ~8 leaves the
 * image narrower than the text block and the outer letters render solid.
 */
const MASK_SCALE = 10;

/** Horizontal crop, once the image is wider than the block. */
const MASK_X = "50%";

/**
 * Visual leading for the headline. The slots need a FULL line box (1.0) or
 * overflow-hidden clips the letterforms, so the tightness is applied as a
 * negative margin between slots instead of as a line-height.
 */
const LINE_HEIGHT = 1;
const LINE_TIGHTEN = "-0.26em";

/** Shared gutter. Keep in sync with the other full-bleed sections. */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 20%"],
  });

  const { scrollYProgress: imgProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });

  /**
   * Right photo exits upward. imgY -100% (of the element's own height) and
   * marginBottom -125% (of the parent's WIDTH — the frame is 4:5, so its
   * height is 125% of its width) are the SAME pixel distance. Different
   * denominators, identical travel, so the copy below follows the photo's
   * bottom edge with no gap and no overlap.
   */
  const marginBottom = useTransform(imgProgress, [0.45, 0.95], ["0%", "-125%"]);
  const imgY = useTransform(imgProgress, [0.45, 0.95], ["0%", "-100%"]);

  /**
   * Second photo. Long window (0.55 → 1.0) is what makes it feel slow — the
   * same distance over more scroll. 102% so it starts fully clear of the
   * frame; at exactly 100% a sub-pixel seam can show along the bottom edge.
   */
  const photo2Y = useTransform(sectionProgress, [0.55, 1], ["102%", "0%"]);

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
        <div className="lg:sticky lg:top-28 lg:h-fit lg:w-[52%] lg:shrink-0">
          <Reveal>
            <SectionLabel number="01">About Us</SectionLabel>
          </Reveal>

          <h2
            className="mt-10 font-display uppercase tracking-[-0.065em]"
            style={{ fontWeight: 900 }}
          >
            {HEADING.map((line, i) => (
              <MaskedLine
                key={line}
                text={line}
                index={i}
                total={HEADING.length}
                progress={sectionProgress}
                disabled={!!reduce}
              />
            ))}
          </h2>

          {/* Second photo — arrives after the heading resolves */}
          <div className="mt-12 w-full overflow-hidden">
            <motion.div
              style={reduce ? undefined : { y: photo2Y }}
              className="relative aspect-[4/3] w-full will-change-transform"
            >
              <Image
                src="/about2.webp"
                alt="Living soil grown flower, close up"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </div>
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
                Oakland, California, growing flower the way it&apos;s supposed
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
 * Vertical background-position for line `index`, so the lines together show
 * one continuous, centred crop of the image.
 *
 * background-position percentages don't offset by a fixed amount — they
 * align the P% point of the IMAGE with the P% point of the CONTAINER. So the
 * usable travel is the overflow, (MASK_SCALE − 1) line-heights:
 *
 *   Pᵢ = ( (MASK_SCALE − lines) / 2 + i ) / (MASK_SCALE − 1) × 100
 *
 * At MASK_SCALE 10, 3 lines: 38.9 / 50 / 61.1.
 */
function slicePosition(index: number, lines: number): number {
  if (MASK_SCALE <= lines) {
    return (index / (lines - 1)) * 100;
  }
  const offset = (MASK_SCALE - lines) / 2 + index;
  return (offset / (MASK_SCALE - 1)) * 100;
}

/**
 * One line of image-filled type, sliding up out of a slot.
 *
 * TWO ELEMENTS: the outer span is the slot (overflow-hidden, doesn't move),
 * the inner one carries the mask and translates. The background travels with
 * the inner element — unavoidable, since a background is painted relative to
 * its own element's box — but over one line-height of movement against an
 * image ten line-heights tall, the shift is small and it settles correctly.
 *
 * The slot needs a FULL line box (line-height 1) or overflow-hidden clips
 * the letterforms at rest. The tight visual leading is applied as a negative
 * margin between slots instead, which doesn't affect the clipping box.
 */
function MaskedLine({
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
  const start = 0.25 + index * 0.14;
  const end = start + 0.28; // last line ends at 0.79 — inside the range

  const y = useTransform(progress, [start, end], ["105%", "0%"]);

  const maskStyle: React.CSSProperties = {
    backgroundColor: MASK_BASE,
    backgroundImage: `url(${MASK_IMAGE})`,
    // `auto` width stops the warping — only the height is set, and the
    // width follows the real aspect ratio.
    backgroundSize: `auto ${MASK_SCALE * 100}%`,
    backgroundPosition: `${MASK_X} ${slicePosition(index, total)}%`,
    backgroundRepeat: "no-repeat",
  };

  const sizeClass = "text-[clamp(2.5rem,8.5vw,11rem)]";

  return (
    <span
      className={`block overflow-hidden ${sizeClass}`}
      style={{
        lineHeight: LINE_HEIGHT,
        marginBottom: index < total - 1 ? LINE_TIGHTEN : undefined,
      }}
    >
      {disabled ? (
        <span
          style={maskStyle}
          className="block bg-clip-text text-transparent"
        >
          {text}
        </span>
      ) : (
        <motion.span
          style={{ ...maskStyle, y, willChange: "transform" }}
          className="block bg-clip-text text-transparent"
        >
          {text}
        </motion.span>
      )}
    </span>
  );
}

/**
 * One figure, on its own staggered slice of the section's scroll.
 *
 * Windows must END at or before 1.0. At 0.78 + index*0.08 with a 0.2 window
 * the second stat ran 0.86 → 1.06, and since progress caps at 1 it froze
 * partway — permanently offset and half-transparent.
 */
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
  const start = 0.72 + index * 0.07;
  const end = start + 0.18; // second stat ends at 0.97

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