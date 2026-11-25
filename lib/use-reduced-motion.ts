"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Whether the visitor has Reduce Motion switched on. Use this instead of
 * motion's own `useReducedMotion`.
 *
 * The server can't know the setting, so it renders the animated version.
 * motion's hook reads the real value on the browser's very first render,
 * which meant anyone with Reduce Motion on got markup that didn't match the
 * server's (the preloader existed in one and not the other, for a start).
 * React logged a hydration error, threw the server's HTML away and rebuilt
 * the page from scratch.
 *
 * This one answers `false` for that first render, so it always matches the
 * server, and switches to the real value immediately afterwards. Components
 * that only read the setting once, when they first appear, are handled by
 * <ReducedMotionBoundary>, which re-mounts the page when the answer changes.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
