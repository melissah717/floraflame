"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";

const STORAGE_KEY = "ff-age-verified";
const EASE = [0.22, 1, 0.36, 1] as const;

const CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const LOGO_ITEM: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.85 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

/**
 * Blocks the whole site behind a 21+ confirmation. Verification is
 * remembered in localStorage, so returning visitors clear it near-instantly
 * on mount rather than seeing it every visit.
 */
type GateStatus = "checking" | "verified" | "unverified";

export function AgeGate() {
  const [status, setStatus] = useState<GateStatus>("checking");
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setStatus(window.localStorage.getItem(STORAGE_KEY) === "true" ? "verified" : "unverified");
  }, []);

  useEffect(() => {
    document.body.style.overflow = status === "verified" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  // Only once we know the gate is actually going to show — otherwise a
  // returning visitor (status "verified") would get their focus yanked
  // to this button for the one tick before the localStorage check lands.
  useEffect(() => {
    if (status === "unverified") confirmRef.current?.focus();
  }, [status]);

  const confirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setStatus("verified");
    // Lets CookieConsent (mounted alongside this, but hidden until the age
    // gate clears) know it can check localStorage and show itself.
    window.dispatchEvent(new Event("ff:age-verified"));
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {status === "unverified" && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-heading"
          aria-describedby="age-gate-description"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-neutral-900 p-6 text-center text-neutral-50 sm:p-10"
        >
          <motion.div
            variants={CONTAINER}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            <motion.div variants={LOGO_ITEM}>
              <Image
                src="/logo.png"
                alt="Flora & Flame"
                width={140}
                height={140}
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                priority
              />
            </motion.div>

            <motion.p
              id="age-gate-heading"
              variants={ITEM}
              className="mt-6 max-w-md font-display text-3xl leading-snug sm:text-4xl"
            >
              Are you 21 or older?
            </motion.p>

            <motion.p
              id="age-gate-description"
              variants={ITEM}
              className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400"
            >
              This site contains information about cannabis products and is
              restricted to visitors of legal age.
            </motion.p>

            <motion.div
              variants={ITEM}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                ref={confirmRef}
                type="button"
                onClick={confirm}
                className="rounded-full bg-neutral-50 px-8 py-3 text-sm text-neutral-900 transition-colors hover:scale-[1.03] hover:bg-neutral-200 active:scale-[0.98]"
              >
                Yes, I&apos;m 21+
              </button>
              <button
                type="button"
                onClick={decline}
                className="rounded-full border border-neutral-700 px-8 py-3 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                No, exit
              </button>
            </motion.div>

            <motion.span
              variants={ITEM}
              className="mt-10 text-[11px] uppercase tracking-[0.18em] text-neutral-600"
            >
              License #C120000449-LIC · 21+ only
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
