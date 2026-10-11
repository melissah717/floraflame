"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
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
  useScrollToTopOnNavigate();

  useEffect(() => {
    // Momentum scrolling is exactly the kind of motion Reduce Motion asks
    // to switch off, so those visitors get the browser's native scroll.
    // Everything that reads useLenis() already handles null.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
/**
 * Every new page starts at the top.
 *
 * Next.js scrolls to the top on navigation by itself, but Lenis keeps its
 * own idea of the scroll position: following a link from halfway down the
 * home page, Lenis carried that position onto the new page and dropped you
 * near its bottom. So on each pathname change, jump both Lenis and the
 * window to 0, instantly (no glide).
 *
 * Two exceptions, both left to the browser:
 *   – Back/Forward, which should return you to where you were.
 *   – Links with a #hash (e.g. /#contact), which should land on that spot.
 */
function useScrollToTopOnNavigate() {
  const pathname = usePathname();
  const lenis = useLenis();
  const fromHistory = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    // Initial load: the browser's own restore/anchor handling applies.
    if (first.current) {
      first.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;

    const toTop = () => {
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    toTop();
    // Once more after paint: Next's own scroll handling and late layout
    // (images, pinned sections measuring themselves) can nudge it.
    const id = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(id);
    // Only on navigation; a Lenis instance appearing isn't a navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
