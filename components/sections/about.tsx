"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * About — keyhole video, then the statement beside a swiping photo column.
 *
 * DESKTOP (lg+): pinned, one-way letter reveal. The photo column stretches to
 *   the exact height of the text (items-stretch), and the four photos swipe
 *   horizontally as you scroll.
 * MOBILE (<lg): no pin, bigger type, photos stacked below in a 3:2 window with
 *   the same swipe.
 *
 * STICKY TRAP: the tall wrappers must NOT have an overflow-hidden ancestor.
 */

// ── keyhole knobs ──
const SCROLL_LENGTH = "h-[130vh] lg:h-[200vh]";
const OPEN_END = 0.65;
const START_INSET_X = 30;
const START_INSET_Y = 28;
const START_RADIUS = 14;

// ── text knobs ──
const TEXT_SCROLL_LENGTH = "h-[170vh]";
const REVEAL_SPAN = 0.75;
const WORD_LEAD = 4; // desktop: how many words are mid-appear at once
const MOBILE_REVEAL_SPAN = 0.55; // words all lit by 55% of the pin, then hold
const MOBILE_LEAD = 5; // soft leading edge, in words
const DIM = "#000000"; // = section bg, so an unlit word is invisible
const INK = "#f4f2ec";

// ── image knobs ──
const CLOUD = "https://res.cloudinary.com/g0mcdcfr/image/upload/f_auto,q_auto";
const IMAGES = [
  `${CLOUD}/v1786660982/about-1_yckdax.webp`,
  `${CLOUD}/v1786660990/about-2_zcxmix.webp`,
  `${CLOUD}/v1786660978/about-3_vudjf1.webp`,
  `${CLOUD}/v1786660988/about-4_exdoyo.webp`,
];

// Em dash removed — a lone "—" on its own line reads as a divider.
const ABOUT_TEXT =
  "We're a small team of craft cultivators in Oakland, growing flower the way it's supposed to be grown. Living soil, by hand, pesticide-free, no shortcuts. Every bud hand-trimmed, because machines don't give a f*ck about trichomes.";


export function About() {
  const videoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: videoProgress } = useScroll({
    target: videoRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: textProgress } = useScroll({
    target: textRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileRef,
    offset: ["start start", "end end"],
  });

  // One-way latches (text only — photos swipe both ways).
  const maxText = useLatch(textProgress);
  const maxMobile = useLatch(mobileProgress);

  const clipPath = useTransform(videoProgress, (p) => {
    const t = Math.min(p / OPEN_END, 1);
    const x = START_INSET_X * (1 - t);
    const y = START_INSET_Y * (1 - t);
    const r = START_RADIUS * (1 - t);
    return `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`;
  });
  const scale = useTransform(videoProgress, [0, OPEN_END], [1.08, 1]);

  const words = ABOUT_TEXT.split(" ");

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

      {/* ── DESKTOP: pinned letter reveal + swiping photos ───────────── */}
      <div ref={textRef} className={`relative hidden ${TEXT_SCROLL_LENGTH} lg:block`}>
        <div className="sticky top-0 flex min-h-screen items-center">
          {/* items-stretch: the photo column takes the text's exact height. */}
          <div className="mx-auto flex w-full max-w-6xl items-stretch gap-16 px-8">
            <p className="flex-1 font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-medium leading-[1.3] tracking-[-0.01em]">
              {words.map((word, i) => {
                const start = (i / words.length) * REVEAL_SPAN;
                const end = Math.min(
                  start + WORD_LEAD * (REVEAL_SPAN / words.length),
                  1
                );
                return (
                  <Word
                    key={i}
                    word={word}
                    progress={maxText}
                    start={start}
                    end={end}
                    reduce={!!reduce}
                  />
                );
              })}
            </p>

            <div className="w-[40%] shrink-0">
              <SwipeImages
                images={IMAGES}
                progress={textProgress}
                reduce={!!reduce}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: text, then photos in a 3:2 window ────────────────── */}
      <div ref={mobileRef} className="relative h-[220vh] lg:hidden">
        <div className="sticky top-0 flex h-svh flex-col justify-center gap-5 overflow-hidden px-5 py-10">
          <p className="font-display text-[clamp(1.15rem,4.6vw,1.65rem)] font-medium leading-[1.25] tracking-[-0.01em]">
            {words.map((word, i) => {
              const start = (i / words.length) * MOBILE_REVEAL_SPAN;
              const end = Math.min(
                start + MOBILE_LEAD * (MOBILE_REVEAL_SPAN / words.length),
                1
              );
              return (
                <Word key={i} word={word} progress={maxMobile} start={start} end={end} reduce={!!reduce} />
              );
            })}
          </p>

          <div className="mx-auto w-full max-w-[78vw] sm:max-w-md">
            <SwipeImages
              images={IMAGES}
              progress={mobileProgress}
              reduce={!!reduce}
              className="aspect-[3/2] w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** A scroll progress that only ever moves forward. */
function useLatch(progress: MotionValue<number>) {
  const max = useMotionValue(0);
  useMotionValueEvent(progress, "change", (v) => {
    if (v > max.get()) max.set(v);
  });
  return max;
}

/** Mobile + desktop: one word colour-lerping bg-black -> white as you scroll. */
function Word({
  word,
  progress,
  start,
  end,
  reduce,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduce: boolean;
}) {
  const color = useTransform(progress, [start, end], [DIM, INK]);
  return (
    <motion.span style={reduce ? { color: INK } : { color }}>
      {word}{" "}
    </motion.span>
  );
}

/**
 * Four photos on a horizontal filmstrip that swipes with scroll.
 *
 * The track is N images wide; translating it by one image-width (100/N % of
 * the track) brings the next photo into the window. The stops below hold on
 * each photo, then swipe to the next — tuned for 4 photos. If you change the
 * photo count, regenerate the output stops (0, -25, -50, -75 for four).
 *
 * Not latched — scroll back up and the photos swipe back, which is the right
 * behaviour for images (only the text reveal is one-way).
 */
function SwipeImages({
  images,
  progress,
  reduce,
  className,
}: {
  images: string[];
  progress: MotionValue<number>;
  reduce: boolean;
  className?: string;
}) {
  const N = images.length;

  const x = useTransform(
    progress,
    [0, 0.22, 0.3, 0.52, 0.6, 0.82, 0.9, 1],
    ["0%", "0%", "-25%", "-25%", "-50%", "-50%", "-75%", "-75%"]
  );

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-neutral-800 ${className ?? ""}`}
    >
      <motion.div
        className="flex h-full will-change-transform"
        style={
          reduce
            ? { width: `${N * 100}%` }
            : { width: `${N * 100}%`, x }
        }
      >
        {images.map((src) => (
          <div
            key={src}
            className="relative h-full shrink-0"
            style={{ width: `${100 / N}%` }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 1024px) 78vw, 40vw"
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}