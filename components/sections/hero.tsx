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
import { HERO_IMAGES } from "@/lib/data";

/**
 * Hero with a mouse-tracked panel and difference-blended type.
 *
 * THE MASK EFFECT — mix-blend-mode: difference.
 * The type is pure white with `mix-blend-difference`. Difference computes
 * |backdrop − source| per channel:
 *   over bone   (250) → |250 − 255| =   5  → reads black
 *   over photo  ( 30) → | 30 − 255| = 225  → reads white
 * One element, no duplicated layers, no SVG masks, and it tracks the panel
 * automatically because it's just compositing.
 *
 * Requirements for it to work:
 *   - the blending wrapper needs `isolate` (scopes the blend group)
 *   - that wrapper needs an actual background color to difference against
 *   - the panel must sit BELOW the type in the same stacking context
 *
 * The dim overlay lives OUTSIDE the isolated wrapper, above it, so the
 * scroll-to-black still works over the whole composition.
 */

// Edit these. Short lines work best — this type is set enormous.
const LINES = [
  { text: "Living soil.", indent: "18%" },
  { text: "Slow grown.", indent: "0%" },
  { text: "Oakland.", indent: "10%" },
];

/**
 * Panel image. Drop a file in /public and point this at it:
 *   "/hero-panel.jpg"  →  public/hero-panel.jpg
 * Local files in /public need no next.config change; only remote hosts do.
 */
const PANEL_IMAGE = HERO_IMAGES[0];

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

  // --- mouse tracking ---------------------------------------------------
  // Normalized 0→1 across the window, spring-smoothed so the panel trails
  // the cursor with weight instead of snapping to it.
  const pointer = useMotionValue(0.5);
  /**
   * Spring tuning — this is the "how fast does it follow" knob.
   *   stiffness  higher = harder pull toward the cursor
   *   damping    higher = less overshoot/wobble
   *   mass       lower  = less inertia, reacts sooner
   * Was 55/18/0.7 (heavy, laggy). At 500/38/0.15 it tracks near-instantly
   * but still eases instead of snapping. For literally 1:1 with no lag,
   * drop useSpring and use `pointer` directly.
   */
  const smooth = useSpring(pointer, {
    stiffness: 500,
    damping: 38,
    mass: 0.15,
  });
  // Wider travel so the movement actually reads.
  const panelX = useTransform(smooth, [0, 1], ["-260%", "260%"]);
  const panelSkew = useTransform(smooth, [0, 1], [3, -3]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => pointer.set(e.clientX / window.innerWidth);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [pointer, reduce]);

  // --- scroll -----------------------------------------------------------
  const overlayOpacity = useTransform(
    scrollY,
    [0, h * 0.15, h * 0.3, h * 0.45],
    [0, 0.15, 0.55, 1]
  );
  const contentY = useTransform(scrollY, [0, h * 0.8], ["0%", "-12%"]);
  const contentScale = useTransform(scrollY, [0, h * 0.8], [1, 0.96]);
  const cueOpacity = useTransform(scrollY, [0, h * 0.12], [1, 0]);

  return (
    <section className="sticky top-0 h-svh overflow-hidden">
      {/* isolate = its own blend group. bg is what the type differences against. */}
      <motion.div
        style={reduce ? undefined : { y: contentY, scale: contentScale }}
        className="relative isolate flex h-full items-center bg-neutral-50 will-change-transform"
      >
        {/* Panel — below the type, follows the cursor. */}
        {/* OUTER — mouse tracking only. Kept separate from the entrance
            because a single element can't take both an animated `x` and a
            style-driven `x`; the two would fight. */}
        <motion.div
          style={reduce ? undefined : { x: panelX, skewX: panelSkew }}
          className="absolute left-1/2 top-1/2 z-0 aspect-square w-[56vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 will-change-transform sm:w-[28vw]"
        >
          {/* INNER — entrance. Slides in from off-screen left at 2.6s, which
              is just after the last headline line finishes (1.5 + 0.26 + 1.0). */}
          <motion.div
            initial={{ x: "-420%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            transition={{ duration: 1.1, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full"
          >
            {/* No background and object-contain: the logo is a transparent
                PNG, so a bg colour would render as a visible square and
                object-cover would crop its edges.
                Difference inverts per RGB channel, so wherever the type
                crosses the artwork the colours flip. That's the effect —
                see the note below if you'd rather keep the logo true-colour. */}
            <Image
              src="/logo.png"
              alt="Flora & Flame"
              fill
              sizes="(max-width: 640px) 56vw, 28vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Type — white + difference. Inverts wherever the panel sits behind it. */}
        <div className="relative z-10 w-full px-5 mix-blend-difference sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <h1 className="font-display uppercase leading-[0.85] tracking-[-0.035em] text-white">
              {LINES.map((line, i) => (
                <span
                  key={line.text}
                  // overflow-hidden turns each line into a slot the text
                  // slides up through — the classic line reveal.
                  className="block overflow-hidden"
                  style={{ paddingLeft: line.indent }}
                >
                  <motion.span
                    initial={{ y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1,
                      delay: 1.5 + i * 0.13,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="block text-[12vw] sm:text-[10vw] lg:text-[8vw]"
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Dim — outside the blend group, above everything. */}
      <motion.div
        aria-hidden
        style={reduce ? { opacity: 0 } : { opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 z-20 bg-neutral-900"
      />

      {/* Footer row */}
      <motion.div
        style={reduce ? undefined : { opacity: cueOpacity }}
        className="absolute inset-x-0 bottom-4 z-30 px-5 sm:px-8"
      >
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-8">
          <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
            Placeholder intro line. A sentence or two about the farm, the
            practice, and what makes the flower worth paying attention to.
          </p>
          <span className="shrink-0 text-xs tracking-[0.04em] text-neutral-500">
            Scroll ↓
          </span>
        </div>
      </motion.div>
    </section>
  );
}