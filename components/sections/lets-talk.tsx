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
 *   – "Let's talk." fades in on entry, scrolls up out of view
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

  const bigFlameY = useTransform(p, [0, 0.5], ["-70vh", "0vh"], { ease: easeOutCubic });
  const bigFlameScale = useTransform(p, [0, 0.5], [1.3, 1], { ease: easeOutCubic });
  const bigFlameRotate = useTransform(p, [0, 0.5], [22, 8]);

  const smallFlameY = useTransform(p, [0.02, 0.52], ["-90vh", "0vh"], { ease: easeOutCubic });
  const smallFlameScale = useTransform(p, [0.02, 0.52], [1.3, 1], { ease: easeOutCubic });
  const smallFlameRotate = useTransform(p, [0.02, 0.52], [-20, -8]);

  const flower1X = useTransform(p, [0, 0.15, 0.5], ["-14vw", "-14vw", "0vw"]);
  const flower1Y = useTransform(p, [0, 0.12, 0.5], ["-60vh", "20vh", "0vh"], { ease: easeOutCubic });
  const flower1Scale = useTransform(p, [0, 0.12, 0.5], [1.5, 1.5, 1], { ease: easeOutCubic });
  const flower1Rotate = useTransform(p, [0, 0.5], [40, 15]);

  const flower2X = useTransform(p, [0.03, 0.15, 0.52], ["8vw", "8vw", "0vw"]);
  const flower2Y = useTransform(p, [0.03, 0.15, 0.52], ["-90vh", "-25vh", "0vh"], { ease: easeOutCubic });
  const flower2Scale = useTransform(p, [0.03, 0.15, 0.52], [1.5, 1.5, 1], { ease: easeOutCubic });
  const flower2Rotate = useTransform(p, [0.03, 0.52], [-32, -10]);

  const flower3X = useTransform(p, [0.06, 0.2, 0.55], ["6vw", "6vw", "0vw"]);
  const flower3Y = useTransform(p, [0.06, 0.18, 0.55], ["-110vh", "-15vh", "0vh"], { ease: easeOutCubic });
  const flower3Scale = useTransform(p, [0.06, 0.18, 0.55], [1.4, 1.4, 1], { ease: easeOutCubic });
  const flower3Rotate = useTransform(p, [0.06, 0.55], [18, -5]);

  // ── MOBILE/TABLET elements (2 total, xl:hidden) ──
  // Big flame behind card, peeks from top-right corner.
  // Small flower behind card, peeks from bottom-left corner.

  const mFlameY = useTransform(p, [0, 0.5], ["-45vh", "0vh"], { ease: easeOutCubic });
  const mFlameScale = useTransform(p, [0, 0.5], [1.2, 1], { ease: easeOutCubic });
  const mFlameRotate = useTransform(p, [0, 0.5], [12, 4]);

  const mFlowerY = useTransform(p, [0.05, 0.55], ["-70vh", "0vh"], { ease: easeOutCubic });
  const mFlowerScale = useTransform(p, [0.05, 0.55], [1.2, 1], { ease: easeOutCubic });
  const mFlowerRotate = useTransform(p, [0.05, 0.55], [-18, -6]);

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

        {/* Big flame — top-right corner, peeks from top */}
        <motion.div
          style={
            reduce
              ? undefined
              : { y: mFlameY, scale: mFlameScale, rotate: mFlameRotate }
          }
          className="pointer-events-none absolute right-0 top-0 z-0 h-[58vh] w-[52vw] will-change-transform xl:hidden"
        >
          <Image src={FLAME_BIG} alt="" fill sizes="52vw" className="object-contain" unoptimized />
        </motion.div>

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
            className="w-[calc(100vw-56px)] max-w-[760px] rounded-[24px] border border-[#2a2521] bg-[#1a1712] p-6 shadow-[0_50px_120px_rgba(0,0,0,0.7)] will-change-transform xl:p-[clamp(32px,4.5vw,52px)]"
          >
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 xl:mb-4 xl:text-[11px]">
              03 · Submit a Request
            </p>
            <h2 className="font-display text-[clamp(1.5rem,6vw,3rem)] font-black leading-[0.95] tracking-[-0.015em] text-neutral-50">
              Tell us what you need.
            </h2>
            <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.5] text-neutral-500 xl:mt-4 xl:text-[14px] xl:leading-[1.55]">
              Questions about a drop, press, a collab, or getting Flora &amp;
              Flame on your shelf. This goes straight to our inbox.
            </p>
            <div className="mt-6 xl:mt-8">{children ?? <PlaceholderForm />}</div>
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

        {/* ── "Let's talk." intro (z:50, always in front) ── */}
        <motion.div
          style={{ y: textY }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-5 will-change-transform"
        >
          <p className="whitespace-nowrap text-center font-display text-[clamp(2.5rem,7vw,7rem)] font-black uppercase leading-[0.85] tracking-[-0.03em] text-neutral-50">
            Let&apos;s talk.
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