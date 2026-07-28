"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * Full-bleed light block → hard edge → dark block.
 *
 * WIDTH: no max-w container. Obscura's type gets that big because the
 * column is the viewport minus ~4.5% padding, not a centred 1280px box.
 * That also makes vw-based type sizing behave — vw inside a capped
 * container is what caused the earlier overflow, because the text kept
 * growing after the column stopped.
 *
 * The contrast IS the transition. No colour interpolation: a gradient
 * softens exactly the edge doing the work.
 */

const HEADLINE = "What is living soil?";

const LEAD =
  "An ecosystem, not a growing medium. A self-sustaining web of microbes, organic matter and biology that feeds the plant the way the earth always has.";

const POINTS = [
  {
    n: "01",
    title: "Microbes feed the plant",
    body: "Beneficial bacteria, mycorrhizal fungi, and microorganisms colonize the root zone. They unlock nutrients the plant can't reach alone and provide the metabolic fuel for terpene synthesis.",
  },
  {
    n: "02",
    title: "The plant defends itself",
    body: "Sensing those microbes triggers induced systemic resistance — the plant's own defense response. That's what drives higher cannabinoid and flavonoid production, without anything sprayed on it.",
  },
  {
    n: "03",
    title: "Hydro feeds plants, soil feeds biology",
    body: "Most cannabis is grown hydroponically: inert media, synthetic liquid nutrients. Fast, scalable, one-dimensional. Chemical fertilizers feed the plant directly. Living soil feeds the microbes that feed the plant.",
  },
];

/** Shared side padding. Roughly 4.5% at desktop, like the reference. */
const GUTTER = "px-5 sm:px-8 lg:px-14";

export function LivingSoil() {
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: headProgress } = useScroll({
    target: headRef,
    offset: ["start end", "end center"],
  });

  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start end", "center center"],
  });

  const totalLetters = HEADLINE.replace(/\s+/g, "").length;
  let cursor = 0;

  return (
    <section id="living-soil" className="scroll-mt-20">
      {/* ---------- LIGHT ---------- */}
      <div
        ref={headRef}
        // pb-0: the headline's baseline sits on the boundary. Any bottom
        // padding and it's just a headline above a dark box.
        className={`bg-neutral-50 pb-0 pt-36 sm:pt-56 ${GUTTER}`}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="order-2 pb-3 lg:order-1 lg:w-72 lg:shrink-0">
            <div className="flex items-center gap-3 text-xs tracking-[0.08em] text-neutral-500">
              <span className="tabular-nums">02</span>
              <span className="h-px w-8 bg-neutral-300" />
              <span>The Method</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-neutral-500">
              No-till. No synthetics. No pesticides. The whole method comes
              down to one idea, and it isn&apos;t a shortcut.
            </p>
          </div>

          <h2
            className={[
              "order-1 font-display uppercase leading-[0.82] tracking-[-0.04em] lg:order-2",
              // Wraps between words on phones, forced to one line from sm up.
              "sm:whitespace-nowrap",
              "text-[clamp(2.5rem,6.6vw,12rem)]",
            ].join(" ")}
            // Pulls the line-box's descender space below the cut so the
            // letterforms meet the edge instead of floating above it.
            style={{ marginBottom: "-0.09em" }}
          >
            {HEADLINE.split(" ").map((word) => (
              <span key={word} className="inline-block whitespace-nowrap">
                {word.split("").map((char) => {
                  const i = cursor++;
                  return (
                    <Letter
                      key={`${char}-${i}`}
                      char={char}
                      index={i}
                      total={totalLetters}
                      progress={headProgress}
                      disabled={!!reduce}
                    />
                  );
                })}
                {/* Real space — inline-block collapses whitespace */}
                <span className="inline-block w-[0.24em]" />
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* ---------- DARK ---------- */}
      <div
        ref={bodyRef}
        className={`bg-neutral-900 py-32 text-neutral-50 sm:py-48 ${GUTTER}`}
      >
        {/* Lead — assembles word by word */}
        <p className="max-w-5xl text-2xl leading-[1.35] sm:text-3xl lg:text-4xl">
          {LEAD.split(" ").map((word, i, arr) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              index={i}
              total={arr.length}
              progress={bodyProgress}
              disabled={!!reduce}
            />
          ))}
        </p>

        <div className="mt-32 sm:mt-44">
          {POINTS.map((p, i) => (
            <PointRow
              key={p.n}
              point={p}
              index={i}
              total={POINTS.length}
              progress={bodyProgress}
              disabled={!!reduce}
            />
          ))}
        </div>

        <p className="mt-32 max-w-4xl font-display sm:mt-44 text-3xl leading-[1.1] sm:text-5xl">
          Richer, fuller flavor, and flower that tastes clean because
          nothing synthetic ever touched it.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * One row, three depths.
 *
 * The number, title and body each travel a different distance on the same
 * scroll — 20px, 45px, 80px. Objects that move more read as closer, so the
 * row assembles with a sense of depth instead of sliding up as one slab.
 * Keep the ratios; increase all three together if you want it stronger.
 */
function PointRow({
  point,
  index,
  total,
  progress,
  disabled,
}: {
  point: { n: string; title: string; body: string };
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.25 + (index / total) * 0.4;
  const end = start + 0.35;

  const numY = useTransform(progress, [start, end], [30, 0]);
  const titleY = useTransform(progress, [start, end], [65, 0]);
  const bodyY = useTransform(progress, [start, end], [110, 0]);
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  const ruleScale = useTransform(progress, [start, end], [0, 1]);

  if (disabled) {
    return (
      <div className="grid gap-6 border-t border-neutral-800 py-16 sm:py-24 lg:grid-cols-12 lg:gap-12">
        <span className="text-xs tabular-nums text-neutral-500 lg:col-span-1">
          {point.n}
        </span>
        <h3 className="font-display text-2xl sm:text-3xl lg:col-span-4">
          {point.title}
        </h3>
        <p className="text-lg leading-relaxed text-neutral-400 lg:col-span-7">
          {point.body}
        </p>
      </div>
    );
  }

  return (
    <div className="relative py-16 sm:py-24">
      {/* Rule draws itself from the left as the row arrives */}
      <motion.div
        style={{ scaleX: ruleScale }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-neutral-800"
      />

      <motion.div
        style={{ opacity }}
        className="grid gap-6 lg:grid-cols-12 lg:gap-12"
      >
        <motion.span
          style={{ y: numY }}
          className="text-xs tabular-nums tracking-[0.04em] text-neutral-500 lg:col-span-1"
        >
          {point.n}
        </motion.span>

        <motion.h3
          style={{ y: titleY }}
          className="font-display text-2xl leading-tight sm:text-3xl lg:col-span-4"
        >
          {point.title}
        </motion.h3>

        <motion.p
          style={{ y: bodyY }}
          className="text-lg leading-relaxed text-neutral-400 lg:col-span-7"
        >
          {point.body}
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * One word of the lead. Words rather than letters here — letter-by-letter
 * on a 25-word paragraph reads as a gimmick and takes too long to resolve.
 */
function Word({
  word,
  index,
  total,
  progress,
  disabled,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = (index / total) * 0.35;
  const end = start + 0.2;

  const y = useTransform(progress, [start, end], [22, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  if (disabled) return <>{word} </>;

  return (
    <motion.span
      style={{ y, opacity }}
      className="inline-block will-change-transform"
    >
      {word}
      <span className="inline-block w-[0.26em]" />
    </motion.span>
  );
}

/**
 * One character of the headline. Uppercase only — overflow-hidden on the
 * slot clips descenders on lowercase g, y, p.
 */
function Letter({
  char,
  index,
  total,
  progress,
  disabled,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.12 + (index / total) * 0.55;
  // Short window per letter. A long one leaves half the word mid-flight at
  // any moment, which reads as mush rather than a wave.
  const end = start + 0.16;

  /**
   * NO OPACITY. The overflow-hidden slot is the entire effect: a letter is
   * either behind the mask or it isn't. Fading as well produces grey
   * half-present letters sitting on the background — visible partial states
   * that make it look broken rather than deliberate.
   *
   * The three-stop mapping approximates an ease-out: most of the distance
   * covered early, then a settle. Doing it here avoids importing an easing
   * function and keeps the curve visible where the values are.
   */
  const y = useTransform(
    progress,
    [start, start + (end - start) * 0.45, end],
    ["115%", "28%", "0%"]
  );

  if (disabled) return <span className="inline-block">{char}</span>;

  return (
    <span className="inline-block overflow-hidden align-bottom leading-[1.05]">
      <motion.span style={{ y }} className="inline-block will-change-transform">
        {char}
      </motion.span>
    </span>
  );
}