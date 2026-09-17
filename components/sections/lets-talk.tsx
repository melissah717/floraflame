"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Contact — the inquiry card with the flame/flower artwork around it.
 *
 * No pinned scroll choreography any more. The section is normal-flow and
 * roughly one screen tall; the moment it enters the viewport the card
 * rises into place and the artwork sweeps in around it, on a timer, once.
 * Whatever scroll position you arrive at, everything ends up in its final
 * spot within about a second — there is no "keep scrolling to finish the
 * animation" state.
 *
 * DESKTOP (xl+): 2 flames behind the card, 3 flowers in front on corners.
 * BELOW xl: just the card plus one small flower tucked behind its
 * bottom-left corner. The side gutters are too narrow for anything else.
 */

const FLAME_BIG =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812608/Multi-Design_Element_Split_4_vvmva5.png";
const FLAME_SMALL =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812608/Multi-Design_Element_Split_bpkgaj.png";
const FLOWER_LEAVES =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812609/Multi-Design_Element_Split_2_gbllja.png";
const FLOWER =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto/v1787812609/Multi-Design_Element_Split_1_ks2tby.png";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fires once, when ~25% of the section is on screen. */
const VIEWPORT = { once: true, amount: 0.25 } as const;

const card: Variants = {
  hidden: { y: 90, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

/**
 * Artwork. Each piece starts above and slightly oversized, then drops and
 * settles onto its final tilt. Positions are percentages of the CARD's box
 * (the wrapper is `relative` around the card), so they hug the card at any
 * viewport width instead of drifting with vh/vw.
 */
type Decor = {
  src: string;
  className: string;
  sizes: string;
  from: { y: number; x?: number; scale: number; rotate: number };
  to: { rotate: number };
  delay: number;
};

const DESKTOP_DECOR: Decor[] = [
  {
    // Big flame — right side, behind the card
    src: FLAME_BIG,
    className: "-top-[6%] -right-[40%] z-0 h-[78%] w-[58%]",
    sizes: "40vw",
    from: { y: -220, scale: 1.3, rotate: 22 },
    to: { rotate: 8 },
    delay: 0.15,
  },
  {
    // Small flame — bottom, behind the card
    src: FLAME_SMALL,
    className: "-bottom-[10%] -left-[8%] z-0 h-[36%] w-[42%]",
    sizes: "25vw",
    from: { y: -260, scale: 1.3, rotate: -20 },
    to: { rotate: -8 },
    delay: 0.2,
  },
  {
    // Big flower with leaves — top-right corner, in front
    src: FLOWER_LEAVES,
    className: "-top-[8%] -right-[14%] z-30 h-[32%] w-[40%]",
    sizes: "25vw",
    from: { y: -240, x: -80, scale: 1.5, rotate: 40 },
    to: { rotate: 15 },
    delay: 0.3,
  },
  {
    // Small flower A — bottom-left corner, in front
    src: FLOWER,
    className: "bottom-[6%] -left-[22%] z-30 h-[27%] w-[32%]",
    sizes: "20vw",
    from: { y: -260, x: 60, scale: 1.5, rotate: -32 },
    to: { rotate: -10 },
    delay: 0.4,
  },
  {
    // Small flower B — middle-left, floating outside the card
    src: FLOWER,
    className: "top-[36%] -left-[38%] z-30 h-[19%] w-[23%]",
    sizes: "16vw",
    from: { y: -300, x: 40, scale: 1.4, rotate: 18 },
    to: { rotate: -5 },
    delay: 0.5,
  },
];

export function LetsTalk({ children }: { children?: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <section
      id="wholesale"
      className="relative overflow-x-clip bg-neutral-900 px-5 py-20 sm:px-8 sm:py-28 xl:py-36"
    >
      {/* Wrapper is `relative` so the artwork positions against the CARD,
          not the section. It is also the in-view trigger for everything. */}
      <motion.div
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        className="relative mx-auto w-full max-w-[760px]"
      >
        {/* ── DESKTOP artwork (xl+) ── */}
        {DESKTOP_DECOR.map((d, i) => (
          <motion.div
            key={i}
            aria-hidden
            variants={{
              hidden: { ...d.from, opacity: 0 },
              show: {
                y: 0,
                x: 0,
                scale: 1,
                rotate: d.to.rotate,
                opacity: 1,
                transition: { duration: 1.1, ease: EASE, delay: d.delay },
              },
            }}
            className={`pointer-events-none absolute hidden will-change-transform xl:block ${d.className}`}
          >
            <Image src={d.src} alt="" fill sizes={d.sizes} className="object-contain" unoptimized />
          </motion.div>
        ))}

        {/* ── Below xl: one flower behind the bottom-left corner ── */}
        <motion.div
          aria-hidden
          variants={{
            hidden: { y: -80, rotate: -20, opacity: 0 },
            show: { y: 0, rotate: -6, opacity: 1, transition: { duration: 0.9, ease: EASE, delay: 0.3 } },
          }}
          className="pointer-events-none absolute -bottom-10 -left-4 z-0 h-[120px] w-[120px] xl:hidden"
        >
          <Image src={FLOWER} alt="" fill sizes="120px" className="object-contain" unoptimized />
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          variants={card}
          className="relative z-20 rounded-[20px] border border-[#2a2521] bg-[#1a1712] p-5 shadow-[0_50px_120px_rgba(0,0,0,0.7)] will-change-transform sm:rounded-[24px] sm:p-6 xl:p-[clamp(32px,4.5vw,52px)]"
        >
          <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black leading-[0.95] tracking-[-0.015em] text-neutral-50">
            Contact us.
          </h2>
          <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.5] text-neutral-400 sm:mt-3 sm:text-base sm:leading-[1.55] xl:mt-4 xl:text-lg xl:leading-[1.6]">
            Questions about a drop, press, a collab, or getting Flora &amp;
            Flame on your shelf. This goes straight to our inbox.
          </p>
          <div className="mt-5 sm:mt-6 xl:mt-8">{children ?? <PlaceholderForm />}</div>
        </motion.div>
      </motion.div>
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
