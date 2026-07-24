"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { HERO_IMAGES } from "@/lib/data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Headline drifts up and fades as you scroll past the hero.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-between px-5 pb-8 pt-28 sm:px-8"
    >
      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="mx-auto w-full max-w-7xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[11vw] leading-[0.92] tracking-[-0.02em] sm:text-[8vw] lg:max-w-[16ch] lg:text-[6.5vw]"
        >
          Living soil cannabis, grown slowly in Oakland.
        </motion.h1>
      </motion.div>

      {/* Image strip — staggers in after the headline. */}
      <div className="mx-auto mt-12 w-full max-w-7xl">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {HERO_IMAGES.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 1.7 + i * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={[
                "relative aspect-[4/5] overflow-hidden bg-neutral-100",
                // Hide the last two on small screens so the strip stays clean.
                i > 2 ? "hidden lg:block" : "",
                i === 2 ? "hidden sm:block" : "",
              ].join(" ")}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
                priority={i < 2}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-neutral-200 pt-4">
          <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
            Placeholder intro line. A sentence or two about the farm, the
            practice, and what makes the flower worth paying attention to.
          </p>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            Scroll ↓
          </span>
        </div>
      </div>
    </section>
  );
}