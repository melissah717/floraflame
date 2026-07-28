"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Interstitial beat between the dark Drops section and the light Submit a
 * Request section. The black -> white handoff happens here, off to the
 * side of any real content, which is what makes it safe to run at all —
 * live copy elsewhere never sits on an in-between background color.
 *
 * The one line of text it does carry uses mix-blend-difference (same
 * trick the hero uses) instead of its own color transform: white text
 * differenced against black reads white, differenced against the light
 * end reads near-black, so it stays legible across the whole shift
 * without needing to be kept in sync with the background transform.
 *
 * Background color and glow position are scroll-linked (not a static
 * gradient) so the shift reads as caused by scrolling; the text drifts
 * at yet another rate off the same progress for a subtle parallax layer.
 */
export function SectionTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["#1c1915", "#f2eee6"]
  );
  const glowY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.55, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [26, -26]);

  if (reduce) {
    return (
      <div className="flex h-24 items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-100">
        <p className="mix-blend-difference px-5 text-center font-display text-2xl text-neutral-50 sm:text-3xl">
          Still have questions?
        </p>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ backgroundColor }}
      className="relative flex h-[18vh] items-center justify-center overflow-hidden sm:h-[24vh]"
    >
      <motion.div
        aria-hidden
        style={{ y: glowY, opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[70vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500 via-orange-400 to-lime-400 blur-[100px]"
      />

      <motion.p
        style={{ y: textY }}
        className="relative mix-blend-difference px-5 text-center font-display text-3xl text-neutral-50 will-change-transform sm:text-5xl"
      >
        Still have questions?
      </motion.p>
    </motion.div>
  );
}
