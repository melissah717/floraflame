"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComingSoonBanner } from "@/components/coming-soon-banner";
import { SpectrumBackdrop } from "@/components/spectrum-backdrop";
import { NugZoom } from "@/components/nug-zoom";
import { anchorForSpectrum, colorForHybrid } from "@/lib/spectrum";
import type { Strain } from "@/lib/strains";

const isSameBatch = (a: Strain, b: Strain) => a.slug === b.slug && a.batchNumber === b.batchNumber;

// Tracks the sm: breakpoint (640px) in JS — needed because the nug's exit
// direction and the thumbnail's entry direction differ by breakpoint, and
// that has to be a single decided value per animation rather than
// something CSS alone can pick between.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

// What actually reads as smoke, not just "blurry blobs": irregular
// (non-circular) shapes via asymmetric border-radius, elongated rather
// than round, and each one slowly rotating in place while it drifts and
// breathes (scale) — a static circle sliding side to side just looks like
// a glow no matter how blurred. Hardcoded rather than Math.random() so
// server and client render identically — see the hydration-mismatch note
// elsewhere in this file for why that matters.
const SMOKE_WISPS = [
  {
    left: "-18%", top: "-12%", width: "88%", height: "58%",
    borderRadius: "62% 38% 55% 45% / 48% 62% 38% 52%",
    opacity: 0.5, blur: 34, delay: 0,
    x: ["0%", "9%", "-4%", "6%", "0%"],
    y: ["0%", "-9%", "-3%", "5%", "0%"],
    rotate: [0, 22, 10, -8, 0],
    scale: [1, 1.14, 0.97, 1.06, 1],
    durations: { x: 13, y: 17, rotate: 21, scale: 9 },
  },
  {
    left: "26%", top: "18%", width: "50%", height: "78%",
    borderRadius: "42% 58% 60% 40% / 55% 45% 58% 42%",
    opacity: 0.38, blur: 30, delay: 1.2,
    x: ["0%", "-8%", "5%", "-3%", "0%"],
    y: ["0%", "6%", "-6%", "3%", "0%"],
    rotate: [0, -26, -8, 12, 0],
    scale: [1, 0.94, 1.12, 1, 1],
    durations: { x: 16, y: 12, rotate: 19, scale: 11 },
  },
  {
    left: "2%", top: "34%", width: "72%", height: "48%",
    borderRadius: "58% 42% 38% 62% / 62% 40% 60% 38%",
    opacity: 0.36, blur: 32, delay: 2.4,
    x: ["0%", "6%", "-7%", "4%", "0%"],
    y: ["0%", "8%", "2%", "-6%", "0%"],
    rotate: [0, 30, 6, -14, 0],
    scale: [1, 1.08, 0.95, 1.1, 1],
    durations: { x: 11, y: 15, rotate: 14, scale: 8.5 },
  },
  {
    left: "36%", top: "-10%", width: "42%", height: "66%",
    borderRadius: "48% 52% 44% 56% / 44% 56% 48% 52%",
    opacity: 0.3, blur: 28, delay: 0.6,
    x: ["0%", "-7%", "4%", "-5%", "0%"],
    y: ["0%", "9%", "-4%", "6%", "0%"],
    rotate: [0, -20, 8, -10, 0],
    scale: [1, 1.05, 1.15, 0.96, 1],
    durations: { x: 14, y: 18, rotate: 16, scale: 10 },
  },
];

// Decorative "just dropped" flourish behind the spotlighted photo — a soft
// ambient glow rather than a literal shape (star/burst/compass all read as
// clutter here): a smoky drift of colored wisps plus a warm-white
// highlight, gently billowing so it feels alive without demanding
// attention. Inline styles throughout rather than Tailwind classes — even
// static arbitrary-value classes have been unreliable in this project's
// dev setup this session (confirmed with the box-shadow glow and intro
// opacity), so this sidesteps that class of bug entirely.
function SparkleBurst({ color }: { color: string }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: "-25%", pointerEvents: "none" }}>
      {/* Each wisp wanders through 5 waypoints (not a simple back-and-forth)
          with x/y/rotate/scale each running on their own duration — that
          desync is what keeps the combined motion from ever quite
          repeating itself, closer to how smoke actually curls than a
          single oscillation ever reads. Staggered start delays keep the
          wisps out of phase with each other too. */}
      {SMOKE_WISPS.map((w, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: w.left,
            top: w.top,
            width: w.width,
            height: w.height,
            borderRadius: w.borderRadius,
            background: `radial-gradient(ellipse, ${color} 0%, transparent 68%)`,
            filter: `blur(${w.blur}px)`,
            opacity: w.opacity,
          }}
          animate={{ x: w.x, y: w.y, rotate: w.rotate, scale: w.scale }}
          transition={{
            x: { duration: w.durations.x, repeat: Infinity, ease: "easeInOut", delay: w.delay },
            y: { duration: w.durations.y, repeat: Infinity, ease: "easeInOut", delay: w.delay },
            rotate: { duration: w.durations.rotate, repeat: Infinity, ease: "easeInOut", delay: w.delay },
            scale: { duration: w.durations.scale, repeat: Infinity, ease: "easeInOut", delay: w.delay },
          }}
        />
      ))}
      <motion.div
        style={{
          position: "absolute",
          left: "18%",
          top: "12%",
          width: "58%",
          height: "58%",
          borderRadius: "55% 45% 60% 40% / 50% 55% 45% 50%",
          background: "radial-gradient(ellipse, rgba(250,248,244,0.85) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          x: ["0%", "10%", "-4%", "6%", "0%"],
          y: ["0%", "-8%", "-2%", "4%", "0%"],
          rotate: [0, 15, -6, 9, 0],
        }}
        transition={{
          x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}

export function ArchiveClient({ batches: batchesProp }: { batches: Strain[] }) {
  // New strains lead the grids for as long as they're still new — Array.sort
  // is stable, so this only pulls isNew batches to the front and otherwise
  // leaves everything in its normal collected_at order. Once new_until
  // passes, a batch just settles back into its regular spot on its own.
  const batches = useMemo(
    () => [...batchesProp].sort((a, b) => Number(b.isNew) - Number(a.isNew)),
    [batchesProp]
  );

  const currentBatches = batches.filter((b) => b.isCurrent);
  const newBatches = batches.filter((b) => b.isNew);
  const isDesktop = useIsDesktop();

  // Only skip auto-selecting when there's actually an intro cycle about to
  // run — that's the case the "stays null" behavior was protecting against
  // (the viewer snapping to some default once the spotlight finished,
  // since that default was never synced to whatever had just been
  // spotlighted). When there's nothing new to spotlight, there's no such
  // handoff to protect, so defaulting straight to the first current strain
  // avoids showing an empty "pick a strain" card with nothing to pick from.
  const [activeIndex, setActiveIndex] = useState<number | null>(() => {
    if (newBatches.length > 0) return null;
    const idx = batches.findIndex((b) => b.isCurrent);
    return idx !== -1 ? idx : 0;
  });

  // Every visit, not just the first — as long as a strain is still within
  // its new_until window, spotlight it on top of the viewer. It fades out
  // in place (no visible travel across the page); the only motion you see
  // afterward is each matching thumbnail sliding its photo in from behind
  // its own frame, as if it had been waiting there the whole time. With
  // more than one new strain, they cycle through one at a time rather than
  // only ever spotlighting the first and silently skipping the rest.
  const [introIndex, setIntroIndex] = useState(0);
  const introBatch = newBatches[introIndex];
  const [hasHydrated, setHasHydrated] = useState(false);
  // Starts false on both server and client — flipping true only after
  // mount (below) rather than from the initial state. Framer's animate
  // props (opacity, boxShadow, x/y) and the disabled attribute on
  // prev/next all trace back to this value, and computing it any other
  // way produced a real hydration mismatch (disabled true vs. absent)
  // since Next prerenders this before the client has actually mounted.
  const [showNewIntro, setShowNewIntro] = useState(false);
  // Set once the visitor jumps out early — clicking a thumbnail, prev/next,
  // or "View strain" while the cycle is running. Stops it from advancing
  // to the next new strain; doesn't by itself tear anything down (see
  // cycleDone below).
  const [cycleStopped, setCycleStopped] = useState(false);
  // Set (with a delay — see the effect below) once the current spotlight
  // has actually finished dismissing, whether that's because it was the
  // last strain or because the visitor clicked away early. Kept separate
  // from a synchronous check because going straight from "dismissed" to
  // "unmounted" tears the whole overlay down immediately, which skips the
  // nug's own slide-off transition entirely (its parent unmounts before it
  // gets a chance to play) — every strain-to-strain transition already
  // gets a 600ms gap for exactly this reason; ending the cycle needs the
  // same grace, regardless of why it's ending.
  const [cycleDone, setCycleDone] = useState(false);

  const dismissIntro = () => setShowNewIntro(false);

  // Clicking anything below (a thumbnail, prev/next) while the cycle is
  // running cancels it rather than being ignored — the current spotlight
  // still gets to finish its own dismiss/slide-off (same grace as
  // strain-to-strain), it just won't advance to another new strain after.
  const cancelIntroCycle = () => {
    if (!introActive) return;
    setCycleStopped(true);
    dismissIntro();
  };

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (introBatch) setShowNewIntro(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "View strain" needs to actually select it, not just close the overlay
  // — the button was previously wired to dismissIntro alone, which closed
  // the spotlight but left whatever strain was already active unchanged.
  const viewIntroBatch = () => {
    cancelIntroCycle();
    if (!introBatch) return;
    const idx = batches.findIndex((b) => isSameBatch(b, introBatch));
    if (idx !== -1) setActiveIndex(idx);
  };

  // Keep the viewer synced to whatever's currently spotlighted, the whole
  // time it's up — not just on click. That way when the spotlight fades,
  // there's nothing to reveal underneath except the same strain it was
  // already showing, instead of snapping to some other default.
  useEffect(() => {
    if (!introBatch) return;
    const idx = batches.findIndex((b) => isSameBatch(b, introBatch));
    if (idx !== -1) setActiveIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introIndex]);

  // Once the whole cycle finishes on its own — every new strain has had
  // its turn — settle the viewer back on the first one, rather than
  // leaving it on whichever strain happened to be last through the cycle.
  // Doesn't apply when it was cut short by a click — that's an explicit
  // pick (thumbnail, prev/next, or "View strain"), and should stick.
  useEffect(() => {
    if (cycleDone && !cycleStopped) setActiveIndex(0);
  }, [cycleDone, cycleStopped]);

  useEffect(() => {
    if (!showNewIntro) return;
    const timer = setTimeout(dismissIntro, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewIntro]);

  // Once the current spotlight dismisses — on its own timer, or because a
  // click cancelled the cycle — give its slide-off transition time to
  // finish, then either move on to the next new strain or wrap up the
  // whole cycle (marking cycleDone is what actually unmounts the
  // overlay). Checking cycleStopped inside the timeout rather than in the
  // effect's guard matters: a click needs this same delayed handoff, not
  // an early return that skips scheduling it entirely.
  useEffect(() => {
    if (showNewIntro || cycleDone) return;
    const isLast = introIndex + 1 >= newBatches.length;
    const timer = setTimeout(() => {
      if (cycleStopped || isLast) {
        setCycleDone(true);
      } else {
        setIntroIndex((i) => i + 1);
        setShowNewIntro(true);
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewIntro, cycleStopped, cycleDone, introIndex, newBatches.length]);

  if (batches.length === 0) {
    return (
      <ComingSoonBanner tone="light">
        Coming soon, no past drops on file yet.
      </ComingSoonBanner>
    );
  }

  // A new strain's thumbnail stays empty for its whole wait in the stack,
  // not just its own turn on stage — otherwise strains still queued behind
  // the front card would already be sitting filled-in in the grid while
  // their photo is still visibly stacked up top, which defeats the point
  // of dealing them out one at a time. Once the cycle is over — however it
  // ended, including a skip that cuts it short — nothing stays hidden:
  // skipping stops introIndex from ever advancing past whatever was still
  // queued, so without this check those thumbnails would sit empty
  // forever, waiting for a turn that's never coming.
  const isRevealing = (batch: Strain) => {
    if (cycleStopped || cycleDone) return false;
    const idx = newBatches.findIndex((nb) => isSameBatch(nb, batch));
    if (idx === -1) return false;
    if (idx > introIndex) return true;
    if (idx === introIndex) return showNewIntro;
    return false;
  };

  const active = activeIndex !== null ? batches[activeIndex] : null;
  const goToPrev = () => {
    cancelIntroCycle();
    setActiveIndex((i) => (i === null ? batches.length - 1 : (i - 1 + batches.length) % batches.length));
  };
  const goToNext = () => {
    cancelIntroCycle();
    setActiveIndex((i) => (i === null ? 0 : (i + 1) % batches.length));
  };

  // True for the whole cycle, not just while one spotlight is visible —
  // covers the brief gap between strains too, so a click can't sneak in
  // and get silently overridden the moment the next one starts syncing
  // activeIndex. Deliberately doesn't check cycleStopped directly — that
  // would tear the overlay down the instant a click cancels the cycle,
  // skipping the current nug's slide-off the same way the last-strain bug
  // did. cycleDone (set with a delay) is what actually ends this.
  const introActive = hasHydrated && Boolean(introBatch) && !cycleDone;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
      {/* Selected batch */}
      <div>
        <div className="relative isolate aspect-square overflow-hidden rounded-2xl bg-neutral-800">
          {/* Hidden entirely while any new-strain spotlight is running —
              previously this stayed mounted underneath, so fading the
              spotlight's backdrop briefly revealed it peeking through
              behind the sliding nug. Nothing to peek through now: this
              only appears once the whole cycle has actually finished, by
              which point activeIndex is already synced to what was last
              spotlighted, so it's a clean reveal, not a swap. */}
          {!introActive &&
            (active ? (
              <>
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.spectrum}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <SpectrumBackdrop spectrum={active.spectrum} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <NugZoom className="absolute inset-0">
                  <Image
                    src={active.nugImage ?? active.image}
                    alt={active.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 440px"
                    className="object-contain"
                    priority
                  />
                </NugZoom>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <p className="max-w-[16ch] font-display text-xl leading-snug text-neutral-500">
                  Pick a strain to see it up close
                </p>
              </div>
            ))}

          {/* Spotlight for the whole new-strain cycle — a solid black
              underlay that only fades in once at the start and out once at
              the end (AnimatePresence), not per-strain. Individual strains
              swap inside it (chrome text + the sliding nug), but the
              backing itself never fades mid-cycle, so a nug sliding off
              always reveals more solid black behind it, never whatever the
              base layer above would otherwise show. */}
          <AnimatePresence>
            {introActive && (
              <motion.div
                key="new-strain-spotlight"
                onClick={dismissIntro}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3 bg-black p-4 text-center sm:gap-4 sm:p-6"
              >
              {/* Chrome text fades per-strain against the always-solid
                  black backing — decoupled from the backing's own opacity
                  (which only fades once, at the start/end of the whole
                  cycle) so this can fade in and out between strains
                  without ever exposing what's behind the spotlight. */}
              <motion.div
                animate={{ opacity: showNewIntro ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="inline-flex items-center rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
                  Just dropped
                </span>
                <span className="font-display text-xl text-neutral-50 sm:text-2xl">
                  {introBatch.name}
                </span>
              </motion.div>
              {/* The nug itself slides off toward wherever the thumbnail
                  grid actually sits relative to this panel — right on
                  desktop (grid is beside it), down on mobile (grid is
                  below it) — rather than just fading in place. Keyed per
                  strain so cycling to the next new strain fully remounts
                  this (fresh Image element, starting from the off-screen
                  `initial`) instead of mutating the same node — otherwise
                  the position/animation can update before the new photo
                  has loaded, and the previous strain's photo flashes in
                  the "shown" spot for a frame. */}
              <motion.div
                key={`${introBatch.slug}-${introBatch.batchNumber}`}
                className="relative h-44 w-44 sm:h-56 sm:w-56"
                // Enters from the left on desktop / top on mobile, but
                // still exits toward the thumbnail grid on dismiss (right
                // on desktop, down on mobile) — entry and exit are
                // deliberately different sides now, not mirrors of each
                // other.
                initial={isDesktop ? { x: "-180%", y: "0%" } : { x: "0%", y: "-180%" }}
                animate={
                  showNewIntro
                    ? { x: "0%", y: "0%" }
                    : isDesktop
                      ? { x: "180%", y: "0%" }
                      : { x: "0%", y: "180%" }
                }
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Fades out on its own opacity rather than relying purely
                    on the slide-off to carry it out of view — it's bright
                    and colored enough against the black backing that it
                    stayed visibly perceptible through the slide and the
                    overlay's own exit fade otherwise, even once the photo
                    itself had cleared. */}
                <motion.div
                  animate={{ opacity: showNewIntro ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <SparkleBurst color={colorForHybrid(anchorForSpectrum(introBatch.spectrum))} />
                </motion.div>
                <Image
                  src={introBatch.nugImage ?? introBatch.image}
                  alt={introBatch.name}
                  fill
                  sizes="224px"
                  className="object-contain"
                />
              </motion.div>
              <motion.button
                type="button"
                onClick={viewIntroBatch}
                animate={{ opacity: showNewIntro ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: showNewIntro ? "auto" : "none" }}
                tabIndex={showNewIntro ? 0 : -1}
                className="mt-1 cursor-pointer rounded-full border border-neutral-700 px-4 py-2 text-xs tracking-[0.1em] text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                View strain
              </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-5 sm:hidden">
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous strain"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/50 text-neutral-200 transition-colors active:border-neutral-500 active:bg-neutral-700 active:text-neutral-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[3rem] text-center text-xs tracking-[0.16em] text-neutral-500 tabular-nums">
            {activeIndex !== null ? activeIndex + 1 : "–"} / {batches.length}
          </span>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next strain"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/50 text-neutral-200 transition-colors active:border-neutral-500 active:bg-neutral-700 active:text-neutral-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {!introActive && (active ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-display text-2xl tracking-[-0.01em] text-neutral-50">
                    {active.name}
                  </h2>
                  {active.isCurrent && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-400" aria-hidden />
                      In rotation
                    </span>
                  )}
                  {active.isNew && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden />
                      New
                    </span>
                  )}
                </div>
                <span className="text-sm tracking-[0.04em] text-neutral-400">
                  {active.spectrum}
                  {active.thc ? ` · ${active.thc} THC` : ""}
                </span>
              </div>

              {active.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-1 text-sm leading-relaxed text-neutral-300 sm:text-base">
                {active.description}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl tracking-[-0.01em] text-neutral-50">
                Every strain, one card at a time
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-300 sm:text-base">
                From what&apos;s in rotation now to everything we&apos;ve run before it — pick a
                strain below to see flavor, effects, and lab results.
              </p>
            </>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex flex-col gap-8">
        {currentBatches.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Now in rotation: {currentBatches.length}
            </p>
            <div className="mt-3 grid grid-cols-6 gap-3 sm:grid-cols-8 sm:gap-4">
              {currentBatches.map((batch) => (
                <Thumbnail
                  key={`current-${batch.slug}-${batch.batchNumber}`}
                  batch={batch}
                  isActive={active !== null && active.slug === batch.slug && active.batchNumber === batch.batchNumber}
                  onSelect={() => {
                    cancelIntroCycle();
                    setActiveIndex(
                      batches.findIndex(
                        (b) => b.slug === batch.slug && b.batchNumber === batch.batchNumber
                      )
                    );
                  }}
                  revealing={isRevealing(batch)}
                  isDesktop={isDesktop}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            All strains: {batches.length}
          </p>
          <div className="mt-3 grid grid-cols-6 gap-3 sm:grid-cols-8 sm:gap-4">
            {batches.map((batch, i) => (
              <Thumbnail
                key={`${batch.slug}-${batch.batchNumber}`}
                batch={batch}
                isActive={i === activeIndex}
                onSelect={() => {
                  cancelIntroCycle();
                  setActiveIndex(i);
                }}
                revealing={isRevealing(batch)}
                isDesktop={isDesktop}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnail({
  batch,
  isActive,
  onSelect,
  revealing,
  isDesktop,
}: {
  batch: Strain;
  isActive: boolean;
  onSelect: () => void;
  revealing?: boolean;
  isDesktop: boolean;
}) {
  // "New" is now signaled by the corner dot alone (below) — this used to
  // also carry a glow/box-shadow, dropped in favor of the dot since it's
  // consistent with the existing "in rotation" corner-dot convention and
  // scales better when several thumbnails in the grid are new at once.
  //
  // The selection ring used to be a Tailwind `ring-*` class, but that
  // compiles to box-shadow too — and Framer's animate prop below sets
  // boxShadow as an inline style, which always wins over a class-based
  // rule regardless of specificity. That was silently killing the ring
  // whenever this same box-shadow was also carrying the (now-removed)
  // glow. Offset gap matches the page bg so the ring reads as a ring, not
  // just a filled square.
  const restBoxShadow = isActive ? "0 0 0 2px #000000, 0 0 0 5px #faf8f4" : "0 0 0 0 rgba(250,248,244,0)";
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={batch.name}
      title={batch.name}
      className={cn(
        "relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral-800 transition-opacity",
        !isActive && (batch.isNew ? "opacity-90 hover:opacity-100" : "opacity-60 hover:opacity-100")
      )}
      // The ring goes through Framer's animate prop rather than a
      // Tailwind class — box-shadow here needs to stay inline-style-driven
      // (see the comment above) for it to reliably apply.
      animate={{ boxShadow: restBoxShadow }}
      transition={{ duration: 0.15 }}
    >
      {/* While the strain's own spotlight is up top, this thumbnail's photo
          sits just off one edge — left on desktop (the grid sits beside
          the viewer), above on mobile (the grid sits below it) — clipped
          by this button's own overflow-hidden, so it's invisible until the
          spotlight dismisses, then slides in from that edge into place. */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={
          isDesktop
            ? { x: revealing ? "-100%" : "0%", y: "0%" }
            : { x: "0%", y: revealing ? "-100%" : "0%" }
        }
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={batch.nugImage ?? batch.image} alt="" fill sizes="80px" className="object-contain" />
      </motion.div>
      {batch.isCurrent && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-lime-400 ring-2 ring-neutral-900"
        />
      )}
      {batch.isNew && (
        <span
          aria-hidden
          className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-neutral-900"
        />
      )}
    </motion.button>
  );
}
