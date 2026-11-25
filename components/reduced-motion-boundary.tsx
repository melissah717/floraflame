"use client";

import { Fragment, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Re-mounts everything inside it when the Reduce Motion answer changes.
 *
 * useReducedMotion() says `false` on the first render (to match the server)
 * and the real value right after. Plenty of components decide how to start
 * only once, as they mount: `initial={reduce ? false : {...}}`, or which
 * element to render at all. Re-rendering wouldn't revisit those decisions,
 * so someone with Reduce Motion on would still get the entrance animations.
 * Changing the key gives them a clean mount with the right answer, with no
 * hydration error on the way.
 *
 * The outer <div> stays put across the re-mount on purpose: the age gate
 * marks the page behind it `inert` by element, and that has to survive.
 * For everyone without Reduce Motion, this does nothing.
 */
export function ReducedMotionBoundary({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <Fragment key={reduce ? "reduce" : "motion"}>{children}</Fragment>
    </div>
  );
}
