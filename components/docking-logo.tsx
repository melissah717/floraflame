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
import { Wordmark } from "@/components/wordmark";

/**
 * FLORA & FLAME wordmark with a cross-fade "morph" at the terminal.
 *
 * BEHAVIOR:
 *   – Hero: big display text (Fraunces), letters swipe in on load
 *   – Scroll: text scales down + slides toward nav slot (existing dock)
 *   – Terminal: as text finishes docking, it cross-fades into the script
 *     SVG wordmark — same nav position, different visual style
 *
 * WHY CROSS-FADE INSTEAD OF TRUE SVG MORPH:
 *   Real path morphing between a bold serif and a flowing script goes
 *   through nonsense in-between shapes and always looks jankier than a
 *   clean overlay swap. Two clean shapes fading into each other reads to
 *   the eye as "morph" without any of the interpolation ugliness.
 *
 * The SVG size + color are tunable via the <Wordmark /> instance below.
 */

export const DOCK_END = 500;

const NAV_LEFT = 20;
const NAV_TOP = 22;
const HERO_TOP_VH = 10;

const DOCKED_PX = 40;
const HERO_VW = 12;
const HERO_MIN = 40;
const HERO_MAX = 170;

const ENTRANCE_DELAY = 0.3;
const LETTER_STAGGER = 0.06;
const LETTER_DURATION = 0.9;

// Cross-fade window (in scrollY px). Text fades OUT, SVG fades IN, during
// the last ~15% of the dock scroll. The two overlap by design so there's
// never an empty moment.
const SWAP_START = 425;
const SWAP_END = 500;

const LETTERS = "Flora & Flame".split("");
export const ENTRANCE_TOTAL_SEC =
  ENTRANCE_DELAY + LETTERS.length * LETTER_STAGGER + LETTER_DURATION;

export function DockingLogo({ showWithNav = true }: { showWithNav?: boolean }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

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

  // Cross-fade at terminal: text out, SVG in, during the last ~15% of dock.
  const textOp = useTransform(scrollY, [SWAP_START, SWAP_END], [1, 0]);
  const svgOp = useTransform(scrollY, [SWAP_START, SWAP_END], [0, 1]);

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
      {/* ── Text wordmark ── hero display type, docks, then fades out ── */}
      <motion.div
        style={
          reduce
            ? {
                x: `${NAV_LEFT}px`,
                y: `${NAV_TOP}px`,
                fontSize: `${DOCKED_PX}px`,
                opacity: 0,
              }
            : { x, y, fontSize, opacity: visible ? textOp : 0 }
        }
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

      {/* ── SVG wordmark ── appears at nav slot as text fades out.
           Fixed at docked position (no scroll motion — only opacity animates).
           Tune size and color here. */}
      <motion.div
        style={{
          x: `${NAV_LEFT}px`,
          y: `${NAV_TOP}px`,
          opacity: reduce ? 1 : visible ? svgOp : 0,
        }}
        className="absolute left-0 top-0"
      >
        <Wordmark className="h-11 w-56" color="bg-neutral-50" />
      </motion.div>
    </Link>
  );
}