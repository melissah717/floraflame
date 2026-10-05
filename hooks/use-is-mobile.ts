"use client";

import { useSyncExternalStore } from "react";

/**
 * True below the `lg` breakpoint (1024px) — the same cutoff the layouts use
 * to switch between their phone/tablet and desktop arrangements.
 *
 * Subscribed rather than read into state from an effect, so there is no
 * render-then-correct pass after hydration. The server snapshot is `false`
 * (desktop): scroll-linked desktop markup renders inert until scrolled, so
 * a phone that briefly gets it before the client snapshot lands shows
 * nothing wrong.
 */
export const MOBILE_MQ = "(max-width: 1023px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_MQ);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );
}
