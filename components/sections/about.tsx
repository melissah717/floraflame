"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { Reveal } from "@/components/scroll-primitives";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * About — three acts, same shape on desktop and mobile.
 *
 *   1. Keyhole video opens up (unchanged).
 *   2. DESKTOP: LIVING SOIL hits → 4 photos row → photos 2-4 slide up →
 *      photo 1 grows into a big inset frame that fills the viewport, holds
 *      a beat, then the stage unpins and scrolls off. As it leaves, the
 *      photo inside the frame drifts slower than the frame (parallax), the
 *      way Lightship's hero visual does.
 *   3. MOBILE: same idea rotated 90°, but TRIGGERED rather than scrubbed.
 *      The keyhole opens on a timer when it scrolls into view. The photo
 *      stack pins for half a screen; a short scroll in, the three photos
 *      leave and photo 1 grows into the inset frame on a timer, then it
 *      unpins with the same parallax. Touch scroll events arrive late and
 *      in bursts, so tying layout to them frame by frame stuttered, and the
 *      long pins it needed were a lot of thumb travel for one idea.
 *   4. BOTH: the three paragraphs follow in normal flow underneath, set
 *      large and tight (Lightship's "From our aerodynamic profile…" block)
 *      and left to scroll naturally under the site's momentum scroll.
 *
 * STICKY TRAP: the tall wrappers must NOT have an overflow-hidden ancestor.
 */

// ── keyhole knobs ──
// Desktop pins for a screen while the keyhole scrubs open. Below lg there is
// no pin at all: one screen tall, opens on a timer when it comes into view.
const SCROLL_LENGTH = "h-svh lg:h-[200vh] lg:motion-reduce:h-screen";
const KEYHOLE_CLOSED = `inset(${28}% ${30}% ${28}% ${30}% round ${14}px)`;
const KEYHOLE_OPEN = "inset(0% 0% 0% 0% round 0px)";
const KEYHOLE_OPEN_SEC = 1.1;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const OPEN_END = 0.65;
const START_INSET_X = 30;
const START_INSET_Y = 28;
const START_RADIUS = 14;

// ── DESKTOP row → hero knobs ──
// The paragraph phase no longer lives inside the pinned stage, so the
// wrapper is shorter: hits → rest → exit → grow → a short hold → unpin.
const ABOUT_SCROLL_LENGTH = "h-[290vh] motion-reduce:h-screen";
const ROW_LEFT = ["7vw", "29vw", "51vw", "73vw"];
const ROW_TOP = "37vh";
const ROW_W = "20vw";
const ROW_H = "55vh";
// Final frame: a big inset panel with a thin margin all round, sitting just
// under the nav — Lightship's hero-visual proportions.
const HERO_LEFT = "3vw";
const HERO_TOP = "12vh";
const HERO_W = "94vw";
const HERO_H = "80vh";
// Ranges are fractions of the pinned range (ABOUT_SCROLL_LENGTH − 100vh =
// 190vh). In scroll distance: LIVING SOIL lands in the first ~35vh, the row
// leaves over ~60vh, photo 1 grows over the next ~60vh (overlapping the
// tail of the exit), then a short ~12vh beat before the stage unpins. The
// story text below carries a snap magnet, so the scroll from here to the
// text is a single glide rather than a screen of hand scrolling.
const EXIT_RANGE = [0.324, 0.648] as const;
const P1_MORPH_RANGE = [0.614, 0.937] as const;

// ── HERO parallax (both breakpoints) ──
// The photo inside the frame is taller than the frame by this much on each
// side, which is the room it has to drift. While the frame grows it eases
// from a slight zoom to rest; once the stage unpins and scrolls off, the
// photo slides DOWN relative to the frame, so it appears to move slower
// than the page — the lag that reads as depth.
const HERO_BLEED = "12%";
const HERO_GROW_SCALE = 1.12;
const HERO_DRIFT: [string, string] = ["-6vh", "6vh"];

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
// Tuned by measurement: "LIVING SOIL" in Archivo 800 at 15vw ran ~90.6vw
// of ink (measured at 1440px), so 15 × 86 / 90.6 ≈ 14.2vw would fill the
// row exactly. Set a little under that — landing right on the container
// width puts the flex items at the shrink threshold, and a shrunk item
// would have its word quietly clipped. 14vw lands at ~98% of the row.
// Both terms are vw, so the fit holds at every window width — only a
// change to the string or the typeface needs re-deriving.
//
// The vh term guards short, wide windows, where type sized purely off the
// width grows tall enough to collide with the nav. It can only ever make
// the line narrower than the row, never wider.
const WORDS_SIZE = "min(14vw, 25vh)";
// Two hard cuts, NOT a reveal. Each word is simply off, then on — no
// slide, no fade — so it lands like a stamp rather than arriving. The
// two hits sit ~190px of scroll apart: far enough to read as two separate
// impacts, close enough to feel like one gesture.
const WORD_HITS = [0.081, 0.179] as const;
// The recoil after each hit, in SECONDS — time-based, not scroll-based, so
// the impact lands with the same snap however fast you happen to be
// scrolling. Deliberately short: this is the shock settling, not an
// entrance; stretch it and the BOOM turns back into a zoom.
const WORD_PUNCH_SEC = 0.22;
const WORD_PUNCH_SCALE = 1.06;

// ── MOBILE stack ──
// Below lg there's no pin and no scroll-driven motion: the four photos sit
// in a plain full-width stack in normal flow. The only movement is the last
// photo growing to its full size, on a timer, once it's mostly on screen.
const MOBILE_GROW_SEC = 0.9;
/** Each photo's resting height: small enough that all four, with their
 * captions, fit on one phone screen together. Full width throughout. */
const MOBILE_PHOTO_H = "18svh";
/** Height the last photo grows to once it's in view. */
const MOBILE_FINAL_H = "70svh";
/** Display order, top to bottom: about-1 (the grow photo) comes last. */
const MOBILE_ORDER = [3, 2, 1, 0] as const;

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
const SIZES_HERO = "max(94vw, 121vh)"; //  80vh × 1.51
const SIZES_MOBILE_ROW = "100vw"; // full width, shorter than the photo's own shape
const SIZES_MOBILE_HERO = "max(100vw, 106svh)"; // 70svh × 1.51

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
 * Caption styling. These were set in the display face at display weight, which put
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
// On phones the captions sit under each photo rather than on a gradient, so
// they take the site's quieter annotation colour.
const CAPTION_CLASS_MOBILE =
  "font-sans text-[0.75rem] font-semibold uppercase tracking-[0.13em] text-neutral-400";

/**
 * The three paragraphs, Lightship-style: big, tight, line-height ~1, set at
 * a reading weight rather than display weight, left-aligned and capped at
 * roughly 1000px so lines stay around 10–12 words. Archivo at wght ~450:
 * Lightship uses a 400 grotesque on white; reverse type on black needs a
 * touch more stem or it thins out.
 */
const PARAGRAPH_CLASS =
  "font-display text-[clamp(1.35rem,2.4vw,2.75rem)] leading-[1.1] tracking-[-0.025em] text-neutral-50";
const PARAGRAPH_VARIATION = "'wght' 450";

export function About() {
  const videoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const lastPhotoRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  // The <video> is remounted when the breakpoint resolves after hydration
  // (it's keyed), and a client-created element doesn't always pick up the
  // muted autoplay on iOS Safari. Re-assert muted and start it explicitly.
  const videoElRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [isMobile]);
  // Mobile keyhole: opens once, when most of it is on screen.
  const videoOpen = useInView(videoRef, { amount: 0.55, once: true });

  const { scrollYProgress: videoProgress } = useScroll({
    target: videoRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start start", "end end"],
  });
  // 0 the moment each pinned stage unpins, 1 when it has fully scrolled
  // off — the window in which the hero photo lags behind its frame.
  const { scrollYProgress: aboutExit } = useScroll({
    target: aboutRef,
    offset: ["end end", "end start"],
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
  // Input ranges below are spelled out edge to edge (0 … 1). Opacity and
  // transform values get pre-sampled into keyframes, and a range that stops
  // short of 1 was extrapolated past its last stop instead of held, which
  // brought the overlay back up to full strength by the end of the hold.
  const p1OverlayOp = useTransform(
    aboutProgress,
    [0, P1_MORPH_RANGE[0], P1_MORPH_RANGE[0] + 0.08, 1],
    [1, 1, 0, 0],
  );
  // Photo inside the frame: settles from a slight zoom as the frame grows,
  // then drifts down while the stage scrolls off.
  const p1ImgScale = useTransform(
    aboutProgress,
    [0, P1_MORPH_RANGE[0], P1_MORPH_RANGE[1], 1],
    [HERO_GROW_SCALE, HERO_GROW_SCALE, 1, 1],
  );
  const p1ImgY = useTransform(aboutExit, [0, 1], HERO_DRIFT);

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

  // Mobile: the last photo grows once, when most of it is on screen.
  // Reduce Motion shows it at full size from the start, with no animation.
  const lastInView = useInView(lastPhotoRef, { amount: 0.6, once: true });
  const grown = !!reduce || lastInView;

  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-20 bg-neutral-900">
      {/* The section's visible headline is artwork-style type that only
          exists on desktop, so it gets a plain heading for screen readers
          and search engines to name the section by. */}
      <h2 id="about-heading" className="sr-only">
        About Flora &amp; Flame
      </h2>
      {/* ── KEYHOLE VIDEO ────────────────────────────────────────────── */}
      {/* Soft-lock markers (see components/scroll-snap.tsx). Desktop: rest
          at the top, fully open, or handed over to the stage. Phone: one
          screen, so top or handed over. */}
      <div
        ref={videoRef}
        data-snap-pin="full"
        data-snap-stops="0,0.5,1"
        data-snap-stops-mobile="0,1"
        className={`relative ${SCROLL_LENGTH}`}
      >
        <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden bg-neutral-900 lg:h-screen">
          <motion.video
            // Keyed so a breakpoint change remounts rather than leaving one
            // element holding both scroll-driven styles and timed targets.
            key={isMobile ? "triggered" : "scrubbed"}
            className="h-full w-full object-cover will-change-[clip-path,transform]"
            style={reduce || isMobile ? undefined : { clipPath, WebkitClipPath: clipPath, scale }}
            initial={false}
            animate={
              !reduce && isMobile
                ? {
                    clipPath: videoOpen ? KEYHOLE_OPEN : KEYHOLE_CLOSED,
                    scale: videoOpen ? 1 : 1.08,
                  }
                : undefined
            }
            transition={{ duration: KEYHOLE_OPEN_SEC, ease: EASE_OUT }}
            // Plays with Reduce Motion on too: it's a slow, muted, ambient
            // loop, and the setting already removes the scroll animation
            // around it. Before, the section showed a frozen poster.
            autoPlay
            ref={videoElRef}
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
      {/* Stops: start, LIVING SOIL landed with the row at rest, photo grown,
          and the pin's end. */}
      <div
        ref={aboutRef}
        data-snap-pin="pin"
        data-snap-stops="0,0.23,1"
        className={`relative hidden ${ABOUT_SCROLL_LENGTH} lg:block`}
      >
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
              style={{
                left: ROW_LEFT[idx],
                top: ROW_TOP,
                width: ROW_W,
                height: ROW_H,
                ...(reduce ? {} : { y: restY }),
              }}
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
                ? { left: ROW_LEFT[0], top: ROW_TOP, width: ROW_W, height: ROW_H }
                : { left: p1Left, top: p1Top, width: p1Width, height: p1Height }
            }
            className="absolute overflow-hidden rounded-md"
          >
            <HeroPhoto
              src={IMAGES[0]}
              sizes={SIZES_HERO}
              scale={p1ImgScale}
              y={p1ImgY}
              reduce={!!reduce}
            />
            {/* Overlay + blurb fade out early in the anchor morph so the
                hero image reveals fully once the row is finished. */}
            <motion.div
              style={reduce ? { opacity: 1 } : { opacity: p1OverlayOp }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            />
            <motion.div
              style={reduce ? { opacity: 1 } : { opacity: p1OverlayOp }}
              className="absolute inset-x-0 bottom-0 p-3 xl:p-4"
            >
              <p className={CAPTION_CLASS}>
                {PANEL_BLURBS[0]}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE: four full-width photos in normal flow. No pin, no
          scroll animation; the last one grows to full size by itself once
          it's mostly in view. Captions sit under each photo. ── */}
      <div className="flex flex-col gap-3 pt-8 lg:hidden">
        {MOBILE_ORDER.map((idx) => {
          const isLast = idx === 0;
          return (
            <figure key={idx}>
              <motion.div
                ref={isLast ? lastPhotoRef : undefined}
                initial={false}
                animate={isLast ? { height: grown ? MOBILE_FINAL_H : MOBILE_PHOTO_H } : undefined}
                transition={{ duration: reduce ? 0 : MOBILE_GROW_SEC, ease: EASE_OUT }}
                style={{ height: MOBILE_PHOTO_H }}
                className="relative w-full overflow-hidden bg-neutral-800"
              >
                <Image
                  src={IMAGES[idx]}
                  alt=""
                  fill
                  sizes={isLast ? SIZES_MOBILE_HERO : SIZES_MOBILE_ROW}
                  className="object-cover"
                  // The grown frame is tall and narrow; the grower and the
                  // plants are on the right of this photo.
                  style={isLast ? { objectPosition: "82% center" } : undefined}
                />
              </motion.div>
              <figcaption className={`mt-2 px-5 ${CAPTION_CLASS_MOBILE}`}>
                {PANEL_BLURBS[idx]}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* ── STORY — three paragraphs in normal flow, Lightship-style. The
          pinned stage above has just scrolled off carrying the big photo, so
          this reads as the caption to that image: no pin, no slide, just
          large type moving under the page's own momentum. Each paragraph
          gets the site's standard soft reveal on first view. ── */}
      {/* Sits tight under the photo. On desktop the frame ends 8vh above
          the bottom of its stage, so the top padding here is kept small. */}
      {/* Soft magnet: from the full-size photo, one push glides straight to
          the text instead of scrolling the whole stage off by hand. */}
      <div
        data-snap="start"
        data-snap-offset="0.1"
        data-snap-only="desktop"
        className="px-5 pb-[16vh] pt-12 sm:px-8 lg:px-14 lg:pb-[22vh] lg:pt-[5vh]"
      >
        <div className="flex max-w-[1000px] flex-col gap-[1.1em]">
          {ABOUT_PARAGRAPHS.map((text, i) => (
            <Reveal key={i} delay={i * 0.05} y={20}>
              <p className={PARAGRAPH_CLASS} style={{ fontVariationSettings: PARAGRAPH_VARIATION }}>
                {text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The photo inside a hero frame, oversized vertically by HERO_BLEED on each
 * side so it has room to drift without exposing the frame's edge. `scale`
 * eases the zoom out as the frame grows; `y` is the parallax lag while the
 * pinned stage scrolls off.
 */
function HeroPhoto({
  src,
  sizes,
  scale,
  y,
  reduce,
  position = "center",
}: {
  src: string;
  /** object-position for the crop. The frame is portrait and the source
   * is landscape, so this decides which part of the photo survives. */
  position?: string;
  sizes: string;
  scale: MotionValue<number>;
  y: MotionValue<string>;
  reduce: boolean;
}) {
  return (
    <motion.div
      style={{
        top: `-${HERO_BLEED}`,
        bottom: `-${HERO_BLEED}`,
        ...(reduce ? {} : { scale, y }),
      }}
      className="absolute inset-x-0 will-change-transform"
    >
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: position }} />
    </motion.div>
  );
}
