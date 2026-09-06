"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * About — three acts, same shape on desktop and mobile.
 *
 *   1. Keyhole video opens up (unchanged).
 *   2. DESKTOP: 4 photos row → photos 2-4 slide up → photo 1 expands to
 *      hero on left → THREE paragraphs slide in from the left, one by
 *      one, into a narrow bottom-right column.
 *   3. MOBILE: same idea rotated 90°. Vertical stack → photo 1 expands →
 *      three paragraphs slide in from left, one by one, in a wider column.
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
const ABOUT_SCROLL_LENGTH = "h-[450vh]";
const ROW_LEFT = ["7vw", "29vw", "51vw", "73vw"];
const ROW_TOP = "37vh";
const ROW_W = "20vw";
const ROW_H = "55vh";
const HERO_LEFT = "5vw";
const HERO_TOP = "12vh";
const HERO_W = "45vw";
const HERO_H = "78vh";
// Text column — wider than before to accommodate three stacked paragraphs.
// Higher top position so the whole stack fits vertically.
const TEXT_RIGHT = "18vw";
const TEXT_TOP = "16vh";
const TEXT_WIDTH = "24vw";
const EXIT_RANGE = [0.05, 0.28] as const;
const P1_MORPH_RANGE = [0.25, 0.5] as const;
// Three paragraphs slide in from the RIGHT with stagger. Each takes ~10%
// of scroll to slide in, one after another, then the section holds.
// Big positive slideFrom = starts fully off-screen right, so no opacity
// fade needed — paragraph is simply out of view until it slides in.
const PARA_STAGGER: readonly (readonly [number, number])[] = [
  [0.5, 0.6],
  [0.6, 0.7],
  [0.7, 0.8],
];
const PARA_SLIDE_FROM = "50vw";

// ── MOBILE stack → hero knobs ──
const MOBILE_SCROLL_LENGTH = "h-[380vh]";
const MOBILE_STACK_TOP = ["68vh", "46vh", "24vh", "2vh"];
const MOBILE_STACK_H = "20vh";
const MOBILE_STACK_LEFT = "5vw";
const MOBILE_STACK_W = "90vw";
// Photo hero shrunk further so 3 paragraphs comfortably fit below within
// the 100vh sticky viewport.
const MOBILE_HERO_TOP = "5vh";
const MOBILE_HERO_H = "32vh";
// Text: full-width bottom column, three paragraphs stack with tight gap.
// Higher top position + tighter styling to fit all 3 in the remaining space.
const MOBILE_TEXT_LEFT = "6vw";
const MOBILE_TEXT_TOP = "40vh";
const MOBILE_TEXT_WIDTH = "88vw";
const MOBILE_EXIT_RANGE = [0.05, 0.3] as const;
const MOBILE_MORPH_RANGE = [0.18, 0.45] as const;
// Same paragraph stagger shape as desktop, remapped onto mobile scroll.
const MOBILE_PARA_STAGGER: readonly (readonly [number, number])[] = [
  [0.5, 0.6],
  [0.6, 0.7],
  [0.7, 0.8],
];
const MOBILE_PARA_SLIDE_FROM = "100vw";

// ── images ──
const CLOUD = "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto";
const IMAGES = [
  `${CLOUD}/v1786660982/about-1_yckdax.webp`,
  `${CLOUD}/v1786660990/about-2_zcxmix.webp`,
  `${CLOUD}/v1786660978/about-3_vudjf1.webp`,
  `${CLOUD}/v1786660988/about-4_exdoyo.webp`,
];

/**
 * Three-paragraph narrative. Each stands on its own so any can be cut
 * without breaking the others. Story arc: who we are → what "living soil"
 * actually means → the quality bar we hold ourselves to.
 */
const ABOUT_PARAGRAPHS = [
  "We're a small team of craft cultivators in Oakland, growing flower the way it's supposed to be grown. Living soil, by hand, pesticide-free, no shortcuts. Every bud hand-trimmed, because machines don't give a f*ck about trichomes.",
  "Living soil means a real ecosystem under every plant — worms, fungi, microbes doing what they've done for millions of years, now under our lights. We don't feed the plants. We feed the soil. The soil feeds them back. Takes longer. Costs more. Tastes like the plant.",
  "Every batch is small enough that we know its story — who dropped the seed, when it flowered, whose hands trimmed it. If a run doesn't hit — terps flat, burn wrong, high not there — it doesn't get named. No B-shelf. Just what we'd smoke ourselves.",
];

/**
 * Short blurbs overlaid on each of the 4 panel photos before the row exits.
 * TODO: swap these placeholders with the copy your client sends.
 * Index matches IMAGES[]:
 *   0 → about-1 (anchor, the one that expands to hero)
 *   1 → about-2, 2 → about-3, 3 → about-4 (the three that slide up and off)
 */
const PANEL_BLURBS = [
  "The room where it all happens.",
  "Every plant, checked by hand.",
  "Trimming's slow because it has to be.",
  "Small runs. Nothing anonymous.",
];

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

  // Desktop photo transforms
  const restY = useTransform(aboutProgress, [...EXIT_RANGE], ["0vh", "-110vh"]);
  const p1Left = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_LEFT[0], HERO_LEFT]);
  const p1Top = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_TOP, HERO_TOP]);
  const p1Width = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_W, HERO_W]);
  const p1Height = useTransform(aboutProgress, [...P1_MORPH_RANGE], [ROW_H, HERO_H]);
  // Overlay + blurb on the anchor photo fades out early in its morph, so
  // the full hero image is visible before it reaches its final position.
  const p1OverlayOp = useTransform(aboutProgress, [P1_MORPH_RANGE[0], P1_MORPH_RANGE[0] + 0.08], [1, 0]);

  // Mobile photo transforms
  const mRestY = useTransform(mobileProgress, [...MOBILE_EXIT_RANGE], ["0vh", "-100vh"]);
  const mP1Top = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_TOP[0], MOBILE_HERO_TOP]);
  const mP1Height = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_H, MOBILE_HERO_H]);
  const mP1OverlayOp = useTransform(mobileProgress, [MOBILE_MORPH_RANGE[0], MOBILE_MORPH_RANGE[0] + 0.08], [1, 0]);

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
            preload="auto"
            poster="https://res.cloudinary.com/g0mcdcfr/video/upload/so_0,q_auto,w_1200/v1786661231/About_drone_i8aaia.jpg"
          >
            <source
              src="https://res.cloudinary.com/g0mcdcfr/video/upload/vc_h264,f_mp4,q_auto,w_1600/v1786661231/About_drone_i8aaia.mp4"
              type="video/mp4"
            />
          </motion.video>
        </div>
      </div>

      {/* ── DESKTOP: row exits → hero appears → 3 paragraphs slide in from left ── */}
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
              {/* Dim overlay — permanent on the exiting panels, so blurb reads. */}
              <div className="absolute inset-0 bg-black/45" />
              {/* Blurb, bottom of panel */}
              <div className="absolute inset-x-0 bottom-0 p-3 xl:p-4">
                <p className="font-display text-white text-[clamp(0.7rem,0.85vw,0.85rem)] leading-[1.35]">
                  {PANEL_BLURBS[idx]}
                </p>
              </div>
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
            {/* Overlay + blurb fade out early in the anchor morph so the
                hero image reveals fully once the row is finished. */}
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: p1OverlayOp }}
              className="absolute inset-0 bg-black/45"
            />
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: p1OverlayOp }}
              className="absolute inset-x-0 bottom-0 p-3 xl:p-4"
            >
              <p className="font-display text-white text-[clamp(0.7rem,0.85vw,0.85rem)] leading-[1.35]">
                {PANEL_BLURBS[0]}
              </p>
            </motion.div>
          </motion.div>

          {/* Text column — three paragraphs stacked, each slides in from left. */}
          <div
            className="absolute flex flex-col gap-5"
            style={{ right: TEXT_RIGHT, top: TEXT_TOP, width: TEXT_WIDTH }}
          >
            {ABOUT_PARAGRAPHS.map((text, i) => (
              <SlidingParagraph
                key={i}
                progress={aboutProgress}
                range={PARA_STAGGER[i]}
                slideFrom={PARA_SLIDE_FROM}
                reduce={!!reduce}
                className="font-display text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.65] tracking-[0.005em] text-neutral-50"
              >
                {text}
              </SlidingParagraph>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE: vertical stack → last one expands → 3 paragraphs slide in ── */}
      <div ref={mobileRef} className={`relative ${MOBILE_SCROLL_LENGTH} lg:hidden`}>
        <div className="sticky top-0 h-svh w-full overflow-hidden">
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
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="font-display text-white text-[clamp(0.85rem,3vw,1rem)] leading-[1.3]">
                  {PANEL_BLURBS[idx]}
                </p>
              </div>
            </motion.div>
          ))}

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
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: mP1OverlayOp }}
              className="absolute inset-0 bg-black/45"
            />
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: mP1OverlayOp }}
              className="absolute inset-x-0 bottom-0 p-3"
            >
              <p className="font-display text-white text-[clamp(0.85rem,3vw,1rem)] leading-[1.3]">
                {PANEL_BLURBS[0]}
              </p>
            </motion.div>
          </motion.div>

          {/* Text column — three paragraphs stacked, each slides in from left. */}
          <div
            className="absolute flex flex-col gap-3"
            style={{ left: MOBILE_TEXT_LEFT, top: MOBILE_TEXT_TOP, width: MOBILE_TEXT_WIDTH }}
          >
            {ABOUT_PARAGRAPHS.map((text, i) => (
              <SlidingParagraph
                key={i}
                progress={mobileProgress}
                range={MOBILE_PARA_STAGGER[i]}
                slideFrom={MOBILE_PARA_SLIDE_FROM}
                reduce={!!reduce}
                className="text-left font-display text-[clamp(0.85rem,3vw,1rem)] leading-[1.5] tracking-[0.005em] text-neutral-50"
              >
                {text}
              </SlidingParagraph>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A single paragraph that slides in from the right, in a given scroll
 * progress window. No opacity fade — the initial position sits fully
 * off-screen so it's naturally invisible until it slides into view.
 *
 * Font styling is applied here (not in className) so all paragraphs get
 * consistent variable-font settings — italic Fraunces at light weight
 * with a touch of softness. Feels editorial and readable at body sizes,
 * distinct from the display headings.
 */
function SlidingParagraph({
  children,
  progress,
  range,
  slideFrom,
  reduce,
  className,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: readonly [number, number];
  slideFrom: string;
  reduce: boolean;
  className?: string;
}) {
  const x = useTransform(progress, [range[0], range[1]], [slideFrom, "0vw"]);

  return (
    <motion.p
      style={{
        // Fraunces upright at a proper reading weight — light+italic was
        // pretty but read as "faded" against the dark background. This is
        // still designer-feeling but you can actually read it.
        fontVariationSettings: "'opsz' 14, 'wght' 420, 'SOFT' 30, 'WONK' 0",
        ...(reduce ? {} : { x }),
      }}
      className={`will-change-transform ${className ?? ""}`}
    >
      {children}
    </motion.p>
  );
}