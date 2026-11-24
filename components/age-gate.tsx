"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LICENSE_NUMBER } from "@/lib/site";

const STORAGE_KEY = "ff-age-verified";
/**
 * Blocks the whole site behind a 21+ confirmation. Verification is
 * remembered in localStorage, so returning visitors never see it again.
 *
 * The gate is part of the server-rendered HTML, so a first-time visitor
 * sees it with the page's very first paint. It used to mount only after
 * the JavaScript had downloaded and run, which on a phone left a blank
 * loading screen for seconds (PageSpeed measured the gate's text arriving
 * at 10.6s on mobile) and made it the slowest thing on the page.
 *
 * Two things follow from rendering it up front:
 *   - Returning visitors must not get a flash of it. A one-line inline
 *     script in app/(site)/layout.tsx runs before first paint and marks
 *     <html data-age-verified>; a rule in globals.css hides the gate when
 *     that's set. React then unmounts it once it has checked for itself.
 *   - The entrance can't depend on JavaScript, so it's a small CSS rise
 *     (.age-gate-rise in globals.css) instead of a motion animation. It
 *     deliberately doesn't fade: text that starts at opacity 0 doesn't
 *     count as on screen yet.
 */
type GateStatus = "checking" | "verified" | "unverified";

const VERIFIED_EVENT = "ff:age-verified";

// Covers a browser that refuses to store anything (some private modes):
// the confirmation still has to work for the rest of the visit.
let confirmedThisVisit = false;

function subscribe(onChange: () => void) {
  window.addEventListener(VERIFIED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(VERIFIED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStatus(): GateStatus {
  if (confirmedThisVisit) return "verified";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true" ? "verified" : "unverified";
  } catch {
    return "unverified";
  }
}

export function AgeGate() {
  // "checking" is what the server renders (it can't know), and it shows the
  // gate. In the browser the stored answer is read straight away, so when
  // the gate mounts during in-app navigation a returning visitor doesn't
  // get a one-frame flash of it.
  const status = useSyncExternalStore<GateStatus>(subscribe, readStatus, () => "checking");
  const confirmRef = useRef<HTMLButtonElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = status === "verified" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  // While the gate is up, everything else on the page is made `inert`:
  // not focusable, not clickable, hidden from screen readers. That's the
  // focus trap aria-modal promises but doesn't enforce on its own —
  // without it, Tab walks straight past the gate into the nav and links.
  useEffect(() => {
    if (status !== "unverified") return;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== gateRef.current && !el.inert
    );
    siblings.forEach((el) => (el.inert = true));
    return () => siblings.forEach((el) => (el.inert = false));
  }, [status]);

  // Only once we know the gate is actually going to show — otherwise a
  // returning visitor (status "verified") would get their focus yanked
  // to this button for the one tick before the localStorage check lands.
  useEffect(() => {
    if (status === "unverified") confirmRef.current?.focus();
  }, [status]);

  const confirm = () => {
    confirmedThisVisit = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Storage blocked: confirmedThisVisit carries it for this visit.
    }
    // Tells this component to re-read, and lets CookieConsent (mounted
    // alongside, but hidden until the age gate clears) show itself.
    window.dispatchEvent(new Event(VERIFIED_EVENT));
    // The confirm button is about to unmount; without this, focus falls
    // back to <body> and a keyboard user starts over from the top.
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true })
    );
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {status !== "verified" && (
        <motion.div
          ref={gateRef}
          data-age-gate
          // The gate sits in every page's HTML; this keeps search engines
          // from quoting "Are you 21 or older?" as the page's description.
          data-nosnippet
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-heading"
          aria-describedby="age-gate-description"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-neutral-900 p-6 text-center text-neutral-50 sm:p-10"
        >
          <div className="age-gate-rise flex flex-col items-center">
            <div>
              <Image
                src="/logo.png"
                alt="Flora & Flame"
                width={140}
                height={140}
                className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                priority
              />
            </div>

            <p
              id="age-gate-heading"
              className="mt-6 max-w-md font-display text-3xl leading-snug sm:text-4xl"
            >
              Are you 21 or older?
            </p>

            <p
              id="age-gate-description"
              className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400"
            >
              This site contains information about cannabis products and is
              restricted to visitors of legal age.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                ref={confirmRef}
                type="button"
                onClick={confirm}
                className="rounded-full bg-neutral-50 px-8 py-3 text-sm text-neutral-900 transition-[background-color,scale] hover:scale-[1.03] hover:bg-neutral-200 active:scale-[0.98] motion-reduce:hover:scale-100"
              >
                Yes, I&apos;m 21+
              </button>
              <button
                type="button"
                onClick={decline}
                className="rounded-full border border-neutral-500 px-8 py-3 text-sm text-neutral-300 transition-colors hover:border-neutral-300 hover:text-neutral-50"
              >
                No, exit
              </button>
            </div>

            <span
              className="mt-10 text-[13px] uppercase tracking-[0.18em] text-neutral-400"
            >
              License #{LICENSE_NUMBER} · 21+ only
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
