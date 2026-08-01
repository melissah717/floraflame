"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Interstitial beat between the dark Drops section and the (now equally
 * dark) Submit a Request section. A subtle tonal shift — not a hard
 * black/white flip anymore, since both neighbours are dark — still gives
 * the scroll a beat of its own, off to the side of any real content.
 *
 * Background color is scroll-linked (not a static gradient) so the shift
 * reads as caused by scrolling; the text drifts at its own rate off the
 * same progress for a subtle parallax layer.
 */
export function SectionTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const backgroundColor = useTransform(scrollYProgress, [0, 1], ["#1c1915", "#2c2823"]);
  const textY = useTransform(scrollYProgress, [0, 1], [26, -26]);
  // Text fades in from one dark background and back out into the other at
  // the far end, rather than snapping to solid color the instant the
  // section is entered.
  const textOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0]);

  if (reduce) {
    return (
      <div className="flex h-24 items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
        <p className="px-5 text-center font-display text-2xl text-neutral-50 sm:text-3xl">
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
      <motion.p
        style={{ y: textY, opacity: textOpacity }}
        className="relative px-5 text-center font-display text-3xl text-neutral-50 will-change-transform sm:text-5xl"
      >
        Still have questions?
      </motion.p>
    </motion.div>
  );
}
