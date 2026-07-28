"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const STORAGE_KEY = "ff-age-verified";

/**
 * Blocks the whole site behind a 21+ confirmation. Verification is
 * remembered in localStorage, so returning visitors clear it near-instantly
 * on mount rather than seeing it every visit.
 */
export function AgeGate() {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      setVerified(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = verified ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [verified]);

  const confirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVerified(true);
    // Lets CookieConsent (mounted alongside this, but hidden until the age
    // gate clears) know it can check localStorage and show itself.
    window.dispatchEvent(new Event("ff:age-verified"));
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {!verified && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-neutral-900 p-6 text-center text-neutral-50 sm:p-10"
        >
          <Image
            src="/logo.png"
            alt="Flora & Flame"
            width={140}
            height={140}
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            priority
          />

          <p className="mt-6 max-w-md font-display text-3xl leading-snug sm:text-4xl">
            Are you 21 or older?
          </p>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            This site contains information about cannabis products and is
            restricted to visitors of legal age.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={confirm}
              className="rounded-full bg-neutral-50 px-8 py-3 text-sm text-neutral-900 transition-colors hover:bg-neutral-200"
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
          </div>

          <span className="mt-10 text-[11px] uppercase tracking-[0.18em] text-neutral-600">
            License # — C120000449-LIC · 21+ only
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
