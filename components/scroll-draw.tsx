"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * Scroll-drawn SVG linework.
 *
 * HOW IT WORKS — pathLength.
 * Motion exposes `pathLength` as an animatable value from 0 to 1, and under
 * the hood sets stroke-dasharray and stroke-dashoffset to match the path's
 * real measured length. Animating 0 → 1 draws the stroke on from its start
 * point, exactly like a pen.
 *
 * Two things this requires, both easy to get wrong:
 *   - fill="none" and an explicit stroke. There's nothing to "draw" on a
 *     filled shape — you'd just see it pop in.
 *   - the path must be a real path (<path>, <circle>, <line>...), not a
 *     <g> or an embedded <image>. Rasters can't be drawn, only revealed.
 *
 * WHERE THE ARTWORK COMES FROM
 * This needs vector line art. A .webp or .png logo can't be used — it has
 * no paths. Either the illustrator supplies SVG, or existing art is traced
 * in Illustrator (Image Trace → Expand → save as SVG) and the `d` attributes
 * lifted out. Geometric traditional motifs like the ones below can be built
 * in code, which is why they're a good place to start.
 */

/* ------------------------------------------------------------------ */
/* Motif path generators                                               */
/* ------------------------------------------------------------------ */

/**
 * SEIGAIHA — the overlapping wave-scale pattern. Concentric arcs in an
 * offset grid. Traditional, geometric, and buildable without an
 * illustrator, which makes it a cheap way to test the direction.
 */
export function seigaihaPaths({
  cols = 6,
  rows = 3,
  radius = 40,
  rings = 4,
}: {
  cols?: number;
  rows?: number;
  radius?: number;
  rings?: number;
} = {}): string[] {
  const paths: string[] = [];
  const stepX = radius;
  const stepY = radius * 0.62;

  for (let row = 0; row < rows; row++) {
    // Alternate rows are offset by half a step — that interlock is what
    // makes it read as scales rather than as circles on a grid.
    const offsetX = row % 2 ? stepX / 2 : 0;

    for (let col = 0; col <= cols; col++) {
      const cx = col * stepX + offsetX;
      const cy = row * stepY;

      for (let r = 1; r <= rings; r++) {
        const rr = (radius / rings) * r;
        // Half-arc only — the lower half is hidden by the row beneath.
        paths.push(
          `M ${cx - rr} ${cy} A ${rr} ${rr} 0 0 1 ${cx + rr} ${cy}`
        );
      }
    }
  }
  return paths;
}

/**
 * ASANOHA — the hemp-leaf lattice. Worth knowing the name means "hemp
 * leaf": it's a genuine traditional Japanese motif with a real historical
 * tie to hemp, which makes it a substantive choice here rather than a
 * decorative borrowing.
 */
export function asanohaPaths({
  cols = 5,
  rows = 4,
  size = 40,
}: { cols?: number; rows?: number; size?: number } = {}): string[] {
  const paths: string[] = [];
  const h = size * Math.sqrt(3) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * size + (row % 2 ? size / 2 : 0);
      const y = row * h;

      // Hexagon outline
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return [x + (size / 2) * Math.cos(a), y + (size / 2) * Math.sin(a)];
      });
      paths.push(
        `M ${pts[0][0]} ${pts[0][1]} ` +
          pts.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
          " Z"
      );

      // Spokes to the centre — the "leaf" part of the lattice
      pts.forEach(([px, py]) => paths.push(`M ${x} ${y} L ${px} ${py}`));
    }
  }
  return paths;
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

/**
 * One path that draws itself across a slice of the scroll range.
 *
 * Windows overlap so the drawing reads as continuous brushwork rather than
 * a sequence of separate strokes. The last one must FINISH at or before
 * 1.0 — progress caps there, and anything ending past it freezes half-drawn.
 */
function DrawnPath({
  d,
  index,
  total,
  progress,
  spread = 0.55,
  strokeWidth = 1,
  disabled,
}: {
  d: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  /** How much of the range the stagger occupies. */
  spread?: number;
  strokeWidth?: number;
  disabled: boolean;
}) {
  const start = (index / total) * spread;
  const end = start + (1 - spread) * 0.9;

  const pathLength = useTransform(progress, [start, end], [0, 1]);

  if (disabled) {
    return (
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      // Keeps hairlines hairline-thin however the viewBox is scaled.
      vectorEffect="non-scaling-stroke"
      style={{ pathLength }}
    />
  );
}

/**
 * Wraps a set of paths and draws them as the element scrolls through view.
 *
 * `color` is applied to the wrapper so the paths can use currentColor —
 * one place to change, and it inherits properly on dark sections.
 */
export function ScrollDraw({
  paths,
  viewBox,
  className,
  strokeWidth = 1,
  spread = 0.55,
  opacity = 1,
  offset = ["start end", "end center"],
}: {
  paths: string[];
  viewBox: string;
  className?: string;
  strokeWidth?: number;
  spread?: number;
  opacity?: number;
  offset?: [string, string];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offset: offset as any,
  });

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        style={{ opacity }}
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((d, i) => (
          <DrawnPath
            key={i}
            d={d}
            index={i}
            total={paths.length}
            progress={scrollYProgress}
            spread={spread}
            strokeWidth={strokeWidth}
            disabled={!!reduce}
          />
        ))}
      </svg>
    </div>
  );
}