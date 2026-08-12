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
 * About — keyhole video, then the statement + images.
 *
 * DESKTOP (lg+): pinned, one-way letter reveal beside a top-wiping, glitching
 *   image column.
 * MOBILE (<lg): no pin (far less scroll), bigger type revealing on view, and a
 *   swipeable image carousel so the pictures are actually present.
 *
 * STICKY TRAP: the tall wrappers must NOT have an overflow-hidden ancestor.
 */

// ── keyhole knobs ──
const SCROLL_LENGTH = "h-[130vh] lg:h-[200vh]"; // shorter pin on phones
const OPEN_END = 0.65;
const START_INSET_X = 30;
const START_INSET_Y = 28;
const START_RADIUS = 14;

// ── desktop text knobs ──
const TEXT_SCROLL_LENGTH = "h-[170vh]";
const REVEAL_SPAN = 0.75;
const LETTER_LEAD = 7;
const INK = "#f4f2ec";

// ── image knobs ──
const IMAGES = ["/about-1.webp", "/about-2.webp", "/about-3.webp", "/about-4.webp"];
const IMG_WIPE = 0.1;
const GLITCH_WIN = 0.05;
const GLITCH_MAX = 70;
const RGB_MAX = 18;

const ABOUT_TEXT =
  "We're a small team of craft cultivators in Oakland, growing flower the way it's supposed to be grown — living soil, by hand, pesticide-free, no shortcuts. Every bud hand-trimmed, because machines don't give a f*ck about trichomes.";

// Line breaks for the mobile reveal (each is one masked slot).
const MOBILE_LINES = [
  "We're a small team of craft cultivators in Oakland,",
  "growing flower the way it's supposed to be grown —",
  "living soil, by hand, pesticide-free, no shortcuts.",
  "Every bud hand-trimmed, because machines don't give a f*ck about trichomes.",
];

export function About() {
  const videoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const stackRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const rOffRef = useRef<SVGFEOffsetElement>(null);
  const cOffRef = useRef<SVGFEOffsetElement>(null);

  const { scrollYProgress: videoProgress } = useScroll({
    target: videoRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: textProgress } = useScroll({
    target: textRef,
    offset: ["start start", "end end"],
  });

  const maxText = useMotionValue(0);
  useMotionValueEvent(textProgress, "change", (v) => {
    if (v > maxText.get()) maxText.set(v);
  });

  // Mobile reveal is scroll-scrubbed (whileInView proved unreliable here) and
  // latched one-way, same as the desktop side.
  const mobileRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileRef,
    offset: ["start end", "start 40%"],
  });
  const maxMobile = useMotionValue(0);
  useMotionValueEvent(mobileProgress, "change", (v) => {
    if (v > maxMobile.get()) maxMobile.set(v);
  });

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
  const N = IMAGES.length;
  let li = 0;

  const glitch = useTransform(maxText, (p) => {
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
      stackRef.current.style.filter = on ? "url(#tv-glitch)" : "none";
      stackRef.current.style.transform = on
        ? `translate(${((rnd() - 0.5) * 12 * v).toFixed(1)}px, ${((rnd() - 0.5) * 16 * v).toFixed(1)}px)`
        : "";
    }
  });

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

      {/* ── DESKTOP: pinned letter reveal + glitch images ────────────── */}
      <div ref={textRef} className={`relative hidden ${TEXT_SCROLL_LENGTH} lg:block`}>
        <div className="sticky top-0 flex min-h-screen items-center">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-16 px-8">
            <p
              className="font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-medium leading-[1.3] tracking-[-0.01em] flex-1"
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
              <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-neutral-800">
                <div ref={stackRef} className="absolute inset-0 will-change-transform">
                  <div className="absolute inset-0">
                    <Image src={IMAGES[0]} alt="" fill sizes="40vw" className="object-cover" />
                  </div>
                  {IMAGES.slice(1).map((src, idx) => {
                    const i = idx + 1;
                    return (
                      <ImageLayer
                        key={src}
                        src={src}
                        progress={maxText}
                        start={i / N - IMG_WIPE}
                        end={i / N}
                        reduce={!!reduce}
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
                    <filter id="tv-glitch" x="-20%" y="-20%" width="140%" height="140%">
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
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: bigger type + swipeable carousel (no pin) ─────────── */}
      <div ref={mobileRef} className="px-5 py-24 lg:hidden">
        <p
          className="font-display text-[clamp(2rem,7.5vw,3rem)] font-medium leading-[1.28] tracking-[-0.01em]"
          style={{ color: INK }}
        >
          {MOBILE_LINES.map((line, i) => {
            const start = i * 0.18;
            const end = Math.min(start + 0.4, 1);
            return (
              <MobileLine
                key={i}
                line={line}
                progress={maxMobile}
                start={start}
                end={end}
                reduce={!!reduce}
              />
            );
          })}
        </p>

        <div className="mt-10 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {IMAGES.map((src) => (
            <div
              key={src}
              className="relative aspect-[3/2] w-[84%] shrink-0 snap-center overflow-hidden rounded-md bg-neutral-800"
            >
              <Image src={src} alt="" fill sizes="84vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
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

/** Mobile: one line, masked slide-up scrubbed by scroll (latched one-way). */
function MobileLine({
  line,
  progress,
  start,
  end,
  reduce,
}: {
  line: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  reduce: boolean;
}) {
  const y = useTransform(progress, [start, end], ["110%", "0%"]);
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block will-change-transform"
        style={reduce ? undefined : { y }}
      >
        {line}{" "}
      </motion.span>
    </span>
  );
}

/** Image that wipes in from the top via clip-path. */
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
      <Image src={src} alt="" fill sizes="40vw" className="object-cover" />
    </motion.div>
  );
}