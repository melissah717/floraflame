"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
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
// NOTE: the paragraph font size below is capped by a vh term as well as a
// vw one (min(1.5vw, 2.45vh)). The stack has to fit inside the sticky 100vh
// viewport, and on a wide-but-short window (1366×768, 1280×720) a purely
// width-based size overflowed the bottom. The vh term is what keeps it in.
const TEXT_RIGHT = "12vw";
const TEXT_TOP = "13vh";
const TEXT_WIDTH = "30vw";
// Everything below is pushed later than it used to be to make room for the
// LIVING SOIL reveal, which now owns the first fifth of the section while
// the row sits at rest. The shape of the sequence is unchanged.
const EXIT_RANGE = [0.2, 0.4] as const;
const P1_MORPH_RANGE = [0.38, 0.58] as const;
// Three paragraphs slide in from the RIGHT with stagger. Each takes ~10%
// of scroll to slide in, one after another, then the section holds.
// Big positive slideFrom = starts fully off-screen right, so no opacity
// fade needed — paragraph is simply out of view until it slides in.
const PARA_STAGGER: readonly (readonly [number, number])[] = [
  [0.58, 0.67],
  [0.67, 0.76],
  [0.76, 0.85],
];
const PARA_SLIDE_FROM = "50vw";

// ── DESKTOP "LIVING SOIL" reveal ──
// Sits in the empty band above the photo row while the row rests, reveals a
// word at a time, then rides the row's own exit transform off the top.
const WORDS = ["Living", "Soil"] as const;
// The row runs from ROW_LEFT[0] to ROW_LEFT[3] + ROW_W — 7vw to 93vw. The
// type is pinned to exactly that span so it lines up with the outer edges
// of the first and last photo.
const WORDS_LEFT = ROW_LEFT[0];
const WORDS_WIDTH = "86vw";
// Anchored by its BOTTOM edge, which lands 3vh above ROW_TOP (37vh). Using
// bottom rather than top means the gap to the photos stays put no matter
// how tall the type ends up.
const WORDS_BOTTOM = "66vh";
// Tuned by measurement: "LIVING SOIL" in Fraunces at this weight, plus the
// 0.2em word gap, runs 5.56em of ink, so 86vw / 5.56 = 15.47vw would fill
// the row exactly. Set a little under that — landing right on the
// container width puts the flex items at the shrink threshold, and a
// shrunk item would have its word quietly clipped by the reveal mask.
// 15vw lands at ~97% of the row: reads flush with the outer photo edges
// with ~37px of slack. Both terms are vw, so the fit holds at every window
// width — only a change to the string or the typeface needs re-deriving.
//
// The vh term guards short, wide windows, where type sized purely off the
// width grows tall enough to collide with the nav. It can only ever make
// the line narrower than the row, never wider.
const WORDS_SIZE = "min(15vw, 27vh)";
// Two hard cuts, NOT a reveal. Each word is simply off, then on — no
// slide, no fade — so it lands like a stamp rather than arriving. The
// two hits sit ~190px of scroll apart: far enough to read as two separate
// impacts, close enough to feel like one gesture.
const WORD_HITS = [0.05, 0.11] as const;
// The recoil after each hit, in SECONDS — time-based, not scroll-based, so
// the impact lands with the same snap however fast you happen to be
// scrolling. Deliberately short: this is the shock settling, not an
// entrance; stretch it and the BOOM turns back into a zoom.
const WORD_PUNCH_SEC = 0.22;
const WORD_PUNCH_SCALE = 1.06;

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
 * ── `sizes` and the object-cover trap ──
 *
 * The source photos are LANDSCAPE (3130×2075, ≈1.51:1) but every box below
 * is PORTRAIT. `sizes` tells the browser how wide the image will render, and
 * the browser sizes the *whole* image to that — but `object-cover` on a
 * portrait box scales to match the box HEIGHT and crops the sides off.
 *
 * So the width the browser actually needs is `boxHeight × 1.51`, not boxWidth.
 * Passing the box width (e.g. "20vw") asked for a 288×190 file to fill a
 * 288×495 slot — a 2.6× upscale on a 1× screen, 5.2× on retina. That was the
 * blur. These are expressed in vh because the boxes are.
 *
 * Keep each value in sync with the *largest* box its image ever animates to.
 */
// (aspect ratio 3130 / 2075 = 1.51)
const SIZES_ROW = "max(20vw, 83vh)"; //  55vh × 1.51
const SIZES_HERO = "max(45vw, 118vh)"; //  78vh × 1.51
const SIZES_MOBILE_ROW = "max(90vw, 31vh)"; //  20vh × 1.51
const SIZES_MOBILE_HERO = "max(90vw, 49vh)"; //  32vh × 1.51

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
 * Captions overlaid on each of the 4 panel photos before the row exits.
 *
 * KEEP THESE SHORT — under about 24 characters. The panels are only 20vw
 * wide, and a caption that wraps to two lines breaks the rhythm of the row
 * (three one-liners and one two-liner reads as a mistake, not a variation).
 * No terminal periods: these are captions, not sentences, and a full stop
 * on a four-word fragment makes it read as clipped rather than deliberate.
 *
 * Index matches IMAGES[]:
 *   0 → about-1 (anchor, the one that expands to hero)
 *   1 → about-2, 2 → about-3, 3 → about-4 (the three that slide up and off)
 */
const PANEL_BLURBS = [
  "Where it all happens",
  "Every plant, by hand",
  "Trimmed slow, on purpose",
  "Nothing anonymous",
];

/**
 * Caption styling. These were set in Fraunces at display weight, which put
 * them in the same voice as the section headings — so the photo captions
 * competed with the headline instead of sitting under it. Karla, uppercase
 * and letterspaced, reads as an annotation on the photograph: clearly
 * subordinate, and much cleaner at this size over a busy image.
 *
 * Uppercase + tracking also buys apparent size without needing more point
 * size, which matters here because the panels are narrow.
 */
const CAPTION_CLASS =
  "font-sans text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-white/95 xl:text-[0.85rem]";
const CAPTION_CLASS_MOBILE =
  "font-sans text-[0.85rem] font-semibold uppercase tracking-[0.13em] text-white/95";

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

  /**
   * LIVING / SOIL — plain React state, deliberately NOT a scroll-linked
   * MotionValue.
   *
   * The obvious implementation is useTransform over a hair-thin input
   * range, e.g. [hit - 0.0005, hit] → [0, 1], to fake a step function.
   * That does not survive: Motion pre-samples scroll-linked transforms
   * into keyframes at a fixed resolution, and a step that narrow falls
   * between samples, so it comes out smeared into a gradual ramp. The
   * word fades instead of hitting — the exact thing this is not meant
   * to do.
   *
   * A boolean flipped from a scroll subscription can't be interpolated,
   * so the cut stays a cut. Returning the previous tuple when nothing
   * changed keeps this from re-rendering on every scroll frame.
   */
  const [hits, setHits] = useState<[boolean, boolean]>([false, false]);
  useMotionValueEvent(aboutProgress, "change", (p) => {
    setHits((prev) => {
      const next: [boolean, boolean] = [p >= WORD_HITS[0], p >= WORD_HITS[1]];
      return next[0] === prev[0] && next[1] === prev[1] ? prev : next;
    });
  });

  // Mobile photo transforms
  const mRestY = useTransform(mobileProgress, [...MOBILE_EXIT_RANGE], ["0vh", "-100vh"]);
  const mP1Top = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_TOP[0], MOBILE_HERO_TOP]);
  const mP1Height = useTransform(mobileProgress, [...MOBILE_MORPH_RANGE], [MOBILE_STACK_H, MOBILE_HERO_H]);
  const mP1OverlayOp = useTransform(mobileProgress, [MOBILE_MORPH_RANGE[0], MOBILE_MORPH_RANGE[0] + 0.08], [1, 0]);
  // Lift phase: as text paragraphs slide in, the photo lifts UP off screen
  // and the text column shifts UP to fill the freed space — so all 3
  // paragraphs fit without being clipped by the sticky viewport.
  const mPhotoLiftY = useTransform(mobileProgress, [0.48, 0.7], ["0vh", "-45vh"]);
  const mTextLiftY = useTransform(mobileProgress, [0.48, 0.7], ["0vh", "-25vh"]);

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
          {/* ── LIVING SOIL ── each word cuts in, hard, in the band above
              the photo row — two hits rather than a reveal — then both
              leave on the row's own exit transform so the type and the
              photos clear the screen as one move. */}
          <motion.h2
            style={
              reduce
                ? { left: WORDS_LEFT, bottom: WORDS_BOTTOM, width: WORDS_WIDTH, fontSize: WORDS_SIZE }
                : { left: WORDS_LEFT, bottom: WORDS_BOTTOM, width: WORDS_WIDTH, fontSize: WORDS_SIZE, y: restY }
            }
            className="absolute z-10 flex items-end gap-[0.2em] font-display uppercase tracking-[-0.03em] whitespace-nowrap text-neutral-50 will-change-transform"
          >
            {WORDS.map((word, i) => (
              // No overflow-hidden wrapper any more: it existed only to clip
              // the old slide, and it would now crop the punch's overshoot.
              <motion.span
                key={word}
                // Opacity is a plain value, not animated: that IS the cut.
                // Only the scale recoil is animated, and initial={false}
                // keeps it from playing once on mount.
                style={{ opacity: reduce || hits[i] ? 1 : 0 }}
                initial={false}
                animate={reduce ? undefined : { scale: hits[i] ? 1 : WORD_PUNCH_SCALE }}
                transition={{ duration: WORD_PUNCH_SEC, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 leading-[1] will-change-[opacity,transform]"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

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
              <Image src={IMAGES[idx]} alt="" fill sizes={SIZES_ROW} className="object-cover" />
              {/* Dim overlay — permanent on the exiting panels, so blurb reads. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              {/* Blurb, bottom of panel */}
              <div className="absolute inset-x-0 bottom-0 p-3 xl:p-4">
                <p className={CAPTION_CLASS}>
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
            <Image src={IMAGES[0]} alt="" fill sizes={SIZES_HERO} className="object-cover" />
            {/* Overlay + blurb fade out early in the anchor morph so the
                hero image reveals fully once the row is finished. */}
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: p1OverlayOp }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            />
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: p1OverlayOp }}
              className="absolute inset-x-0 bottom-0 p-3 xl:p-4"
            >
              <p className={CAPTION_CLASS}>
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
                className="font-display text-[clamp(1.05rem,min(1.5vw,2.45vh),1.45rem)] leading-[1.65] tracking-[0.005em] text-neutral-50"
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
              <Image src={IMAGES[idx]} alt="" fill sizes={SIZES_MOBILE_ROW} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className={CAPTION_CLASS_MOBILE}>
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
                    y: mPhotoLiftY,
                  }
            }
            className="absolute overflow-hidden rounded-md"
          >
            <Image src={IMAGES[0]} alt="" fill sizes={SIZES_MOBILE_HERO} className="object-cover" />
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: mP1OverlayOp }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            />
            <motion.div
              style={reduce ? { opacity: 0 } : { opacity: mP1OverlayOp }}
              className="absolute inset-x-0 bottom-0 p-3"
            >
              <p className={CAPTION_CLASS_MOBILE}>
                {PANEL_BLURBS[0]}
              </p>
            </motion.div>
          </motion.div>

          {/* Text column — all three paragraphs. Column lifts UP as the
              photo above slides off screen, giving the paragraphs the
              full viewport to fit without being clipped. */}
          <motion.div
            className="absolute flex flex-col gap-4"
            style={{
              left: MOBILE_TEXT_LEFT,
              top: MOBILE_TEXT_TOP,
              width: MOBILE_TEXT_WIDTH,
              y: reduce ? 0 : mTextLiftY,
            }}
          >
            {ABOUT_PARAGRAPHS.map((text, i) => (
              <SlidingParagraph
                key={i}
                progress={mobileProgress}
                range={MOBILE_PARA_STAGGER[i]}
                slideFrom={MOBILE_PARA_SLIDE_FROM}
                reduce={!!reduce}
                className="text-left font-display text-[clamp(1.05rem,3.6vw,1.2rem)] leading-[1.6] tracking-[0.005em] text-neutral-50"
              >
                {text}
              </SlidingParagraph>
            ))}
          </motion.div>
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
        //
        // wght 520, not 420: light text on a black ground optically thins
        // out (halation eats the stems), so reverse type needs more weight
        // than the same face would on white. opsz 11 rather than 14 for
        // the same reason — Fraunces thins its hairlines as the optical
        // size axis climbs, and the low end keeps them solid.
        fontVariationSettings: "'opsz' 11, 'wght' 520, 'SOFT' 30, 'WONK' 0",
        ...(reduce ? {} : { x }),
      }}
      className={`will-change-transform ${className ?? ""}`}
    >
      {children}
    </motion.p>
  );
}