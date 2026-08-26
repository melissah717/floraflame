"use client";

import { useEffect } from "react";
import Lenis from "lenis";

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
      // Touch already has native inertia — bumping the multiplier just
      // makes it match wheel feel a bit more, but keep near 1.
      touchMultiplier: 1.5,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}