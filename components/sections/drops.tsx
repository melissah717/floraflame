"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { type Strain } from "@/lib/strains";
import { RGB, anchorForSpectrum, colorForHybrid } from "@/lib/spectrum";
import { SpectrumBackdrop } from "@/components/spectrum-backdrop";
import { NugZoom } from "@/components/nug-zoom";
import { ParallaxText, Reveal, SectionLabel } from "@/components/scroll-primitives";
import { cn } from "@/lib/utils";

/**
 * Spectrum carousel. Every strain is plotted once on a single indica ->
 * sativa rail (0 = indica, 100 = sativa) instead of living in an arbitrary
 * list order. Drag/click the rail — or the strains on it directly — to
 * scrub between them; the stage above crossfades and the ambient glow
 * shifts color to match where the active strain sits on the spectrum.
 */

function sortBySpectrum(strains: Strain[]) {
  return [...strains].sort(
    (a, b) => anchorForSpectrum(a.spectrum) - anchorForSpectrum(b.spectrum)
  );
}

// Coverflow math for the strain carousel — each card's depth/tilt/fade is
// purely a function of how far it sits from the active index, so the same
// formula works whether there are 3 strains or 30.
const CARD_STEP_PX = 136;

function coverflowTransform(offset: number) {
  const abs = Math.abs(offset);
  return {
    x: `calc(-50% + ${offset * CARD_STEP_PX}px)`,
    y: "-50%",
    z: -abs * 60,
    rotateY: Math.max(-42, Math.min(42, offset * -30)),
    scale: Math.max(0.72, 1 - abs * 0.08),
    opacity: Math.max(0.58, 1 - abs * 0.09),
    zIndex: 100 - abs,
  };
}

// The carousel loops — index 0 sits right after the last card, not off in
// the distance. Wrapping the raw index difference to its shortest signed
// path around the loop is what makes that read as a continuous loop
// instead of the deck jumping across itself when you cross the seam.
function circularOffset(i: number, activeIndex: number, length: number) {
  let diff = i - activeIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

/**
 * Name, tags, and (optionally) the expanded description/dl block for one
 * strain. Pulled out of the animated stage so the exact same markup can
 * be rendered a second time, invisibly, purely to measure how tall each
 * strain's content naturally is — see the min-height reservation in
 * Drops() below.
 */
function StrainInfo({
  strain,
  color,
  showDescription,
  onToggleDescription,
}: {
  strain: Strain;
  color: string;
  showDescription: boolean;
  onToggleDescription: () => void;
}) {
  return (
    <>
      <h3 className="flex items-center gap-2 font-display text-4xl leading-none sm:block sm:text-6xl lg:text-7xl">
        {strain.name}
      </h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 sm:mt-8 lg:justify-start">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full transition-colors duration-500"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-sm tracking-[0.04em] text-neutral-300 sm:text-base">
            {strain.spectrum}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-2.5 lg:justify-start">
        {strain.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-400 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            {tag}
          </span>
        ))}
        <button
          type="button"
          onClick={onToggleDescription}
          aria-expanded={showDescription}
          className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <Info className="h-3.5 w-3.5" />
          {showDescription ? "Less" : "More"}
        </button>
      </div>

      {showDescription && (
        <div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-50 sm:mt-4 sm:text-base lg:max-w-2xl lg:text-lg">
            {strain.description}
          </p>
          {(strain.thc || strain.genetics || strain.terpenes || strain.idealTime) && (
            <dl className="mt-3 flex max-w-md flex-col gap-2 text-sm sm:mt-5 lg:max-w-2xl">
              {strain.thc && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="tracking-[0.06em] text-neutral-500">THC</dt>
                  <dd className="text-neutral-300">{strain.thc}</dd>
                </div>
              )}
              {strain.genetics && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="tracking-[0.06em] text-neutral-500">Genetics</dt>
                  <dd className="text-neutral-300">{strain.genetics}</dd>
                </div>
              )}
              {strain.terpenes && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="tracking-[0.06em] text-neutral-500">Terpenes</dt>
                  <dd className="text-neutral-300">{strain.terpenes.join(", ")}</dd>
                </div>
              )}
              {strain.idealTime && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="tracking-[0.06em] text-neutral-500">Best time</dt>
                  <dd className="text-neutral-300">{strain.idealTime}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </>
  );
}

export function Drops({ strains }: { strains: Strain[] }) {
  const SORTED = useMemo(() => sortBySpectrum(strains), [strains]);
  const [activeSlug, setActiveSlug] = useState(
    () => SORTED[Math.floor(SORTED.length / 2)]?.slug ?? ""
  );
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  // Which carousel card is currently hovered, if any — shown in the
  // control bar between PREV/NEXT so hovering previews a name without
  // needing a tooltip floating over the (often tilted) card itself.
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  // Reserves enough height for the longest strain's content in the current
  // toggle state, so switching strains never resizes the section — only
  // deliberately opening/closing the description does. Measured from
  // invisible copies of every strain rather than hardcoded, so it stays
  // correct as strain copy changes.
  const infoColumnRef = useRef<HTMLDivElement>(null);
  const collapsedMeasureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const expandedMeasureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [collapsedMinH, setCollapsedMinH] = useState<number>();
  const [expandedMinH, setExpandedMinH] = useState<number>();

  const remeasure = () => {
    const collapsedMax = Math.max(
      0,
      ...collapsedMeasureRefs.current.map((el) => el?.getBoundingClientRect().height ?? 0)
    );
    const expandedMax = Math.max(
      0,
      ...expandedMeasureRefs.current.map((el) => el?.getBoundingClientRect().height ?? 0)
    );
    if (collapsedMax > 0) setCollapsedMinH(collapsedMax);
    if (expandedMax > 0) setExpandedMinH(expandedMax);
  };

  useLayoutEffect(() => {
    remeasure();
  }, []);

  useEffect(() => {
    const el = infoColumnRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setHoveredSlug(null);
  }, [activeSlug]);

  const active = strains.find((s) => s.slug === activeSlug) ?? strains[0];
  const activeAnchor = anchorForSpectrum(active.spectrum);
  const color = colorForHybrid(activeAnchor);
  const activeIndex = SORTED.findIndex((s) => s.slug === activeSlug);
  const previewName = hoveredSlug
    ? (strains.find((s) => s.slug === hoveredSlug)?.name ?? active.name)
    : active.name;

  const step = (dir: 1 | -1) => {
    // Loops — past the last strain wraps to the first, and vice versa.
    const next = SORTED[(activeIndex + dir + SORTED.length) % SORTED.length];
    setActiveSlug(next.slug);
  };

  return (
    <section
      id="drops"
      className="relative isolate scroll-mt-20 overflow-hidden bg-neutral-900 py-10 text-neutral-50 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.spectrum}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SpectrumBackdrop spectrum={active.spectrum} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Latest Drops
          </SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <ParallaxText speed={16}>
            <h2 className="mt-4 max-w-[24ch] font-display text-3xl leading-[1.05] tracking-[-0.01em] sm:mt-6 sm:text-4xl lg:text-5xl">
              Every strain sits somewhere on the spectrum. Find it.
            </h2>
          </ParallaxText>
        </Reveal>
      </div>

      {/* Stage */}
      <div className="mx-auto mt-6 max-w-7xl px-5 sm:mt-10 sm:px-8">
        <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-36 xl:gap-48">
          <div className="relative mx-auto aspect-square w-full max-w-[180px] sm:max-w-[280px] lg:max-w-[380px]">
            <div
              className="absolute inset-0 scale-90 rounded-full blur-3xl transition-colors duration-500"
              style={{ backgroundColor: color, opacity: 0.35 }}
              aria-hidden
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full"
              >
                <NugZoom className="h-full w-full">
                  <Image
                    src={active.image}
                    alt={active.name}
                    fill
                    // NugZoom scales this image up 1.5x on hover via a CSS
                    // transform — the fetched source needs headroom above
                    // the resting container size or the zoom just magnifies
                    // a soft, undersized raster.
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 420px, 600px"
                    draggable={false}
                    className="object-contain"
                    priority
                  />
                </NugZoom>
              </motion.div>
            </AnimatePresence>
          </div>

          <div ref={infoColumnRef} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: descriptionOpen ? expandedMinH : collapsedMinH }}
                className="flex flex-col items-center lg:items-start"
              >
                <StrainInfo
                  strain={active}
                  color={color}
                  showDescription={descriptionOpen}
                  onToggleDescription={() => setDescriptionOpen((v) => !v)}
                />
              </motion.div>
            </AnimatePresence>

            {/* Invisible — exists only so ResizeObserver + the layout effect
                above can measure every strain's natural height (collapsed
                and expanded) and lock the stage to the tallest, so switching
                strains never resizes the section. */}
            <div
              aria-hidden
              className="pointer-events-none invisible absolute inset-x-0 top-0 flex flex-col items-center lg:items-start"
            >
              {strains.map((s, i) => (
                <div
                  key={`collapsed-${s.slug}`}
                  ref={(el) => {
                    collapsedMeasureRefs.current[i] = el;
                  }}
                  className="flex flex-col items-center lg:items-start"
                >
                  <StrainInfo strain={s} color={color} showDescription={false} onToggleDescription={() => {}} />
                </div>
              ))}
              {strains.map((s, i) => (
                <div
                  key={`expanded-${s.slug}`}
                  ref={(el) => {
                    expandedMeasureRefs.current[i] = el;
                  }}
                  className="flex flex-col items-center lg:items-start"
                >
                  <StrainInfo strain={s} color={color} showDescription onToggleDescription={() => {}} />
                </div>
              ))}
            </div>

            <div className="mx-auto mt-4 flex w-full max-w-sm items-center justify-between text-sm tracking-[0.06em] text-neutral-400 sm:mt-8 lg:mx-0">
              <span>Indica</span>
              <span>Sativa</span>
            </div>
            {/* Tug of war — indica and sativa each pull their own colour in
                from their end; the knot marks where the rope currently
                sits, rather than one flat fill against a plain track. Now
                the carousel loops, this is the only place left that shows
                where a strain actually sits on the spectrum. */}
            <div className="relative mx-auto mt-2 h-2 w-full max-w-sm sm:mt-3 lg:mx-0">
              <div className="absolute inset-0 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-inset ring-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ backgroundColor: RGB.indica }}
                  animate={{ width: `${activeAnchor}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/15" />
                </motion.div>
                <motion.div
                  className="absolute inset-y-0 right-0 overflow-hidden"
                  style={{ backgroundColor: RGB.sativa }}
                  animate={{ width: `${100 - activeAnchor}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/15" />
                </motion.div>
              </div>
              <motion.div
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neutral-900 transition-colors duration-500"
                style={{ backgroundColor: color, boxShadow: `0 0 2px 0 ${color}` }}
                animate={{ left: `${activeAnchor}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strain carousel — a real 3D coverflow, full-bleed edge to edge.
          The cards float directly over the section backdrop, and every
          card's depth, tilt and fade is purely a function of its distance
          from the active one, so it scales to any strain count without
          ever squishing. */}
      <div className="mt-5 sm:mt-6">
        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) step(1);
              else if (info.offset.x > 50) step(-1);
            }}
            role="listbox"
            aria-orientation="horizontal"
            aria-label="Strains, indica to sativa"
            aria-activedescendant={`strain-option-${active.slug}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") step(-1);
              if (e.key === "ArrowRight") step(1);
            }}
            className="relative h-24 cursor-grab touch-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-50 active:cursor-grabbing sm:h-32"
            style={{ perspective: 1200 }}
          >
            {/* Glow behind the active card only. The carousel frame stays
                transparent so the weed itself carries the focus. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-500 sm:h-36 sm:w-36"
              style={{ backgroundColor: color, opacity: 0.46, zIndex: 1 }}
              aria-hidden
            />

            {SORTED.map((s, i) => {
              const isActive = s.slug === activeSlug;
              const t = coverflowTransform(circularOffset(i, activeIndex, SORTED.length));
              const isHovered = hoveredSlug === s.slug && !isActive && t.opacity > 0.5;
              const hoverColor = colorForHybrid(anchorForSpectrum(s.spectrum));
              return (
                <motion.button
                  key={s.slug}
                  id={`strain-option-${s.slug}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  aria-label={s.name}
                  onClick={() => setActiveSlug(s.slug)}
                  onHoverStart={() => setHoveredSlug(s.slug)}
                  onHoverEnd={() =>
                    setHoveredSlug((current) => (current === s.slug ? null : current))
                  }
                  animate={{
                    x: t.x,
                    y: t.y,
                    z: t.z,
                    rotateY: t.rotateY,
                    scale: t.scale,
                    opacity: t.opacity,
                    zIndex: t.zIndex,
                  }}
                  whileHover={
                    isActive
                      ? undefined
                      : {
                          scale: t.scale * 1.12,
                          opacity: Math.min(1, t.opacity + 0.3),
                          rotateY: 0,
                        }
                  }
                  whileTap={isActive ? undefined : { scale: t.scale * 0.96 }}
                  transition={{
                    default: { type: "spring", stiffness: 260, damping: 28 },
                    opacity: { duration: 0.28, ease: "easeOut" },
                    // zIndex can't visually interpolate — it snaps — so
                    // delay the snap until the cards are most of the way
                    // through their move instead of re-stacking instantly
                    // while several are still mid-flight past each other.
                    zIndex: { delay: 0.15, duration: 0 },
                  }}
                  style={{
                    left: "50%",
                    top: "50%",
                    willChange: "transform",
                  }}
                  className={cn(
                    "absolute cursor-pointer rounded-full",
                    isActive
                      ? "h-[4.5rem] w-[4.5rem] ring-2 ring-neutral-50/35 ring-offset-4 ring-offset-neutral-900 sm:h-[5.5rem] sm:w-[5.5rem]"
                      : "h-16 w-16 sm:h-20 sm:w-20"
                  )}
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[4.75rem] w-[4.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-md sm:h-[5.75rem] sm:w-[5.75rem]"
                    animate={{
                      opacity: isActive ? 1 : isHovered ? 0.64 : 0,
                      scale: isActive ? 1 : isHovered ? 0.64 : 0.48,
                      background: isActive
                        ? `radial-gradient(circle, transparent 30%, ${color} 43%, ${color} 60%, transparent 78%)`
                        : `radial-gradient(circle, transparent 34%, ${hoverColor} 48%, ${hoverColor} 58%, transparent 74%)`,
                    }}
                    transition={{
                      opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                      scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                      background: { duration: 0.35, ease: "easeOut" },
                    }}
                  />
                  <div className="relative z-10 h-full w-full overflow-hidden rounded-full bg-neutral-800">
                    <div className="absolute inset-1.5 overflow-hidden rounded-full">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        // Requested well above the card's actual on-screen
                        // size so the hover scale-up (and the coverflow's
                        // own scale/rotateY transforms) has real pixel
                        // detail to sample from instead of stretching an
                        // exact-fit image and going soft mid-animation.
                        sizes="240px"
                        draggable={false}
                        priority={isActive}
                        className="pointer-events-none object-cover"
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Controls stay transparent so the coverflow reads as floating
              over the section, not sitting inside a glass tray. */}
          <div className="relative z-10 flex items-center justify-between px-5 py-1.5 sm:px-8">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous strain"
              className="flex cursor-pointer items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-neutral-300 transition-colors hover:text-neutral-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              PREV
            </button>

            <AnimatePresence mode="wait">
              <motion.span
                key={previewName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium tracking-[0.04em] text-neutral-50"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
              >
                {previewName}
              </motion.span>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next strain"
              className="flex cursor-pointer items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-neutral-300 transition-colors hover:text-neutral-50"
            >
              NEXT
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] tabular-nums tracking-[0.18em] text-neutral-500">
          {String(activeIndex + 1).padStart(2, "0")} / {String(SORTED.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
