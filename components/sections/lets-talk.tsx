"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Let's Talk — responsive choreography.
 *
 * DESKTOP (xl+, 1280px+): Full 5-element scatter (2 flames behind card,
 *   3 flowers in front on corners). Section is 500vh for room to breathe.
 *
 * MOBILE + TABLET (below xl): Simplified — just 1 big flame + 1 small
 *   flower, both BEHIND the card, peeking out from the corners. Section
 *   is 280vh so the scroll is much shorter (no long empty tail).
 *
 * Text and card behave the same at every breakpoint:
 *   – "Let's talk" fades in on entry, scrolls up out of view
 *   – Card slides up from below viewport into center (always opaque)
 */

const FLAME_BIG =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812608/Multi-Design_Element_Split_4_vvmva5.png";
const FLAME_SMALL =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812608/Multi-Design_Element_Split_bpkgaj.png";
const FLOWER_LEAVES =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812609/Multi-Design_Element_Split_2_gbllja.png";
const FLOWER =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812609/Multi-Design_Element_Split_1_ks2tby.png";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * When the decorative flames and flowers are allowed to start moving.
 *
 * They all used to begin at 0–0.06, which put them on screen during the
 * "Let's talk" beat — and since they enter from above, what you actually
 * saw was a severed tip hanging off the top edge with nothing else around
 * it. Fixing one element just promoted the next one into the same spot,
 * because the timing was the problem, not any single position.
 *
 * The text finishes clearing at 0.16 and the card starts rising at 0.13,
 * so holding every decoration until 0.16 gives the headline a clean beat
 * on its own, then lets the card lead and the artwork assemble around it.
 * Each element still has 0.4+ of progress to travel, so nothing rushes.
 */
const DECOR_IN = 0.16;

export function LetsTalk({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Text and card — both breakpoints. Compressed so the card starts
  // sliding in almost as soon as the text starts scrolling out, killing
  // the "empty scroll" gap between phases.
  const textY = useTransform(p, [0, 0.16], ["0vh", "-100vh"]);
  const cardY = useTransform(p, [0.13, 0.24], ["100vh", "0vh"], { ease: easeOutCubic });

  // ── DESKTOP elements (5 total, xl:block) ──

  /**
   * Both flames must START FULLY OFF THE TOP, and the old values didn't.
   *
   * The starting offset has to clear the BOX BOTTOM, not the box top, and
   * the box is bigger than its classes suggest because it's scaled 1.3 on
   * entry (scale grows it about its centre, so half the extra hangs below)
   * and rotated on top of that:
   *
   *   big:   top 15vh + h 60vh  → bottom 75vh, ×1.3 about centre → ~84vh
   *   small: top 65vh + h 30vh  → bottom 95vh, ×1.3 about centre → ~99.5vh
   *
   * At -70vh and -90vh they each sat ~5-10vh short, so the tips hung into
   * the top of the frame through the whole "Let's talk" beat — a severed
   * graphic pinned to the top edge with nothing around it. The values
   * below clear those bottoms with margin for the rotation.
   *
   * They also now start LATER, so they sweep in alongside the rising card
   * instead of being parked on screen before anything else arrives. The
   * three flowers below already worked this way; these were the odd ones.
   */
  const bigFlameY = useTransform(p, [DECOR_IN, 0.6], ["-95vh", "0vh"], { ease: easeOutCubic });
  const bigFlameScale = useTransform(p, [DECOR_IN, 0.6], [1.3, 1], { ease: easeOutCubic });
  const bigFlameRotate = useTransform(p, [DECOR_IN, 0.6], [22, 8]);

  const smallFlameY = useTransform(p, [DECOR_IN + 0.02, 0.62], ["-115vh", "0vh"], { ease: easeOutCubic });
  const smallFlameScale = useTransform(p, [DECOR_IN + 0.02, 0.62], [1.3, 1], { ease: easeOutCubic });
  const smallFlameRotate = useTransform(p, [DECOR_IN + 0.02, 0.62], [-20, -8]);

  const flower1X = useTransform(p, [DECOR_IN, 0.28, 0.58], ["-14vw", "-14vw", "0vw"]);
  const flower1Y = useTransform(p, [DECOR_IN, 0.28, 0.58], ["-60vh", "20vh", "0vh"], { ease: easeOutCubic });
  const flower1Scale = useTransform(p, [DECOR_IN, 0.28, 0.58], [1.5, 1.5, 1], { ease: easeOutCubic });
  const flower1Rotate = useTransform(p, [DECOR_IN, 0.58], [40, 15]);

  const flower2X = useTransform(p, [DECOR_IN + 0.02, 0.3, 0.6], ["8vw", "8vw", "0vw"]);
  const flower2Y = useTransform(p, [DECOR_IN + 0.02, 0.3, 0.6], ["-90vh", "-25vh", "0vh"], { ease: easeOutCubic });
  const flower2Scale = useTransform(p, [DECOR_IN + 0.02, 0.3, 0.6], [1.5, 1.5, 1], { ease: easeOutCubic });
  const flower2Rotate = useTransform(p, [DECOR_IN + 0.02, 0.6], [-32, -10]);

  const flower3X = useTransform(p, [DECOR_IN + 0.04, 0.32, 0.62], ["6vw", "6vw", "0vw"]);
  const flower3Y = useTransform(p, [DECOR_IN + 0.04, 0.32, 0.62], ["-110vh", "-15vh", "0vh"], { ease: easeOutCubic });
  const flower3Scale = useTransform(p, [DECOR_IN + 0.04, 0.32, 0.62], [1.4, 1.4, 1], { ease: easeOutCubic });
  const flower3Rotate = useTransform(p, [DECOR_IN + 0.04, 0.62], [18, -5]);

  // ── MOBILE/TABLET elements (2 total, xl:hidden) ──
  // Big flame behind card, peeks from top-right corner.
  // Small flower behind card, peeks from bottom-left corner.

  // NOTE: there used to be a big flame anchored top-right below the xl
  // breakpoint. It was removed rather than repositioned — it settled 34vh
  // into the frame by design, so it always read as a severed graphic
  // dangling from the top edge with nothing holding it to anything.

  const mFlowerY = useTransform(p, [DECOR_IN, 0.6], ["-70vh", "0vh"], { ease: easeOutCubic });
  const mFlowerScale = useTransform(p, [DECOR_IN, 0.6], [1.2, 1], { ease: easeOutCubic });
  const mFlowerRotate = useTransform(p, [DECOR_IN, 0.6], [-18, -6]);

  return (
    <section
      ref={ref}
      id="wholesale"
      // More scroll room on mobile so the sliding animations don't fly
      // past — was 200vh, now 300vh gives each phase 50% more scroll.
      className="relative h-[260vh] bg-neutral-900 xl:h-[350vh]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* ── MOBILE/TABLET only (behind card, peeking) ─── */}

        {/* Small flower — bottom-left corner, peeks from bottom + left */}
        <motion.div
          style={
            reduce
              ? undefined
              : { y: mFlowerY, scale: mFlowerScale, rotate: mFlowerRotate }
          }
          className="pointer-events-none absolute left-[-4vw] top-[70vh] z-0 h-[30vh] w-[36vw] will-change-transform xl:hidden"
        >
          <Image src={FLOWER} alt="" fill sizes="36vw" className="object-contain" unoptimized />
        </motion.div>

        {/* ── DESKTOP only (5 elements, xl+) ─── */}

        {/* Big flame — right side, behind card */}
        <motion.div
          style={
            reduce
              ? undefined
              : { y: bigFlameY, scale: bigFlameScale, rotate: bigFlameRotate }
          }
          className="pointer-events-none absolute top-[15vh] left-[55vw] z-0 hidden h-[60vh] w-[35vw] will-change-transform xl:block"
        >
          <Image src={FLAME_BIG} alt="" fill sizes="40vw" className="object-contain" unoptimized />
        </motion.div>

        {/* Small flame — bottom, behind card */}
        <motion.div
          style={
            reduce
              ? undefined
              : { y: smallFlameY, scale: smallFlameScale, rotate: smallFlameRotate }
          }
          className="pointer-events-none absolute top-[65vh] left-[35vw] z-0 hidden h-[30vh] w-[22vw] will-change-transform xl:block"
        >
          <Image src={FLAME_SMALL} alt="" fill sizes="25vw" className="object-contain" unoptimized />
        </motion.div>

        {/* ── Card ── slides up from below, always opaque ── */}
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            style={{ y: cardY }}
            // The sticky wrapper is `h-svh overflow-hidden`, so anything
            // taller than the viewport is CLIPPED, not scrolled — on short
            // phones that ate the submit button. Capping the card at the
            // viewport (minus the gutter) and letting it scroll internally
            // makes that impossible regardless of how small the screen is;
            // the tightened mobile spacing below is what keeps it from
            // needing to scroll on an ordinary phone in the first place.
            className="max-h-[calc(100svh-24px)] w-[calc(100vw-40px)] max-w-[760px] overflow-y-auto rounded-[20px] border border-[#2a2521] bg-[#1a1712] p-5 shadow-[0_50px_120px_rgba(0,0,0,0.7)] will-change-transform sm:w-[calc(100vw-56px)] sm:rounded-[24px] sm:p-6 xl:p-[clamp(32px,4.5vw,52px)]"
          >
            <h2 className="font-display text-[clamp(1.375rem,5.5vw,3rem)] font-black leading-[0.95] tracking-[-0.015em] text-neutral-50">
              Tell us what you need.
            </h2>
            <p className="mt-2 max-w-[48ch] text-[13.5px] leading-[1.45] text-neutral-400 sm:mt-3 sm:text-[15px] sm:leading-[1.55] xl:mt-4 xl:text-base xl:leading-[1.6]">
              Questions about a drop, press, a collab, or getting Flora &amp;
              Flame on your shelf. This goes straight to our inbox.
            </p>
            <div className="mt-4 sm:mt-6 xl:mt-8">{children ?? <PlaceholderForm />}</div>
          </motion.div>
        </div>

        {/* ── FRONT layer (z:30) — flowers touching card corners (desktop only) ── */}

        {/* Big flower with leaves — TOP-RIGHT corner */}
        <motion.div
          style={
            reduce
              ? undefined
              : { x: flower1X, y: flower1Y, scale: flower1Scale, rotate: flower1Rotate }
          }
          className="pointer-events-none absolute top-[8vh] left-[60vw] z-30 hidden h-[22vh] w-[22vw] will-change-transform xl:block"
        >
          <Image src={FLOWER_LEAVES} alt="" fill sizes="25vw" className="object-contain" unoptimized />
        </motion.div>

        {/* Small flower A — BOTTOM-LEFT corner */}
        <motion.div
          style={
            reduce
              ? undefined
              : { x: flower2X, y: flower2Y, scale: flower2Scale, rotate: flower2Rotate }
          }
          className="pointer-events-none absolute top-[60vh] left-[10vw] z-30 hidden h-[20vh] w-[18vw] will-change-transform xl:block"
        >
          <Image src={FLOWER} alt="" fill sizes="20vw" className="object-contain" unoptimized />
        </motion.div>

        {/* Small flower B (duplicate) — MIDDLE-LEFT, floating outside card */}
        <motion.div
          style={
            reduce
              ? undefined
              : { x: flower3X, y: flower3Y, scale: flower3Scale, rotate: flower3Rotate }
          }
          className="pointer-events-none absolute top-[40vh] left-[2vw] z-30 hidden h-[14vh] w-[14vw] will-change-transform xl:block"
        >
          <Image src={FLOWER} alt="" fill sizes="16vw" className="object-contain" unoptimized />
        </motion.div>

        {/* ── "Let's talk" intro (z:50, always in front) ── */}
        <motion.div
          style={{ y: textY }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-5 will-change-transform"
        >
          <p className="whitespace-nowrap text-center font-display text-[clamp(2.5rem,7vw,7rem)] font-black uppercase leading-[0.85] tracking-[-0.03em] text-neutral-50">
            Let&apos;s talk
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PlaceholderForm() {
  return (
    <p className="text-xs text-neutral-500">
      Placeholder — pass your Wholesale form as children.
    </p>
  );
}