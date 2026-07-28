"use client";

import Image from "next/image";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { SPECTRUM_POSITIONS, STRAINS, type SpectrumPosition } from "@/lib/strains";
import { ParallaxText, Reveal, SectionLabel } from "@/components/scroll-primitives";
import { cn } from "@/lib/utils";

/**
 * Spectrum carousel. Every strain is plotted once on a single indica ->
 * sativa rail (0 = indica, 100 = sativa) instead of living in an arbitrary
 * list order. Drag/click the rail — or the strains on it directly — to
 * scrub between them; the stage above crossfades and the ambient glow
 * shifts color to match where the active strain sits on the spectrum.
 */

const INDICA = [139, 92, 246] as const; // violet
const HYBRID = [255, 141, 61] as const; // flame orange
const SATIVA = [163, 230, 53] as const; // flora lime

function mix(a: readonly number[], b: readonly number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as [
    number,
    number,
    number,
  ];
}

function colorForHybrid(pct: number) {
  const [r, g, b] =
    pct <= 50 ? mix(INDICA, HYBRID, pct / 50) : mix(HYBRID, SATIVA, (pct - 50) / 50);
  return `rgb(${r} ${g} ${b})`;
}

// Rail position is relative, not measured — each spectrum bucket gets an
// evenly-spaced anchor, and strains sharing a bucket pile up at the same spot.
function anchorForSpectrum(position: SpectrumPosition) {
  const index = SPECTRUM_POSITIONS.indexOf(position);
  return ((index + 0.5) / SPECTRUM_POSITIONS.length) * 100;
}

const SORTED = [...STRAINS].sort(
  (a, b) => anchorForSpectrum(a.spectrum) - anchorForSpectrum(b.spectrum)
);
const RAIL_GRADIENT = `linear-gradient(90deg, rgb(${INDICA.join(" ")}), rgb(${HYBRID.join(" ")}), rgb(${SATIVA.join(" ")}))`;

// Icons closer than this (in px) would visually overlap on the rail, so they
// fan into a compact pile instead of sitting exactly on top of each other.
const COLLISION_PX = 40;
const PILE_OFFSET_PX = 5;
const POP_LIFT_PX = 64;

export function Drops() {
  const [activeSlug, setActiveSlug] = useState(
    SORTED[Math.floor(SORTED.length / 2)].slug
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const active = STRAINS.find((s) => s.slug === activeSlug) ?? STRAINS[0];
  const activeAnchor = anchorForSpectrum(active.spectrum);
  const color = colorForHybrid(activeAnchor);
  const activeIndex = SORTED.findIndex((s) => s.slug === activeSlug);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setTrackWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Strains whose rail position would overlap fan into a compact pile —
  // pileIndex 0 sits on the rail, 1 peeks out just above-right of it, etc.
  // Whichever one is active pops out above the whole pile instead.
  const { pileIndexBySlug, inPileBySlug } = useMemo(() => {
    const pileIndexBySlug = new Map<string, number>();
    const clusterIdBySlug = new Map<string, number>();
    let lastPx = -Infinity;
    let pileIndex = 0;
    let clusterId = -1;
    for (const s of SORTED) {
      const px = (anchorForSpectrum(s.spectrum) / 100) * trackWidth;
      const sameCluster = trackWidth > 0 && px - lastPx <= COLLISION_PX;
      pileIndex = sameCluster ? pileIndex + 1 : 0;
      if (!sameCluster) clusterId += 1;
      lastPx = px;
      pileIndexBySlug.set(s.slug, pileIndex);
      clusterIdBySlug.set(s.slug, clusterId);
    }

    const clusterSizes = new Map<number, number>();
    for (const id of clusterIdBySlug.values()) {
      clusterSizes.set(id, (clusterSizes.get(id) ?? 0) + 1);
    }
    const inPileBySlug = new Map<string, boolean>();
    for (const [slug, id] of clusterIdBySlug) {
      inPileBySlug.set(slug, (clusterSizes.get(id) ?? 1) > 1);
    }

    return { pileIndexBySlug, inPileBySlug };
  }, [trackWidth]);

  const scrub = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100)
    );

    let nearest = SORTED[0];
    let best = Infinity;
    for (const s of SORTED) {
      const d = Math.abs(anchorForSpectrum(s.spectrum) - pct);
      if (d < best) {
        best = d;
        nearest = s;
      }
    }
    setActiveSlug(nearest.slug);
  };

  const step = (dir: 1 | -1) => {
    const next = SORTED[Math.min(SORTED.length - 1, Math.max(0, activeIndex + dir))];
    setActiveSlug(next.slug);
  };

  const onTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    scrub(e.clientX);
  };

  const onTrackPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) scrub(e.clientX);
  };

  return (
    <section
      id="drops"
      className="scroll-mt-20 overflow-hidden bg-neutral-900 py-24 text-neutral-50 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Latest Drops
          </SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <ParallaxText speed={16}>
            <h2 className="mt-6 max-w-[24ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
              Every strain sits somewhere on the spectrum. Find it.
            </h2>
          </ParallaxText>
        </Reveal>
      </div>

      {/* Stage */}
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-36 xl:gap-48">
          <div className="relative mx-auto aspect-square w-full max-w-[380px]">
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
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  sizes="(max-width: 1024px) 80vw, 380px"
                  draggable={false}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center lg:items-start"
              >
                <span className="text-sm tracking-[0.08em] text-neutral-400">
                  {active.category}
                </span>
                <h3 className="mt-3 font-display text-6xl leading-none sm:text-7xl">
                  {active.name}
                </h3>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full transition-colors duration-500"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <span className="text-base tracking-[0.04em] text-neutral-300">
                      {active.spectrum}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs tracking-[0.06em] text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDescriptionOpen((v) => !v)}
                    aria-expanded={descriptionOpen}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs tracking-[0.06em] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50"
                  >
                    <Info className="h-3.5 w-3.5" />
                    {descriptionOpen ? "Less" : "More"}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {descriptionOpen && (
                    <motion.div
                      key="description"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400 lg:max-w-2xl lg:text-lg">
                        {active.description}
                      </p>
                      {(active.genetics || active.terpenes || active.idealTime) && (
                        <dl className="mt-5 flex max-w-md flex-col gap-2 text-sm lg:max-w-2xl">
                          {active.genetics && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <dt className="tracking-[0.06em] text-neutral-500">
                                Genetics
                              </dt>
                              <dd className="text-neutral-300">{active.genetics}</dd>
                            </div>
                          )}
                          {active.terpenes && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <dt className="tracking-[0.06em] text-neutral-500">
                                Terpenes
                              </dt>
                              <dd className="text-neutral-300">
                                {active.terpenes.join(", ")}
                              </dd>
                            </div>
                          )}
                          {active.idealTime && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <dt className="tracking-[0.06em] text-neutral-500">
                                Best time
                              </dt>
                              <dd className="text-neutral-300">{active.idealTime}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex w-full max-w-sm items-center justify-between text-sm tracking-[0.06em] text-neutral-400">
              <span>Indica</span>
              <span>Sativa</span>
            </div>
            <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-neutral-700">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                animate={{ width: `${activeAnchor}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spectrum rail */}
      <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
        <div
          ref={trackRef}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          role="slider"
          tabIndex={0}
          aria-label="Indica to sativa spectrum"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={activeAnchor}
          aria-valuetext={`${active.name}, ${active.spectrum}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
          }}
          className="relative h-16 cursor-grab touch-none select-none focus-visible:outline-none active:cursor-grabbing sm:h-20"
        >
          <div
            className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full opacity-50"
            style={{ background: RAIL_GRADIENT }}
            aria-hidden
          />

          <motion.div
            className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-[calc(50%+12px)] rounded-full"
            style={{ backgroundColor: color, x: "-50%" }}
            animate={{ left: `${activeAnchor}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            aria-hidden
          />

          {STRAINS.map((s) => {
            const isActive = s.slug === activeSlug;
            const pileIndex = pileIndexBySlug.get(s.slug) ?? 0;
            const piled = inPileBySlug.get(s.slug) ?? false;
            const anchor = anchorForSpectrum(s.spectrum);
            return (
              <Fragment key={s.slug}>
                {isActive && piled && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-1/2 w-px -translate-x-1/2 bg-neutral-700/60"
                    style={{ left: `${anchor}%`, height: `${POP_LIFT_PX}px` }}
                  />
                )}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setActiveSlug(s.slug)}
                  style={{
                    left: `${anchor}%`,
                    zIndex: isActive ? 30 : 10 + pileIndex,
                    transform: isActive
                      ? `translate(-50%, calc(-50% - ${POP_LIFT_PX}px))`
                      : `translate(calc(-50% + ${pileIndex * PILE_OFFSET_PX}px), calc(-50% - ${pileIndex * PILE_OFFSET_PX}px))`,
                    ...(isActive
                      ? ({ "--tw-ring-color": color } as Record<string, string>)
                      : {}),
                  }}
                  className={cn(
                    "absolute top-1/2 overflow-hidden rounded-full bg-neutral-800 transition-all duration-300",
                    isActive
                      ? "h-14 w-14 ring-2 ring-offset-4 ring-offset-neutral-900 sm:h-16 sm:w-16"
                      : "h-8 w-8 opacity-45 hover:opacity-75 sm:h-9 sm:w-9"
                  )}
                  aria-label={s.name}
                  aria-pressed={isActive}
                >
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="64px"
                    draggable={false}
                    priority={isActive}
                    className="pointer-events-none object-cover"
                  />
                </button>
              </Fragment>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between text-xs tracking-[0.08em] text-neutral-500">
          <span>INDICA</span>
          <span>HYBRID</span>
          <span>SATIVA</span>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={activeIndex === 0}
            aria-label="Previous strain"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50 disabled:opacity-30 disabled:hover:border-neutral-700 disabled:hover:text-neutral-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={activeIndex === SORTED.length - 1}
            aria-label="Next strain"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50 disabled:opacity-30 disabled:hover:border-neutral-700 disabled:hover:text-neutral-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
