"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";

/* ------------------------------------------------------------------ */
/* Tiny external store so any client component can grab the live      */
/* Lenis instance (for lenis.scrollTo, the snap plugin, etc.) without  */
/* threading it through context from the root layout.                 */
/* ------------------------------------------------------------------ */
let instance: Lenis | null = null;
const listeners = new Set<() => void>();

function publish(next: Lenis | null) {
  instance = next;
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** The page's Lenis instance, or null before <SmoothScroll /> mounts
 * (and always null on the server). Re-renders when it appears. */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribe, () => instance, () => null);
}

/**
 * Momentum scroll for the whole site.
 *
 * Releasing the wheel or trackpad doesn't stop the page dead — Lenis lets
 * the scroll decay with physics. Works transparently with motion/react's
 * `useScroll`, `useVelocity`, etc. because Lenis updates window.scrollY the
 * same way native scroll does — so every existing scroll-linked animation
 * (hero parallax, About reveal, marquee velocity flip) just gets smoother
 * without any changes.
 *
 * Drop <SmoothScroll /> once, near the top of app/layout.tsx.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // Higher = longer glide after release. 1.2s is the sweet spot for
      // most sites — cinematic without feeling floaty.
      duration: 1.2,
      // easeOutExpo-ish: snappy at start, gentle settle.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch already has native inertia, so this only scales how far the
      // page travels per pixel of finger. At 1.5 the page ran 50% ahead of
      // the thumb and every flick landed past where it was aimed — the
      // overshoot at the end of pinned sections. 1 tracks the finger.
      touchMultiplier: 1,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    publish(lenis);

    return () => {
      publish(null);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}