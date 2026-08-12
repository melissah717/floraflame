"use client";

import { useId } from "react";
import { motion, useReducedMotion, type MotionValue } from "motion/react";

/**
 * Logo distorted by an SVG displacement filter.
 *
 * HOW IT WORKS — two filter primitives:
 *   feTurbulence      generates Perlin noise. Invisible; raw material.
 *   feDisplacementMap uses that noise's R and G channels to decide how far
 *                     to push each source pixel in x and y.
 *
 * So `scale` is distortion in pixels. 0 = untouched, high = melted.
 *
 * The warp is passed IN as a MotionValue rather than computed here, because
 * the two uses need opposite curves — one dissolving on exit, one resolving
 * on entry — and both are keyed to their own section's scroll.
 *
 * PERFORMANCE — a per-pixel filter, recomputed every frame it changes. One
 * or two on a page is fine; several large ones drop frames on mid-range
 * phones. Animate `scale` only. Animating baseFrequency regenerates the
 * noise itself every frame, which is far more expensive.
 */
export function WarpedLogo({
  warp,
  src = "/logo.png",
  className = "",
  /** Noise size. LOWER = broad rolling stretches. Higher = fine ripples. */
  frequency = 0.007,
  opacity,
}: {
  /** Displacement in px. 0 = sharp, 80–140 = fully dissolved. */
  warp: MotionValue<number>;
  src?: string;
  className?: string;
  frequency?: number;
  opacity?: MotionValue<number>;
}) {
  const reduce = useReducedMotion();

  // Unique per instance. Two of these sharing a filter id and the second
  // silently inherits the first's filter — which looks like the effect
  // simply not working on one of them.
  const filterId = useId().replace(/:/g, "");

  return (
    <motion.svg
      viewBox="0 0 600 600"
      className={className}
      style={opacity ? { opacity } : undefined}
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          {/*
            fractalNoise, not turbulence. fractalNoise is smooth and reads
            as stretching; turbulence is chaotic and looks like static once
            the scale goes up.
          */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <motion.feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            // R drives x, G drives y. The same channel for both collapses
            // the whole warp onto a diagonal.
            xChannelSelector="R"
            yChannelSelector="G"
            scale={reduce ? 0 : warp}
          />
        </filter>
      </defs>

      {/*
        Filter region is oversized (180%) because displaced pixels travel
        OUTSIDE the element's box. At the default 10% margin the warp gets
        clipped into hard straight edges, which kills the illusion instantly.
      */}
      <image
        href={src}
        x="0"
        y="0"
        width="600"
        height="600"
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />
    </motion.svg>
  );
}