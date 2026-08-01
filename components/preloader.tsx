"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Counting preloader. Runs once on first paint, then unmounts.
 * Deliberately short (~1.2s) — a slow preloader on a small business
 * site costs you real visitors.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setDone(true);
      return;
    }

    // Lock scroll while the loader is up.
    document.body.style.overflow = "hidden";

    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Uneven increments feel more like real loading than a linear ramp.
        return Math.min(100, c + Math.floor(Math.random() * 8) + 3);
      });
    }, 40);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  useEffect(() => {
    if (count >= 100) {
      const t = setTimeout(() => {
        setDone(true);
        document.body.style.overflow = "";
      }, 350);
      return () => clearTimeout(t);
    }
  }, [count]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-neutral-900 p-6 sm:p-10"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Flora &amp; Flame
          </div>

          <div className="flex items-end justify-between">
            <span className="font-display text-[14vw] leading-[0.8] sm:text-[10vw]">
              {count}%
            </span>
            <span className="pb-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Oakland, CA
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}