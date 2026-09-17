"use client";

import { useEffect, useRef, useState } from "react";
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
 *   – Hero: big display text (Archivo), letters swipe in on load
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
const HERO_MIN = 40;
// Gutter left at each end of the hero wordmark. The text is sized to fill
// everything between them, so this is the only thing keeping it off the
// screen edges. It matches NAV_LEFT so the wordmark's left edge doesn't
// shift horizontally as it docks — only its size changes.
const HERO_GUTTER = NAV_LEFT;
// Font size used by the offscreen probe that measures the string. Any
// value works; it just needs to be big enough that rounding is noise.
const PROBE_PX = 100;

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

export function DockingLogo({
  showWithNav = true,
  behindMenu = false,
}: {
  showWithNav?: boolean;
  /** True while the mobile sheet is open. The wordmark normally sits above
   * the header (z-60) so it can dock into it, but the sheet is z-50 and the
   * logo was painting over the open menu. Dropping under it for the
   * duration keeps the menu clean. */
  behindMenu?: boolean;
}) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  /**
   * Hero font size is MEASURED, not guessed at with a vw ratio.
   *
   * "Flora & Flame" has to span the full width of the viewport, and the
   * width of a string is a property of the typeface, not of the viewport —
   * a vw-based size only lands edge-to-edge at one specific window width.
   * So an offscreen probe renders the same string, in the same face, at a
   * known size; the ratio of its width to that size is constant, and the
   * font size that exactly fills the line falls out of it.
   *
   * Measured again after `document.fonts.ready` because the probe is
   * meaningless while Archivo is still swapping in from a fallback.
   */
  const probeRef = useRef<HTMLSpanElement>(null);
  const [heroPx, setHeroPx] = useState(HERO_MIN);
  useEffect(() => {
    const measure = () => {
      const probe = probeRef.current;
      if (!probe) return;
      const available = window.innerWidth - HERO_GUTTER * 2;

      // Pass 1 — rough ratio at the reference size.
      probe.style.fontSize = `${PROBE_PX}px`;
      const ratio = probe.getBoundingClientRect().width / PROBE_PX;
      if (!ratio) return;
      let size = available / ratio;

      // Pass 2 — re-measure AT that size. Each letter is laid out in its
      // own inline-block box, and those boxes round independently, so the
      // string's width isn't perfectly linear in font size: pass 1 lands
      // ~10px short at desktop widths. Measuring at the answer and
      // correcting gets it under a pixel.
      probe.style.fontSize = `${size}px`;
      const actual = probe.getBoundingClientRect().width;
      if (actual) size *= available / actual;

      setHeroPx(Math.max(HERO_MIN, size));
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fontSize = useTransform(scrollY, [0, DOCK_END], [heroPx, DOCKED_PX]);
  const x = useTransform(scrollY, [0, DOCK_END], [`${HERO_GUTTER}px`, `${NAV_LEFT}px`]);
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
      className={`fixed left-0 top-0 ${behindMenu ? "z-40" : "z-[60]"}`}
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

      {/* ── Measuring probe ── never seen. Mirrors the wordmark's markup
           EXACTLY, including the per-letter inline-block spans: those
           suppress the kerning a plain string would get, so a plain-string
           probe would measure narrower than the real thing and the
           wordmark would overhang the screen. `visibility: hidden` rather
           than `display: none`, which would measure zero. */}
      <span
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 font-display font-black uppercase leading-none tracking-[-0.02em] whitespace-nowrap"
        style={{ fontSize: `${PROBE_PX}px` }}
      >
        {LETTERS.map((char, i) => (
          <span key={i} className="inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

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