"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { PauseButton } from "@/components/pause-button";

/**
 * About — scroll TRIGGERS each step; the steps themselves play on timers,
 * so how fast or unevenly you scroll never changes how they look.
 *
 *   1. Drone video (one screen, no pin): the keyhole opens by itself once
 *      most of it is on screen.
 *   2. DESKTOP (pins for one extra screen): LIVING SOIL stamps in as the
 *      stage arrives; a short scroll in sends the photo row away and grows
 *      photo 1 to fill the whole screen; the tint and the story then fade
 *      up over it (restaurantflore.com's menu section). The rest of the pin
 *      is reading time, with the text drifting slowly.
 *   3. PHONES: four full-width photos in normal flow; the last grows to
 *      full size by itself once it's in view. The story follows below.
 *
 * Reduce Motion: no pins, nothing moves; all four photos and the story
 * text are shown in their resting layout.
 *
 * STICKY TRAP: the tall wrappers must NOT have an overflow-hidden ancestor.
 */

// ── keyhole knobs ──
// One screen tall at every size, no pin: the video opens on a timer the
// moment most of it is on screen, instead of being scrubbed open by scroll.
const SCROLL_LENGTH = "h-svh lg:h-screen";
const KEYHOLE_CLOSED = `inset(${28}% ${30}% ${28}% ${30}% round ${14}px)`;
const KEYHOLE_OPEN = "inset(0% 0% 0% 0% round 0px)";
const KEYHOLE_OPEN_SEC = 1.1;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ── DESKTOP row → hero knobs ──
// The stage pins for one extra screen, and the scroll only TRIGGERS its
// steps; the steps themselves play on timers. LIVING SOIL stamps in as the
// stage arrives, a short scroll in sends the row away and grows photo 1 to
// fill the whole screen, then the tint and story fade up over it. The rest
// of the pin is reading time, with the text drifting slowly.
const ABOUT_SCROLL_LENGTH = "h-[200vh] motion-reduce:h-screen";
// Full-bleed row: four photos edge to edge with a hairline gap between
// them (0.4vw ≈ 6px at 1440). (100 − 3 × 0.4) / 4 = 24.7vw each.
const ROW_LEFT = ["0vw", "25.1vw", "50.2vw", "75.3vw"];
const ROW_TOP = "37vh";
const ROW_W = "24.7vw";
const ROW_H = "55vh";
// Final frame: the whole screen, edge to edge.
const HERO_LEFT = "0vw";
const HERO_TOP = "0vh";
const HERO_W = "100vw";
const HERO_H = "100vh";
/** Pin progress past which the row leaves and photo 1 grows; back below
 * DESKTOP_SHRINK_AT it returns. The gap is hysteresis. */
const DESKTOP_GROW_AT = 0.12;
const DESKTOP_SHRINK_AT = 0.05;
const ROW_EXIT_SEC = 0.8;
const GROW_SEC = 1.1;
/** Tint and story fade in once the photo has (nearly) finished growing. */
const STORY_DELAY_SEC = 0.85;
const STORY_FADE_SEC = 0.7;
const STORY_TINT = 0.6;
/** Gentle drift while you read: scroll-linked, so it's smooth, not stepped. */
const STORY_DRIFT: [string, string] = ["6vh", "-6vh"];

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
// The row now runs the full width, so the type spans the screen too, with
// a 2vw gutter each side so the letters don't touch the edges.
const WORDS_LEFT = "2vw";
const WORDS_WIDTH = "96vw";
// Anchored by its BOTTOM edge, which lands 3vh above ROW_TOP (37vh). Using
// bottom rather than top means the gap to the photos stays put no matter
// how tall the type ends up.
const WORDS_BOTTOM = "66vh";
// Tuned by measurement: "LIVING SOIL" in Archivo 800 at 15vw ran ~90.6vw
// of ink (measured at 1440px), so 15 × 96 / 90.6 ≈ 15.9vw would fill the
// span exactly. Set a little under that — landing right on the container
// width puts the flex items at the shrink threshold, and a shrunk item
// would have its word quietly clipped. 15.6vw lands at ~98% of the span.
// Both terms are vw, so the fit holds at every window width — only a
// change to the string or the typeface needs re-deriving.
//
// The second term guards short, wide windows, where type sized purely off
// the width grows tall enough to run up under the nav. The words sit on a
// baseline 34vh from the top (WORDS_BOTTOM), the line box is 1em tall, and
// the nav is 80px, so 1em must stay under 34vh − 80px (8px of air added).
// It can only ever make the line narrower than the span, never wider.
const WORDS_SIZE = "min(15.6vw, calc(34vh - 88px))";
// Two hard cuts, NOT a reveal. Each word is simply off, then on — no
// slide, no fade — so it lands like a stamp rather than arriving. They fire
// on a timer once the stage is most of the way on screen, this far apart.
const WORD_GAP_SEC = 0.35;
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

/** Alt text for IMAGES, same order. Describes what's in each photo, so
 * the images are found in image search and make sense read aloud. */
const IMAGE_ALTS = [
  "Growers walking a canopy of cannabis plants under grow lights in the Oakland grow room",
  "A grower on a lift raising a freshly harvested cannabis plant overhead",
  "Gloved growers hanging harvested cannabis branches on a drying rack",
  "A grower tending young cannabis plants in mulched living soil beds",
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
const SIZES_ROW = "max(25vw, 83vh)"; //  55vh × 1.51
const SIZES_HERO = "max(100vw, 151vh)"; // 100vh × 1.51
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
/** The same story set over the darkened photo on desktop: centred, a size
 * down so all three paragraphs sit inside the frame together. */
const OVERLAY_PARAGRAPH_CLASS =
  "font-display text-center text-[clamp(1rem,min(1.45vw,2.5vh),1.65rem)] leading-[1.32] tracking-[-0.01em] text-neutral-50";

export function About() {
  const videoRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const lastPhotoRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // iOS Safari can refuse muted autoplay on a video React created on the
  // client. Re-assert muted and start it explicitly.
  const videoElRef = useRef<HTMLVideoElement>(null);
  // Only plays while near the viewport: no decoding a 1600px video
  // offscreen, and the download doesn't compete with the hero on load.
  const videoNear = useInView(videoRef, { margin: "300px 0px" });
  const [videoPaused, setVideoPaused] = useState(false);
  useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    v.muted = true;
    if (videoNear && !videoPaused) v.play().catch(() => {});
    else v.pause();
  }, [videoNear, videoPaused]);
  // Keyhole: opens once, when most of it is on screen.
  const videoOpen = useInView(videoRef, { amount: 0.55, once: true });

  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start start", "end end"],
  });
  // 0 the moment the stage unpins, 1 when it has fully scrolled off — the
  // window in which the photo lags behind its frame.
  const { scrollYProgress: aboutExit } = useScroll({
    target: aboutRef,
    offset: ["end end", "end start"],
  });

  // Desktop: one boolean off the pin's progress; everything it sets off is
  // timed, so how fast you scroll never changes how the animation plays.
  const [dGrown, setDGrown] = useState(false);
  useMotionValueEvent(aboutProgress, "change", (p) => {
    setDGrown((prev) => (prev ? p > DESKTOP_SHRINK_AT : p >= DESKTOP_GROW_AT));
  });
  const desktopGrown = !reduce && dGrown;
  const p1ImgY = useTransform(aboutExit, [0, 1], HERO_DRIFT);
  const storyY = useTransform(aboutProgress, [0, DESKTOP_GROW_AT, 1], [STORY_DRIFT[0], STORY_DRIFT[0], STORY_DRIFT[1]]);

  // LIVING / SOIL stamp in on a timer once the stage is most of the way on
  // screen. Plain booleans, so each word is a hard cut, not a fade.
  const stageRef = useRef<HTMLDivElement>(null);
  const stageInView = useInView(stageRef, { amount: 0.6 });
  const [hits, setHits] = useState<[boolean, boolean]>([false, false]);
  useEffect(() => {
    if (!stageInView || reduce) return;
    const first = window.setTimeout(() => setHits([true, false]), 0);
    const second = window.setTimeout(() => setHits([true, true]), WORD_GAP_SEC * 1000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [stageInView, reduce]);

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
      <div ref={videoRef} className={`relative ${SCROLL_LENGTH}`}>
        <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden bg-neutral-900 lg:h-screen">
          <motion.video
            className="h-full w-full object-cover will-change-[clip-path,transform]"
            initial={false}
            animate={
              !reduce
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
            ref={videoElRef}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            poster="https://res.cloudinary.com/g0mcdcfr/video/upload/so_0,q_auto,w_1200/v1786661231/About_drone_i8aaia.jpg"
          >
            <source
              src="https://res.cloudinary.com/g0mcdcfr/video/upload/vc_h264,f_mp4,q_auto,w_1600/v1786661231/About_drone_i8aaia.mp4"
              type="video/mp4"
            />
          </motion.video>
          <PauseButton
            paused={videoPaused}
            onToggle={() => setVideoPaused((p) => !p)}
            label="drone video"
            className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8"
          />
        </div>
      </div>

      {/* ── DESKTOP: LIVING SOIL + row → photo fills the screen → story ── */}
      <div ref={aboutRef} className={`relative hidden ${ABOUT_SCROLL_LENGTH} lg:block`}>
        <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden">
          {/* ── LIVING SOIL ── each word cuts in, hard, in the band above
              the photo row — two hits rather than a reveal — then both
              leave on the row's own exit transform so the type and the
              photos clear the screen as one move. */}
          <motion.h2
            initial={false}
            animate={{ y: desktopGrown ? "-110vh" : "0vh" }}
            transition={{ duration: ROW_EXIT_SEC, ease: EASE_OUT }}
            style={{ left: WORDS_LEFT, bottom: WORDS_BOTTOM, width: WORDS_WIDTH, fontSize: WORDS_SIZE }}
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
              initial={false}
              animate={{ y: desktopGrown ? "-110vh" : "0vh" }}
              transition={{
                duration: ROW_EXIT_SEC,
                ease: EASE_OUT,
                // Leave left to right, come back right to left.
                delay: desktopGrown ? (idx - 1) * 0.06 : (3 - idx) * 0.06,
              }}
              style={{ left: ROW_LEFT[idx], top: ROW_TOP, width: ROW_W, height: ROW_H }}
              className="absolute overflow-hidden"
            >
              <Image src={IMAGES[idx]} alt={IMAGE_ALTS[idx]} fill sizes={SIZES_ROW} className="object-cover" />
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
            initial={false}
            animate={
              desktopGrown
                ? { left: HERO_LEFT, top: HERO_TOP, width: HERO_W, height: HERO_H, borderRadius: 0 }
                : { left: ROW_LEFT[0], top: ROW_TOP, width: ROW_W, height: ROW_H, borderRadius: 0 }
            }
            transition={{ duration: GROW_SEC, ease: EASE_OUT, delay: desktopGrown ? 0.15 : 0 }}
            className="absolute overflow-hidden"
          >
            <HeroPhoto
              src={IMAGES[0]}
              alt={IMAGE_ALTS[0]}
              sizes={SIZES_HERO}
              grown={desktopGrown}
              y={p1ImgY}
              reduce={!!reduce}
            />
            {/* Overlay + blurb fade out early in the anchor morph so the
                hero image reveals fully once the row is finished. */}
            <motion.div
              initial={false}
              animate={{ opacity: desktopGrown ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            />
            <motion.div
              initial={false}
              animate={{ opacity: desktopGrown ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 bottom-0 p-3 xl:p-4"
            >
              <p className={CAPTION_CLASS}>
                {PANEL_BLURBS[0]}
              </p>
            </motion.div>

            {/* Story over the photo: a black tint fades up, then the three
                paragraphs, centred, drifting a little slower than the page.
                Skipped under Reduce Motion, where the photo stays in the
                row and the story renders below in normal flow instead. */}
            {!reduce && (
              <>
                <motion.div
                  aria-hidden
                  initial={false}
                  animate={{ opacity: desktopGrown ? STORY_TINT : 0 }}
                  transition={{ duration: STORY_FADE_SEC, delay: desktopGrown ? STORY_DELAY_SEC : 0 }}
                  className="pointer-events-none absolute inset-0 bg-black"
                />
                <motion.div
                  initial={false}
                  animate={{ opacity: desktopGrown ? 1 : 0 }}
                  transition={{ duration: STORY_FADE_SEC, delay: desktopGrown ? STORY_DELAY_SEC : 0 }}
                  style={{ y: storyY }}
                  className="absolute inset-0 flex items-center justify-center px-[6vw]"
                >
                  <div className="flex max-w-[75ch] flex-col items-center gap-[1em]">
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">
                      About Us
                    </p>
                    {ABOUT_PARAGRAPHS.map((text, i) => (
                      <p
                        key={i}
                        className={OVERLAY_PARAGRAPH_CLASS}
                        style={{ fontVariationSettings: PARAGRAPH_VARIATION }}
                      >
                        {text}
                      </p>
                    ))}
                    {/* Out of the Tab order until the story is showing, so
                        keyboard focus never lands on an invisible link. */}
                    <Link
                      href="/learn/the-soil"
                      tabIndex={desktopGrown ? undefined : -1}
                      aria-hidden={desktopGrown ? undefined : true}
                      className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-50 underline underline-offset-[6px]"
                    >
                      How living soil works
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
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
                  alt={IMAGE_ALTS[idx]}
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
      {/* On desktop the story is set over the photo inside the pinned
          stage instead, so this flow version is phones only, plus desktop
          with Reduce Motion, where that overlay is skipped. */}
      <div className="px-5 pb-[16vh] pt-12 sm:px-8 lg:hidden lg:px-14 lg:pb-[22vh] lg:pt-[5vh] lg:motion-reduce:block">
        <div className="flex max-w-[1000px] flex-col gap-[1.1em]">
          {ABOUT_PARAGRAPHS.map((text, i) => (
            <Reveal key={i} delay={i * 0.05} y={20}>
              <p className={PARAGRAPH_CLASS} style={{ fontVariationSettings: PARAGRAPH_VARIATION }}>
                {text}
              </p>
            </Reveal>
          ))}
          <Link
            href="/learn/the-soil"
            className="self-start text-sm font-semibold uppercase tracking-[0.18em] text-neutral-50 underline underline-offset-[6px]"
          >
            How living soil works
          </Link>
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
  alt,
  sizes,
  grown,
  y,
  reduce,
  position = "center",
}: {
  src: string;
  alt: string;
  /** object-position for the crop. */
  position?: string;
  sizes: string;
  /** Eases out of a slight zoom as the frame grows. */
  grown: boolean;
  y: MotionValue<string>;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={reduce ? undefined : { scale: grown ? 1 : HERO_GROW_SCALE }}
      transition={{ duration: GROW_SEC, ease: EASE_OUT }}
      style={{
        top: `-${HERO_BLEED}`,
        bottom: `-${HERO_BLEED}`,
        ...(reduce ? {} : { y }),
      }}
      className="absolute inset-x-0 will-change-transform"
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: position }} />
    </motion.div>
  );
}
