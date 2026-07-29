"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Interstitial beat between the dark Drops section and the light Submit a
 * Request section. The black -> white handoff happens here, off to the
 * side of any real content, which is what makes it safe to run at all —
 * live copy elsewhere never sits on an in-between background color.
 *
 * The one line of text it carries is driven by its own color transform,
 * the exact inverse of the background's — white on black, black on
 * white — kept in lockstep via the same scroll progress.
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

  const backgroundColor = useTransform(scrollYProgress, [0, 1], ["#000000", "#ffffff"]);
  // NOT a linear inverse of backgroundColor — interpolating text color
  // opposite a linearly-interpolating background means both pass through
  // the same mid-gray around the 50% mark, so the text nearly vanishes
  // right in the middle of the scroll. Snapping the flip across a narrow
  // window instead keeps it high-contrast the rest of the way.
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.48, 0.52, 1],
    ["#ffffff", "#ffffff", "#000000", "#000000"]
  );
  const textY = useTransform(scrollYProgress, [0, 1], [26, -26]);
  // Text fades in from the black background and back out into the white
  // one at the far end, rather than snapping to solid color the instant
  // the section is entered — it emerges from and recedes into whatever
  // it's sitting on top of.
  const textOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0]);

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
      <motion.p
        style={{ y: textY, color: textColor, opacity: textOpacity }}
        className="relative px-5 text-center font-display text-3xl will-change-transform sm:text-5xl"
      >
        Still have questions?
      </motion.p>
    </motion.div>
  );
}
