"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

/**
 * About — three acts, same shape on desktop and mobile.
 *
 *   1. Keyhole video opens up (unchanged).
 *   2. DESKTOP: 4 photos tight-packed at BOTTOM in a row → photos 2-4 slide
 *      UP off top → photo 1 expands to a large hero on the left → paragraph
 *      slides UP into a narrow bottom-right column, left-aligned.
 *   3. MOBILE: same idea, rotated 90°. 4 photos in a vertical stack (about-4
 *      at top, about-1 at BOTTOM — the "last one" you reach on scroll) →
 *      the top 3 slide UP off top → photo 1 (the anchor) expands upward to
 *      fill the upper 60% → paragraph slides UP into a narrow bottom-right
 *      column, left-aligned. Consistent hero across breakpoints.
 *
 * STICKY TRAP: the tall wrappers must NOT have an overflow-hidden ancestor.
 */

// ── keyhole knobs ──
const SCROLL_LENGTH = "h-[130vh] lg:h-[200vh]";
const OPEN_END = 0.65;
const START_INSET_X = 30;
const START_INSET_Y = 28;
const START_RADIUS = 14;

// ── DESKTOP row → hero knobs ──
const ABOUT_SCROLL_LENGTH = "h-[350vh]";
const ROW_LEFT = ["7vw", "29vw", "51vw", "73vw"];
const ROW_TOP = "37vh";
const ROW_W = "20vw";
const ROW_H = "55vh";
const HERO_LEFT = "5vw";
const HERO_TOP = "12vh";
const HERO_W = "45vw";
const HERO_H = "78vh";
const TEXT_RIGHT = "22vw";
const TEXT_TOP = "62vh";
const TEXT_WIDTH = "18vw";
const EXIT_RANGE = [0.05, 0.28] as const;
const P1_MORPH_RANGE = [0.25, 0.5] as const;
const TEXT_SLIDE_RANGE = [0.52, 0.72] as const;

// ── MOBILE stack → hero knobs ──
const MOBILE_SCROLL_LENGTH = "h-[280vh]";
// Vertical stack (top → bottom): about-4, about-3, about-2, about-1.
// Index in IMAGES[] → its starting `top`. IMAGES[0] (about-1) sits at the
// bottom — the "last one reached" — and is the anchor that expands.
const MOBILE_STACK_TOP = ["68vh", "46vh", "24vh", "2vh"];
const MOBILE_STACK_H = "20vh";
const MOBILE_STACK_LEFT = "5vw";
const MOBILE_STACK_W = "90vw";
// Anchor (about-1) grows upward to fill the upper portion of the viewport.
// Shorter than before to give the paragraph proper room below.
const MOBILE_HERO_TOP = "5vh";
const MOBILE_HERO_H = "48vh";
// Text: wide, left-aligned paragraph below the photo. On portrait mobile a
// "narrow right-hand column" (the desktop metaphor) reads as unbalanced —
// the left half sits empty. Filling the width like a normal mobile
// paragraph is cleaner.
const MOBILE_TEXT_LEFT = "6vw";
const MOBILE_TEXT_TOP = "60vh";
const MOBILE_TEXT_WIDTH = "88vw";
// Same phase shape as desktop, just remapped to the mobile scroll range.
const MOBILE_EXIT_RANGE = [0.05, 0.3] as const;
const MOBILE_MORPH_RANGE = [0.18, 0.45] as const;
const MOBILE_TEXT_RANGE = [0.5, 0.72] as const;

// ── images ──
const CLOUD = "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto";
const IMAGES = [
  `${CLOUD}/v1786660982/about-1_yckdax.webp`,
  `${CLOUD}/v1786660990/about-2_zcxmix.webp`,
  `${CLOUD}/v1786660978/about-3_vudjf1.webp`,
  `${CLOUD}/v1786660988/about-4_exdoyo.webp`,
];

const ABOUT_TEXT =
  "We're a small team of craft cultivators in Oakland, growing flower the way it's supposed to be grown. Living soil, by hand, pesticide-free, no shortcuts. Every bud hand-trimmed, because machines don't give a f*ck about trichomes.";

export function About() {
  const videoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: videoProgress } = useScroll({
    target: videoRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileRef,
    offset: ["start start", "end end"],
  });

  // Keyhole (unchanged)
  const clipPath = useTransform(videoProgress, (p) => {
    const t = Math.min(p / OPEN_END, 1);
    const x = START_INSET_X * (1 - t);
    const y = START_INSET_Y * (1 - t);
    const r = START_RADIUS * (1 - t);
    return `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`;
  });
  const scale = useTransform(videoProgress, [0, OPEN_END], [1.08, 1]);

  // Desktop transforms
  const restY = useTransform(aboutProgress, [...EXIT_RANGE], ["0vh", "-110vh"]);
  const p1Left = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_LEFT[0], HERO_LEFT]);
  const p1Top = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_TOP, HERO_TOP]);
  const p1Width = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_W, HERO_W]);
  const p1Height = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_H, HERO_H]);
  const textY = useTransform(aboutProgress, [...TEXT_SLIDE_RANGE], ["55vh", "0vh"]);

  // Mobile transforms — same shape, remapped.
  // Only top+height animate for the anchor (photo stays full width).
  const mRestY = useTransform(mobileProgress, [...MOBILE_EXIT_RANGE], ["0vh", "-100vh"]);
  const mP1Top = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_TOP[0], MOBILE_HERO_TOP]);
  const mP1Height = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_H, MOBILE_HERO_H]);
  const mTextY = useTransform(mobileProgress, [...MOBILE_TEXT_RANGE], ["55vh", "0vh"]);

  return (
    <section id="about" className="scroll-mt-20 bg-neutral-900">
      {/* ── KEYHOLE VIDEO ────────────────────────────────────────────── */}
      <div ref={videoRef} className={`relative ${SCROLL_LENGTH}`}>
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-neutral-900">
          <motion.video
            className="h-full w-full object-cover will-change-[clip-path,transform]"
            style={reduce ? undefined : { clipPath, WebkitClipPath: clipPath, scale }}
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              src="https://res.cloudinary.com/g0mcdcfr/video/upload/f_auto,q_auto/v1786661231/About_drone_i8aaia.mp4"
              type="video/mp4"
            />
          </motion.video>
        </div>
      </div>

      {/* ── DESKTOP: row exits → hero appears (left) → text slides in (right) ── */}
      <div ref={aboutRef} className={`relative hidden ${ABOUT_SCROLL_LENGTH} lg:block`}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {[1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              style={
                reduce
                  ? { display: "none" }
                  : {
                      left: ROW_LEFT[idx],
                      top: ROW_TOP,
                      width: ROW_W,
                      height: ROW_H,
                      y: restY,
                    }
              }
              className="absolute overflow-hidden rounded-md"
            >
              <Image src={IMAGES[idx]} alt="" fill sizes="20vw" className="object-cover" />
            </motion.div>
          ))}

          <motion.div
            style={
              reduce
                ? { left: HERO_LEFT, top: HERO_TOP, width: HERO_W, height: HERO_H }
                : { left: p1Left, top: p1Top, width: p1Width, height: p1Height }
            }
            className="absolute overflow-hidden rounded-md"
          >
            <Image src={IMAGES[0]} alt="" fill sizes="45vw" className="object-cover" />
          </motion.div>

          <motion.div
            style={
              reduce
                ? { right: TEXT_RIGHT, top: TEXT_TOP, width: TEXT_WIDTH }
                : { right: TEXT_RIGHT, top: TEXT_TOP, width: TEXT_WIDTH, y: textY }
            }
            className="absolute text-left will-change-transform"
          >
            <p className="font-display text-[clamp(1rem,1.35vw,1.25rem)] font-normal leading-[1.6] tracking-normal text-neutral-100">
              {ABOUT_TEXT}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE: vertical stack → last one expands → text slides in ── */}
      <div ref={mobileRef} className={`relative ${MOBILE_SCROLL_LENGTH} lg:hidden`}>
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* Photos about-2, about-3, about-4 — slide UP off top. No fade. */}
          {[1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              style={
                reduce
                  ? { display: "none" }
                  : {
                      left: MOBILE_STACK_LEFT,
                      top: MOBILE_STACK_TOP[idx],
                      width: MOBILE_STACK_W,
                      height: MOBILE_STACK_H,
                      y: mRestY,
                    }
              }
              className="absolute overflow-hidden rounded-md"
            >
              <Image src={IMAGES[idx]} alt="" fill sizes="90vw" className="object-cover" />
            </motion.div>
          ))}

          {/* Photo about-1 — the anchor. Starts at bottom of stack, grows
              upward to fill the upper portion of the viewport. */}
          <motion.div
            style={
              reduce
                ? {
                    left: MOBILE_STACK_LEFT,
                    top: MOBILE_HERO_TOP,
                    width: MOBILE_STACK_W,
                    height: MOBILE_HERO_H,
                  }
                : {
                    left: MOBILE_STACK_LEFT,
                    top: mP1Top,
                    width: MOBILE_STACK_W,
                    height: mP1Height,
                  }
            }
            className="absolute overflow-hidden rounded-md"
          >
            <Image src={IMAGES[0]} alt="" fill sizes="90vw" className="object-cover" />
          </motion.div>

          {/* Text — full-width paragraph below the photo. Slides up as one
              block from below the viewport. */}
          <motion.div
            style={
              reduce
                ? {
                    left: MOBILE_TEXT_LEFT,
                    top: MOBILE_TEXT_TOP,
                    width: MOBILE_TEXT_WIDTH,
                  }
                : {
                    left: MOBILE_TEXT_LEFT,
                    top: MOBILE_TEXT_TOP,
                    width: MOBILE_TEXT_WIDTH,
                    y: mTextY,
                  }
            }
            className="absolute text-left will-change-transform"
          >
            <p className="font-display text-[clamp(0.95rem,3.6vw,1.15rem)] font-normal leading-[1.55] tracking-normal text-neutral-100">
              {ABOUT_TEXT}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}