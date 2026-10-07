"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { useLenis } from "@/components/smooth-scroll";
import { MOBILE_MQ } from "@/hooks/use-is-mobile";

/**
 * Soft section lock for the whole site.
 *
 * When a scroll gesture comes to rest part-way through something, this
 * finishes the move for you instead of leaving you to drag out the last
 * half-second by hand. It reads two kinds of markers from the page, so any
 * section opts in with an attribute and nothing else:
 *
 *   data-snap-pin="pin" | "full"
 *     A pinned, scroll-scrubbed section. "pin" = the sticky range
 *     (height − viewport); "full" = the element's whole height, i.e. until
 *     whatever follows it reaches the top. From a stop, a deliberate push
 *     (ADVANCE) glides on to the next stop; a small one eases back.
 *   data-snap-stops="0,0.2,1"           fractions of that range to rest on
 *   data-snap-stops-mobile="0,1"        same, below the lg breakpoint
 *   data-snap-handoff                   the pin's last stop becomes the
 *                                       magnet just past it, so leaving the
 *                                       hero lands the next section centred
 *
 *   data-snap="start" | "center"      (+ data-snap-offset="0.1" for headroom)
 *     A soft magnet: resting close to it (closer ahead of you than behind)
 *     glides it into place. Used to centre the contact form, for example.
 *     Far away, nothing happens, so long reading passages scroll freely.
 *
 * Wheel/trackpad: Lenis owns the scroll, so the landing spot is read from
 * its target and the settle starts as soon as the wheel goes quiet. Lenis
 * is then held locked through the glide plus a short cooldown so trackpad
 * momentum can't read as a fresh gesture. Touch: native, so it waits for
 * the momentum to die. A finger landing mid-glide cancels it.
 *
 * Pages without markers are untouched (the farm carousel runs its own).
 */

const WHEEL_SETTLE_MS = 150;
const TOUCH_SETTLE_MS = 170;
const COOLDOWN_MS = 450;
/** How far you have to push away from a resting stop before the lock
 * commits and carries you to the next one: 20% of the screen, capped at
 * 180px so a tall monitor doesn't need more scrolling than a laptop. That's
 * two mouse-wheel clicks. Less than that and the page just scrolls
 * normally; leave it there and it eases back onto the stop. */
const ADVANCE = 0.2;
const ADVANCE_MAX_PX = 180;
/** Quiet time after an under-threshold push before easing back onto the
 * stop. Long enough that slow, deliberate clicks still add up. */
const SNAP_BACK_MS = 900;
/** Inside a pin segment, how far in (0–1) you must stop before it carries
 * you to the next stop when the gesture did NOT start on a stop. */
const ENTRY_FRACTION = 0.15;
/** Magnet reach, as a fraction of the viewport. Ahead is generous: stopping
 * anywhere within most of a screen of the next section carries you there. */
const POINT_AHEAD = 0.85;
const POINT_BEHIND = 0.25;
/** Glide timing. Ease-in-out so it starts gently instead of lurching off
 * the mark, and long enough to read as a drift rather than a snap. */
const EASE = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const MIN_GLIDE_S = 0.9;
const MAX_GLIDE_S = 1.8;

type Pin = { start: number; end: number; stops: number[] };

function collect(vh: number) {
  const y = window.scrollY;
  const mobile = window.matchMedia(MOBILE_MQ).matches;
  const pins: Pin[] = [];
  const points: number[] = [];

  document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => {
    if (!el.offsetHeight) return;
    const r = el.getBoundingClientRect();
    const top = r.top + y;
    // A "center" block taller than the screen can't be centred without
    // cutting its top off, so it lines its top up instead.
    const centre = el.dataset.snap === "center" && r.height < vh * 0.96;
    // data-snap-offset: extra room above a "start" target, as a fraction of
    // the viewport, e.g. to clear the nav bar.
    const offset = (Number(el.dataset.snapOffset) || 0) * vh;
    points.push(Math.round(centre ? top + r.height / 2 - vh / 2 : top - offset));
  });

  document.querySelectorAll<HTMLElement>("[data-snap-pin]").forEach((el) => {
    if (!el.offsetHeight) return; // hidden at this breakpoint
    const top = el.getBoundingClientRect().top + y;
    const span = el.dataset.snapPin === "full" ? el.offsetHeight : el.offsetHeight - vh;
    if (span < vh * 0.15) return;
    const raw = (mobile && el.dataset.snapStopsMobile) || el.dataset.snapStops || "0,1";
    const stops = raw
      .split(",")
      .map((f) => Math.round(top + Number(f) * span))
      .sort((a, b) => a - b);
    let pinEnd = top + span;
    if (el.dataset.snapHandoff !== undefined) {
      const next = points
        .filter((p) => p >= pinEnd - vh * 0.5 && p <= pinEnd + vh)
        .sort((a, b) => Math.abs(a - pinEnd) - Math.abs(b - pinEnd))[0];
      if (next !== undefined) {
        stops[stops.length - 1] = next;
        pinEnd = Math.max(pinEnd, next);
      }
    }
    pins.push({ start: top, end: pinEnd, stops });
  });

  return { pins, points };
}

const near = (a: number, b: number) => Math.abs(a - b) <= 2;

type Decision =
  | { kind: "go"; to: number }
  /** Under the push threshold from a stop: leave the page where it is,
   * remember the stop, and ease back to it if nothing else happens. */
  | { kind: "hold"; anchor: number }
  | { kind: "none" };

function decide(landing: number, base: number, vh: number): Decision {
  const { pins, points } = collect(vh);
  if (!pins.length && !points.length) return { kind: "none" };

  const moved = landing - base;
  const pin = pins.find((p) => landing > p.start + 1 && landing < p.end - 1);
  if (pin) {
    if (pin.stops.some((s) => near(s, landing))) return { kind: "none" };
    const baseStop = pin.stops.find((s) => near(s, base));

    // Push measured from the stop the gesture (or run of slow clicks)
    // started on. Commit only once it is a deliberate push.
    if (baseStop !== undefined) {
      if (Math.abs(moved) < Math.min(ADVANCE * vh, ADVANCE_MAX_PX)) {
        return { kind: "hold", anchor: baseStop };
      }
      const to =
        moved > 0
          ? pin.stops.find((s) => s > baseStop) ?? pin.end
          : [...pin.stops].reverse().find((s) => s < baseStop) ?? pin.start;
      return { kind: "go", to };
    }

    // Arrived mid-segment from elsewhere: carry on only if well into it.
    const prev = [...pin.stops].reverse().find((s) => s < landing) ?? pin.start;
    const next = pin.stops.find((s) => s > landing) ?? pin.end;
    const frac = (landing - prev) / Math.max(1, next - prev);
    if (moved > 0) return { kind: "go", to: frac > ENTRY_FRACTION ? next : prev };
    if (moved < 0) return { kind: "go", to: frac < 1 - ENTRY_FRACTION ? prev : next };
    return { kind: "go", to: frac < 0.5 ? prev : next };
  }

  // Between sections, the edges of every animated section pull as well, so
  // the gap from one section to the next is never dead scroll you have to
  // grind through by hand.
  const magnets = [...points, ...pins.flatMap((p) => [p.start, p.end])];
  const dir = Math.sign(moved);
  const closest = (list: number[]) =>
    list.reduce<number | null>(
      (best, p) => (best === null || Math.abs(p - landing) < Math.abs(best - landing) ? p : best),
      null,
    );
  const ahead = magnets.filter(
    (p) => (dir >= 0 ? p >= landing : p <= landing) && Math.abs(p - landing) <= POINT_AHEAD * vh,
  );
  const behind = magnets.filter((p) => Math.abs(p - landing) <= POINT_BEHIND * vh);
  const to = closest(ahead.length && dir !== 0 ? ahead : behind);
  return to === null ? { kind: "none" } : { kind: "go", to };
}

export function ScrollSnap() {
  const lenis = useLenis();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!lenis || reduce) return;

    // Lenis's lock setter is TS-private but exists at runtime.
    const setLocked = (v: boolean) => {
      (lenis as unknown as { isLocked: boolean }).isLocked = v;
    };
    let timer = 0;
    let cooldown = 0;
    let snapBack = 0;
    let gestureStartY: number | null = null;
    // A stop the user nudged away from without committing. Later gestures
    // measure their push from here, so slow single clicks add up.
    let anchor: number | null = null;
    const begin = () => {
      window.clearTimeout(snapBack);
      if (gestureStartY === null) gestureStartY = lenis.scroll;
    };
    const releaseLater = () => {
      window.clearTimeout(cooldown);
      setLocked(true);
      cooldown = window.setTimeout(() => setLocked(false), COOLDOWN_MS);
    };

    const glide = (to: number) => {
      const vh = window.innerHeight;
      const target = Math.min(Math.max(to, 0), lenis.limit);
      if (Math.abs(target - lenis.scroll) < 2) return;
      const dist = Math.abs(target - lenis.scroll) / vh;
      lenis.scrollTo(target, {
        duration: Math.min(MAX_GLIDE_S, Math.max(MIN_GLIDE_S, 0.75 + dist * 0.55)),
        easing: EASE,
        lock: true,
        // Runs after Lenis's own reset() has cleared the lock; re-arm it.
        onComplete: releaseLater,
      });
    };

    const settle = (landing: number) => {
      const startY = gestureStartY ?? landing;
      gestureStartY = null;
      const base = anchor ?? startY;
      const d = decide(landing, base, window.innerHeight);
      if (d.kind === "hold") {
        anchor = d.anchor;
        snapBack = window.setTimeout(() => {
          anchor = null;
          glide(d.anchor);
        }, SNAP_BACK_MS);
        return;
      }
      anchor = null;
      if (d.kind === "go") glide(d.to);
    };

    const offWheel = lenis.on("virtual-scroll", ({ event }) => {
      if (!(event instanceof WheelEvent) || lenis.isLocked) return;
      begin();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        settle(Math.min(Math.max(lenis.targetScroll, 0), lenis.limit));
      }, WHEEL_SETTLE_MS);
    });

    const offScroll = lenis.on("scroll", (l) => {
      if (l.isScrolling !== "native") return;
      begin();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => settle(window.scrollY), TOUCH_SETTLE_MS);
    });

    const onTouchStart = () => {
      window.clearTimeout(timer);
      window.clearTimeout(snapBack);
      window.clearTimeout(cooldown);
      setLocked(false);
      if (lenis.isScrolling === "smooth") lenis.scrollTo(lenis.scroll, { immediate: true });
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      offWheel();
      offScroll();
      window.removeEventListener("touchstart", onTouchStart);
      window.clearTimeout(timer);
      window.clearTimeout(cooldown);
      window.clearTimeout(snapBack);
      setLocked(false);
    };
  }, [lenis, reduce]);

  return null;
}
