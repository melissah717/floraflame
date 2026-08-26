"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "motion/react";

/**
 * FLORA & FLAME wordmark. Big display type at rest — each letter swipes in
 * from the right on load, one after the next. Then font-size interpolates
 * down as you scroll, docking cleanly into the navbar.
 *
 * Two independent motion layers stacked on the same element:
 *   – OUTER motion.div: scroll-driven position + fontSize (dock)
 *   – INNER motion.spans: one-time entrance animation per letter
 * They don't fight because they animate different things (parent font size
 * scales the letters up/down; letter transforms only handle x on entrance).
 *
 * Exports DOCK_END so the navbar can gate itself on the same threshold.
 */

export const DOCK_END = 500;

const NAV_LEFT = 20;
const NAV_TOP = 22;
const HERO_TOP_VH = 10;

// BIG. Big big — but sized to fit on narrow viewports without clipping.
// At 12vw ratio and 170px cap, "Flora & Flame" stays inside the viewport
// from ~320px phones all the way up to 4K displays.
const DOCKED_PX = 26;
const HERO_VW = 12;
const HERO_MIN = 40;
const HERO_MAX = 170;

// Entrance stagger — how the letters swipe in from the right.
const ENTRANCE_DELAY = 0.3;
const LETTER_STAGGER = 0.06;
const LETTER_DURATION = 0.9;

const LETTERS = "Flora & Flame".split("");
export const ENTRANCE_TOTAL_SEC =
  ENTRANCE_DELAY + LETTERS.length * LETTER_STAGGER + LETTER_DURATION;

export function DockingLogo({ showWithNav = true }: { showWithNav?: boolean }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  // Hero font size scales with viewport (clamped). Kept as px so motion can
  // linearly interpolate against DOCKED_PX without mixing units.
  const [heroPx, setHeroPx] = useState(HERO_MAX);
  useEffect(() => {
    const measure = () => {
      const raw = window.innerWidth * (HERO_VW / 100);
      setHeroPx(Math.max(HERO_MIN, Math.min(HERO_MAX, raw)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fontSize = useTransform(scrollY, [0, DOCK_END], [heroPx, DOCKED_PX]);
  const x = useTransform(scrollY, [0, DOCK_END], ["6vw", `${NAV_LEFT}px`]);
  const y = useTransform(scrollY, [0, DOCK_END], [`${HERO_TOP_VH}vh`, `${NAV_TOP}px`]);

  const [docked, setDocked] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    setDocked(v >= DOCK_END);
  });
  const visible = !docked || showWithNav;

  return (
    <Link
      href="/"
      aria-label="Flora & Flame, home"
      className="fixed left-0 top-0 z-[60]"
    >
      <motion.div
        style={
          reduce
            ? { x: `${NAV_LEFT}px`, y: `${NAV_TOP}px`, fontSize: `${DOCKED_PX}px` }
            : { x, y, fontSize }
        }
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="font-display font-black uppercase leading-none tracking-[-0.02em] whitespace-nowrap text-neutral-50 will-change-[font-size,transform]"
      >
        {LETTERS.map((char, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { x: 140, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              delay: ENTRANCE_DELAY + i * LETTER_STAGGER,
              duration: LETTER_DURATION,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    </Link>
  );
}