"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * Hero — three-phase entrance:
 *   1. On load: FLORA & FLAME wordmark reveals letter-by-letter (~2.1s,
 *      handled by <DockingLogo />).
 *   2. Then the headline lines drop in (delay 2.4s, staggered).
 *   3. Then the tiger panel slides in from the left (delay 3.4s).
 *
 * On scroll: the whole section pins for ~1.5 viewports thanks to the 250vh
 * wrapper — hero gets its own scroll time before About starts covering.
 * No fancy scale/opacity — just plain sticky pinning.
 */

const LINES = ["no till", "living soil", "oakland ca"];
const PANEL_IMAGE = "/logo.png";

export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const [vh, setVh] = useState(0);
  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const h = vh || 800;

  // --- pointer tracking -------------------------------------------------
  const pointer = useMotionValue(0.5);
  const smooth = useSpring(pointer, {
    stiffness: 500,
    damping: 38,
    mass: 0.15,
  });

  const range = reduce ? 40 : 260;
  const panelX = useTransform(smooth, [0, 1], [`-${range}%`, `${range}%`]);
  const panelSkew = useTransform(smooth, [0, 1], reduce ? [0, 0] : [3, -3]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.set(e.clientX / window.innerWidth);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointer]);

  // --- scroll -----------------------------------------------------------
  const contentY = useTransform(scrollY, [0, h * 0.8], ["0%", "-12%"]);
  const cueOpacity = useTransform(scrollY, [0, h * 0.12], [1, 0]);

  return (
    // Tall wrapper = longer sticky pin. Bump to 300vh (or higher) if you
    // want even more scroll time before About begins to cover.
    <div className="relative h-[180vh]">
      <section className="sticky top-0 h-svh overflow-hidden bg-neutral-900">
        <motion.div
          style={reduce ? undefined : { y: contentY }}
          className="relative flex h-full items-center bg-neutral-900 will-change-transform"
        >
          {/* OUTER — pointer tracking only. */}
          <motion.div
            style={{ x: panelX, skewX: panelSkew }}
            className="absolute left-1/2 top-1/2 z-0 aspect-square w-[56vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 will-change-transform sm:w-[28vw]"
          >
            {/* INNER — entrance. Slides in after the headline. */}
            <motion.div
              initial={{ x: "-420%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              transition={{ duration: 1.1, delay: 3.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <Image
                src={PANEL_IMAGE}
                alt="Flora & Flame"
                fill
                sizes="(max-width: 640px) 56vw, 28vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Headline — reveals AFTER the wordmark entrance finishes.
              Wordmark ends at ~2.1s; base delay 2.4s gives a small beat
              between them. */}
          <div className="relative z-10 w-full px-5 sm:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <h1 className="font-display uppercase leading-[0.85] tracking-[-0.035em] text-white">
                {LINES.map((text, i) => {
                  // Per-line sizing so each line fills its width instead of
                  // wrapping. Different character counts + character widths
                  // need different font sizes to hit that goal.
                  //   i=0 NO TILL      — 7 chars, narrow letters, can go BIG
                  //   i=1 LIVING SOIL  — 11 chars, mixed
                  //   i=2 OAKLAND CA   — 10 chars but wide letters (O/A/D),
                  //                      also intentionally smaller as a
                  //                      hierarchy footnote
                  const perLineSize = [
                    "text-[clamp(4.5rem,24vw,7rem)]",   // NO TILL
                    "text-[clamp(3.5rem,18vw,7rem)]",   // LIVING SOIL
                    "text-[clamp(2rem,10vw,4rem)]",     // OAKLAND CA
                  ];
                  return (
                    <span key={text} className="block overflow-hidden">
                      <motion.span
                        initial={{ y: "115%" }}
                        animate={{ y: 0 }}
                        transition={{
                          duration: 1,
                          delay: 2.4 + i * 0.13,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`block ${perLineSize[i]}`}
                      >
                        {text}
                      </motion.span>
                    </span>
                  );
                })}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Footer row */}
        <motion.div
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-6 z-30 px-5 sm:px-8"
        >
          <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-8">
            <p className="max-w-xl text-sm leading-relaxed text-neutral-500">
              Grown by people who actually give a f*ck.
            </p>
            <span className="shrink-0 text-xs tracking-[0.04em] text-neutral-500">
              Scroll ↓
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}