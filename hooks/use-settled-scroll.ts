"use client";

import { useEffect, useRef } from "react";

/**
 * Reads window.scrollY on mount and keeps reading until the browser has
 * settled a restored scroll position.
 *
 * WHY THIS EXISTS
 *
 * Reloading part-way down a page restores the scroll position
 * asynchronously, and on no schedule a component can predict. Reading it
 * synchronously in an effect sees 0; a single requestAnimationFrame often
 * does too, on a slow enough device.
 *
 * That produced a bug that only appeared on some phones and not others,
 * on identical hardware and browser: the navbar read scrollY synchronously
 * and concluded the page was at the top, so it kept its bar hidden, while
 * the wordmark's own deferred read saw the restored position. Neither
 * re-checked until the next scroll event, so until you touched the screen
 * the wordmark sat at hero size on top of the page content with no bar
 * behind it.
 *
 * So: read now, next frame, on `load`, and on a short tail of timeouts.
 * Whichever one wins, the last word is correct, and the reads are idempotent.
 */
export function useSettledScroll(onRead: (scrollY: number) => void) {
  // Held in a ref so a caller passing an inline arrow doesn't re-subscribe
  // on every render. Assigned in an effect, not during render — writing a
  // ref while rendering is not safe under concurrent rendering, and the
  // useRef initialiser already seeds the correct value for the first pass.
  const cb = useRef(onRead);
  useEffect(() => {
    cb.current = onRead;
  });

  // Declared after the assignment above so that effect runs first on mount.
  useEffect(() => {
    const read = () => cb.current(window.scrollY);

    read();
    const frame = requestAnimationFrame(read);
    const timers = [60, 200, 500].map((ms) => setTimeout(read, ms));
    window.addEventListener("load", read);

    return () => {
      cancelAnimationFrame(frame);
      for (const t of timers) clearTimeout(t);
      window.removeEventListener("load", read);
    };
  }, []);
}
