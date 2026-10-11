"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const AGE_KEY = "ff-age-verified";
const COOKIE_KEY = "ff-cookie-consent";

/**
 * A notice, not a consent prompt: the site sets no advertising or
 * cross-site tracking cookies (Vercel Analytics is cookieless), so there
 * is nothing to opt into. The copy says exactly that and links the
 * privacy policy rather than implying "browsing = consent" to cookies
 * that don't exist. If ad pixels or tracking cookies are ever added, this
 * has to become a real accept/decline choice that gates them.
 *
 * Bottom bar, not a blocker like AgeGate — only makes sense to show once
 * the age gate has cleared, so it waits for the "ff:age-verified" event
 * (same-session) as well as checking localStorage directly (return visits).
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const ageOk = window.localStorage.getItem(AGE_KEY) === "true";
      const cookieOk = window.localStorage.getItem(COOKIE_KEY) === "true";
      setShow(ageOk && !cookieOk);
    };

    check();
    window.addEventListener("ff:age-verified", check);
    return () => window.removeEventListener("ff:age-verified", check);
  }, []);

  const accept = () => {
    window.localStorage.setItem(COOKIE_KEY, "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="region"
          aria-label="Cookie notice"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[150] flex flex-col items-center justify-between gap-4 border-t border-neutral-700 bg-neutral-900 px-5 py-5 text-neutral-50 sm:flex-row sm:px-8"
        >
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
            We don&apos;t use advertising or tracking cookies. Your browser
            remembers your age confirmation, and we use cookieless analytics
            to see which pages get visited. Details in our{" "}
            <Link href="/privacy" className="underline hover:text-neutral-50">
              Privacy Policy
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={accept}
            className="shrink-0 rounded-full bg-neutral-50 px-6 py-2.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
