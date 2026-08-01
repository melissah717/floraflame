"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useVelocity,
  useSpring,
  useMotionValue,
  useAnimationFrame,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Parallax — moves children at a different rate than page scroll.     */
/* ------------------------------------------------------------------ */
export function Parallax({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  /** Positive = recedes. Negative = comes forward. Keep between -0.5 and 0.5. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * 100}%`, `${speed * -100}%`]
  );

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="h-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ParallaxText — a gentle, continuous vertical drift while the        */
/* element is in view. Pixel-based (unlike Parallax's %-of-own-height) */
/* since text blocks are short — a % offset would be imperceptible.    */
/* Pair with Reveal for "fades in, then drifts": Reveal handles the    */
/* one-time entrance, this handles the ongoing scroll-linked motion.   */
/* ------------------------------------------------------------------ */
export function ParallaxText({
  children,
  speed = 20,
  className,
}: {
  children: ReactNode;
  /** Max drift in px, in each direction (so total travel is speed * 2). Keep small — this is meant to be felt, not seen. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} style={{ y }} className={cn("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — fades + slides in on first viewport entry.                 */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* RevealSide — slides in horizontally. Use alternating directions     */
/* down a list to get the zig-zag entrance.                            */
/* ------------------------------------------------------------------ */
export function RevealSide({
  children,
  from = "left",
  distance = 80,
  delay = 0,
  className,
}: {
  children: ReactNode;
  from?: "left" | "right";
  distance?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = from === "left" ? -distance : distance;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* RevealGroup / RevealItem — staggered cascade.                       */
/* ------------------------------------------------------------------ */
export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — plain CSS infinite strip. Needs keyframes in globals.css. */
/* ------------------------------------------------------------------ */
export function Marquee({
  children,
  duration = 30,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollMarquee — the signature effect.                               */
/* Drifts on its own, but scroll speed pushes it faster and scrolling  */
/* UP flips its direction. This is what makes the band feel alive      */
/* rather than like a decorative loop.                                 */
/* ------------------------------------------------------------------ */

// Keeps a value looping inside [min, max) so the strip never runs out.
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

export function ScrollMarquee({
  children,
  baseVelocity = 3,
  className,
}: {
  children: ReactNode;
  /** % of width per second at rest. Negative starts it moving right. */
  baseVelocity?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Smooth the raw velocity or the strip judders on trackpads.
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  // clamp:false lets fast scrolling push past the mapped range.
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  // We render 4 copies, so wrapping across 25% is one full copy width.
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Scrolling up reverses the strip; scrolling down pushes it forward.
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  if (reduce) {
    return (
      <div className={cn("overflow-hidden whitespace-nowrap", className)}>
        <div className="flex items-center gap-10">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        style={{ x }}
        className="flex w-max flex-nowrap items-center will-change-transform"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            className="flex shrink-0 items-center gap-10 pr-10"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionLabel — the "01 — drops" editorial marker.                   */
/* ------------------------------------------------------------------ */
export function SectionLabel({
  number,
  tone = "light",
  children,
}: {
  number: string;
  /** "dark" = for light backgrounds. "light" = for dark sections (site default). */
  tone?: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs tracking-[0.08em]",
        tone === "light" ? "text-neutral-400" : "text-neutral-500"
      )}
    >
      <span className="tabular-nums">{number}</span>
      <span
        className={cn(
          "h-px w-8",
          tone === "light" ? "bg-neutral-700" : "bg-neutral-300"
        )}
      />
      <span>{children}</span>
    </div>
  );
}