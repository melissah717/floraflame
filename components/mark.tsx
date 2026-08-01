"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Rotating circular wordmark. Placeholder for the real logo —
 * swap the center monogram for an <Image> once you have the asset.
 * The ring rotates as you scroll past it.
 */
export function Mark({
  size = 120,
  tone = "light",
  className,
}: {
  size?: number;
  /** "dark" = for light backgrounds. "light" = for dark backgrounds (site default). */
  tone?: "dark" | "light";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  const text = "FLORA & FLAME · LIVING SOIL · OAKLAND CA · ";

  return (
    <div
      ref={ref}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        style={reduce ? undefined : { rotate }}
        className="h-full w-full"
      >
        <defs>
          <path
            id="mark-circle"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
        </defs>
        <text
          className={cn(
            "text-[7px] uppercase tracking-[0.14em]",
            tone === "light" ? "fill-neutral-400" : "fill-neutral-500"
          )}
        >
          <textPath href="#mark-circle">{text}</textPath>
        </text>
      </motion.svg>

      {/* Static center monogram — replace with the real logo. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-display text-2xl leading-none",
            tone === "light" ? "text-neutral-50" : "text-neutral-900"
          )}
        >
          F&amp;F
        </span>
      </div>
    </div>
  );
}