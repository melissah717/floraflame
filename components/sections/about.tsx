"use client";

import { Fragment, useRef } from "react";
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
 * About — keyhole video, then the statement + a glitching image cycle.
 *
 * DESKTOP (lg+): pinned, one-way letter reveal beside the image cycle.
 * MOBILE (<lg): no pin, bigger type, image cycle stacked below (scrolls down —
 *   no horizontal carousel).
 * Both share <GlitchImageCycle> so the top-wipe + analog-TV glitch is identical.
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
const LETTER_LEAD = 7;
const MOBILE_REVEAL_SPAN = 0.55; // words all lit by 55% of the pin, then hold
const MOBILE_LEAD = 5; // soft leading edge, in words
const DIM = "#000000"; // = section bg, so an unlit word is invisible
const INK = "#f4f2ec";

// ── image knobs ──
const IMAGES = ["/about-1.webp", "/about-2.webp", "/about-3.webp", "/about-4.webp"];
const IMG_WIPE = 0.1;
const GLITCH_WIN = 0.05;
const GLITCH_MAX = 70;
const RGB_MAX = 18;

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
    // Pinned block: 0 when it pins to the top, 1 as it releases at the bottom.
    offset: ["start start", "end end"],
  });

  // One-way latches.
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
  const totalLetters = words.reduce((n, w) => n + w.length, 0);
  let li = 0;

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
            poster="/about-grow-poster.jpg"
          >
            <source src="/about_drone.webm" type="video/webm" />
            <source src="/about_drone.mp4" type="video/mp4" />
          </motion.video>
        </div>
      </div>

      {/* ── DESKTOP: pinned letter reveal + image cycle ──────────────── */}
      <div ref={textRef} className={`relative hidden ${TEXT_SCROLL_LENGTH} lg:block`}>
        <div className="sticky top-0 flex min-h-screen items-center">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-16 px-8">
            <p
              className="flex-1 font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-medium leading-[1.3] tracking-[-0.01em]"
              style={{ color: INK }}
            >
              {words.map((word, wi) => (
                <Fragment key={wi}>
                  <span className="inline-block overflow-hidden whitespace-nowrap align-bottom leading-[1.3]">
                    {word.split("").map((ch, ci) => {
                      const gi = li++;
                      const start = (gi / totalLetters) * REVEAL_SPAN;
                      const end = Math.min(
                        start + LETTER_LEAD * (REVEAL_SPAN / totalLetters),
                        1
                      );
                      return (
                        <Letter
                          key={ci}
                          char={ch}
                          progress={maxText}
                          start={start}
                          end={end}
                          reduce={!!reduce}
                        />
                      );
                    })}
                  </span>{" "}
                </Fragment>
              ))}
            </p>

            <div className="w-[40%] shrink-0">
              <GlitchImageCycle
                images={IMAGES}
                progress={textProgress}
                filterId="tv-glitch-d"
                reduce={!!reduce}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: text + image pin together while the pictures cycle ── */}
      <div ref={mobileRef} className="relative h-[220vh] lg:hidden">
        <div className="sticky top-0 flex min-h-screen flex-col justify-center gap-10 px-5">
          <p className="font-display text-[clamp(1.9rem,7vw,2.75rem)] font-medium leading-[1.22] tracking-[-0.01em]">
            {words.map((word, i) => {
              const start = (i / words.length) * MOBILE_REVEAL_SPAN;
              const end = Math.min(
                start + MOBILE_LEAD * (MOBILE_REVEAL_SPAN / words.length),
                1
              );
              return (
                <Word
                  key={i}
                  word={word}
                  progress={maxMobile}
                  start={start}
                  end={end}
                  reduce={!!reduce}
                />
              );
            })}
          </p>

          <GlitchImageCycle
            images={IMAGES}
            progress={mobileProgress}
            filterId="tv-glitch-m"
            reduce={!!reduce}
          />
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

/** Desktop: one letter sliding up out of its word slot. */
function Letter({
  char,
  progress,
  start,
  end,
  reduce,
}: {
  char: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduce: boolean;
}) {
  const y = useTransform(progress, [start, end], ["105%", "0%"]);
  if (reduce) return <span className="inline-block">{char}</span>;
  return (
    <motion.span className="inline-block will-change-transform" style={{ y }}>
      {char}
    </motion.span>
  );
}

/** Mobile: one word colour-lerping bg-black -> white as you scroll. */
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


/** Image cycle: each image wipes in from the top, with a glitch on each swap. */
function GlitchImageCycle({
  images,
  progress,
  filterId,
  reduce,
}: {
  images: string[];
  progress: MotionValue<number>;
  filterId: string;
  reduce: boolean;
}) {
  const N = images.length;
  const stackRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const rOffRef = useRef<SVGFEOffsetElement>(null);
  const cOffRef = useRef<SVGFEOffsetElement>(null);

  const glitch = useTransform(progress, (p) => {
    let g = 0;
    for (let i = 1; i < N; i++) {
      const s = i / N - IMG_WIPE;
      const d = Math.abs(p - s);
      if (d < GLITCH_WIN) g = Math.max(g, 1 - d / GLITCH_WIN);
    }
    return g;
  });

  const rnd = () => Math.random();
  useMotionValueEvent(glitch, "change", (v) => {
    if (reduce) return;
    const on = v > 0.01;
    dispRef.current?.setAttribute("scale", (v * GLITCH_MAX * (0.5 + rnd())).toFixed(1));
    const split = (v * RGB_MAX * (0.4 + rnd())).toFixed(1);
    rOffRef.current?.setAttribute("dx", split);
    cOffRef.current?.setAttribute("dx", (-Number(split)).toFixed(1));
    if (on) turbRef.current?.setAttribute("seed", String(Math.floor(rnd() * 999)));
    if (stackRef.current) {
      stackRef.current.style.filter = on ? `url(#${filterId})` : "none";
      stackRef.current.style.transform = on
        ? `translate(${((rnd() - 0.5) * 12 * v).toFixed(1)}px, ${((rnd() - 0.5) * 16 * v).toFixed(1)}px)`
        : "";
    }
  });

  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-neutral-800">
      <div ref={stackRef} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0">
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="(max-width: 1024px) 92vw, 40vw"
            className="object-cover"
          />
        </div>
        {images.slice(1).map((src, idx) => {
          const i = idx + 1;
          return (
            <ImageLayer
              key={src}
              src={src}
              progress={progress}
              start={i / N - IMG_WIPE}
              end={i / N}
              reduce={reduce}
            />
          );
        })}
      </div>

      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            opacity: glitch,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
          }}
        />
      )}

      {!reduce && (
        <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0.01 0.55"
              numOctaves={2}
              seed={1}
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
              result="disp"
            />
            <feColorMatrix
              in="disp"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feColorMatrix
              in="disp"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="cyan"
            />
            <feOffset ref={rOffRef} in="red" dx={0} dy={0} result="redoff" />
            <feOffset ref={cOffRef} in="cyan" dx={0} dy={0} result="cyanoff" />
            <feBlend in="redoff" in2="cyanoff" mode="screen" />
          </filter>
        </svg>
      )}
    </div>
  );
}

/** One image that wipes in from the top via clip-path. */
function ImageLayer({
  src,
  progress,
  start,
  end,
  reduce,
}: {
  src: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduce: boolean;
}) {
  const b = useTransform(progress, [start, end], [100, 0]);
  const clip = useTransform(b, (v) => `inset(0 0 ${v}% 0)`);
  return (
    <motion.div
      className="absolute inset-0 will-change-[clip-path]"
      style={
        reduce
          ? { clipPath: "inset(0 0 100% 0)" }
          : { clipPath: clip, WebkitClipPath: clip }
      }
    >
      <Image src={src} alt="" fill sizes="(max-width: 1024px) 92vw, 40vw" className="object-cover" />
    </motion.div>
  );
}