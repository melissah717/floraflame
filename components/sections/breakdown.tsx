"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react"
import {
  Brain,
  Citrus,
  Cloud,
  Cookie,
  Droplet,
  Feather,
  Flame,
  Flower2,
  Leaf,
  Shield,
  Snowflake,
  TreePine,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { RGB } from "@/lib/spectrum"
import { cn } from "@/lib/utils"

/**
 * "Know What You're Smoking" — one continuous scrollytelling infographic,
 * built on the same technique as living-soil.tsx: a headline that assembles
 * letter by letter, a lead that assembles word by word, then a sequence of
 * rows that reveal and drift at their own depth as a single scroll tracker
 * advances. Content is fixed/educational, not per-batch data.
 *
 * Three chapters, each its own "flash sheet" catalog page, each with a
 * bespoke visual centerpiece:
 *   1. Cannabinoids & Terpenes — a terpene wheel (proportioned donut)
 *   2. Plant Anatomy           — a bud diagram with leader lines
 *   3. How You Take It         — onset/duration comparison bars
 *
 * On top of the scroll-linked reveal, every row and its corresponding piece
 * of the visual (wheel segment, leader line, bar) are wired to one shared
 * hover/tap state PER CHAPTER — hovering or tapping either half highlights
 * both and dims the rest, so the section is something you explore rather
 * than something that only plays at you.
 */

const HEADLINE = "Know what you're smoking"

const LEAD_EMPHASIS = "A strain is more than its THC percentage."
const LEAD =
  "Cannabinoids and terpenes shape the effect, the plant's own anatomy is where they're made, and how you consume it changes all of it again."

/** Inserts an alpha channel into a legacy-space rgb() string, e.g.
 * "rgb(139 92 246)" -> "rgb(139 92 246 / 0.15)". */
function withAlpha(rgb: string, alpha: number) {
  return rgb.replace(/\)$/, ` / ${alpha})`)
}

/** True below the `lg` breakpoint — same 1024px cutoff GraphicColumn uses
 * to switch between its stacked-mobile and sticky-desktop layouts. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)")
    setIsMobile(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isMobile
}

type Item = {
  n: string
  title: string
  body: string
  icon: LucideIcon
  accent?: string
  /** Terpene wheel share, chapter 1 only — shares among wheel items sum to 100. */
  pct?: number
  /** Onset/duration comparison bars, chapter 3 only. */
  stat?: {
    onset: { pct: number; label: string }
    duration: { pct: number; label: string }
  }
}
type Chapter = { title: string; accent: string; items: Item[] }

const CHAPTERS: Chapter[] = [
  {
    title: "Cannabinoids & Terpenes",
    accent: RGB.indica,
    items: [
      {
        n: "01",
        title: "THC",
        body: "Binds CB1 receptors in the brain. Psychoactive, the reason for the high.",
        icon: Brain,
      },
      {
        n: "02",
        title: "CBD",
        body: "Non-intoxicating counterweight. Present in smaller amounts, but shapes how the THC actually feels.",
        icon: Shield,
      },
      {
        n: "03",
        title: "Myrcene",
        body: "Musky, earthy, and lightly fruity. One of the most common cannabis terpenes, often associated with heavier aromatic profiles.",
        icon: Leaf,
        accent: RGB.slate,
        pct: 35,
      },
      {
        n: "04",
        title: "Caryophyllene",
        body: "Spicy, woody, and peppery. Notable because beta-caryophyllene is studied for interacting with the CB2 receptor.",
        icon: Zap,
        accent: RGB.red,
        pct: 25,
      },
      {
        n: "05",
        title: "Limonene",
        body: "Citrus-forward, lemon-orange aroma with a sweeter flavor impression. Common in brighter, fruitier cultivars.",
        icon: Citrus,
        accent: RGB.hybrid,
        pct: 22,
      },
      {
        n: "06",
        title: "Pinene",
        body: "Piney and resinous with a sharp, woody edge. One of the better-known conifer-like terpenes in cannabis.",
        icon: TreePine,
        accent: RGB.sativa,
        pct: 18,
      },
      {
        n: "07",
        title: "Linalool",
        body: "Floral and lavender-like with a lightly spicy finish. Commonly discussed in calmer, more aromatic terpene mixes.",
        icon: Flower2,
        accent: RGB.indica,
      },
      {
        n: "08",
        title: "Humulene",
        body: "Earthy, woody, and slightly hoppy-bitter. A sesquiterpene also found in hops and under study for anti-inflammatory potential.",
        icon: Leaf,
        accent: RGB.slate,
      },
      {
        n: "09",
        title: "Terpinolene",
        body: "Floral, herbal, and citrusy with a mildly bitter edge. Less common in cannabis than the big headliners.",
        icon: Cloud,
        accent: RGB.indica,
      },
      {
        n: "10",
        title: "Ocimene",
        body: "Sweet, herbal, and slightly fruity-woody. Part of the brighter green side of cannabis aroma chemistry.",
        icon: Feather,
        accent: RGB.hybrid,
      },
      {
        n: "11",
        title: "Bisabolol",
        body: "Sweet and floral with a soft, mildly bitter flavor impression. Also known from chamomile-like aromatics.",
        icon: Droplet,
        accent: RGB.indica,
      },
      {
        n: "12",
        title: "Nerolidol",
        body: "Woody and citrusy with a subtle bitter finish. Being explored in the literature for antimicrobial and antiparasitic potential.",
        icon: TreePine,
        accent: RGB.slate,
      },
    ],
  },
  {
    title: "Plant Anatomy",
    accent: RGB.hybrid,
    items: [
      {
        n: "01",
        title: "Trichome",
        body: "The frosty crystals coating the bud. This is where the cannabinoids and terpenes actually live.",
        icon: Snowflake,
      },
      {
        n: "02",
        title: "Calyx",
        body: "The teardrop-shaped pod the trichomes grow on. What you're really looking at under the frost.",
        icon: Droplet,
      },
      {
        n: "03",
        title: "Pistil",
        body: "The wispy hairs. White when young, darkening as the plant matures.",
        icon: Feather,
      },
      {
        n: "04",
        title: "Cola",
        body: "The main flowering cluster at the top of the branch. Usually the densest bud on the plant.",
        icon: Flower2,
      },
    ],
  },
  {
    title: "How You Take It",
    accent: RGB.sativa,
    items: [
      {
        n: "01",
        title: "Smoking",
        body: "Fastest onset, shortest duration. Effects in minutes, gone in a couple hours.",
        icon: Flame,
        stat: {
          onset: { pct: 8, label: "Seconds to minutes" },
          duration: { pct: 20, label: "1–3 hours" },
        },
      },
      {
        n: "02",
        title: "Vaping",
        body: "Similar speed to smoking, gentler on the lungs. Heat, not combustion.",
        icon: Cloud,
        stat: {
          onset: { pct: 10, label: "Minutes" },
          duration: { pct: 22, label: "1–3 hours" },
        },
      },
      {
        n: "03",
        title: "Edibles",
        body: "Slowest onset, longest duration. Processed through the liver into a stronger compound.",
        icon: Cookie,
        stat: {
          onset: { pct: 75, label: "30–90 minutes" },
          duration: { pct: 95, label: "4–8 hours" },
        },
      },
    ],
  },
]

/** Flat list driving the shared scroll progress — chapter markers and their
 * items share one sequence, so the whole section reads as a single
 * continuous scroll rather than three separately-triggered blocks. */
type Beat =
  | { kind: "chapter"; chapterIndex: number; title: string; accent: string }
  | {
      kind: "item"
      chapterIndex: number
      item: Item
      accent: string
      indexInChapter: number
    }

const BEATS: Beat[] = CHAPTERS.flatMap((chapter, chapterIndex) => [
  {
    kind: "chapter" as const,
    chapterIndex,
    title: chapter.title,
    accent: chapter.accent,
  },
  ...chapter.items.map((item, indexInChapter) => ({
    kind: "item" as const,
    chapterIndex,
    item,
    accent: item.accent ?? chapter.accent,
    indexInChapter,
  })),
])

// Windows are tuned so the last one ends comfortably before progress caps at
// 1 — see about.tsx's note on this same failure mode.
const BEATS_BASE = 0.0
const BEATS_RANGE = 0.82
const BEATS_WINDOW = 0.16

function beatWindow(index: number) {
  const start = BEATS_BASE + (index / BEATS.length) * BEATS_RANGE
  return { start, end: start + BEATS_WINDOW }
}

type Span = { start: number; end: number }

function holdWindow(
  start: number,
  end: number,
  inPortion = 0.35,
  outPortion = 0.3
): number[] {
  const length = end - start
  const inEnd = start + length * inPortion
  const outStart = Math.max(inEnd, end - length * outPortion)
  return [start, inEnd, outStart, end]
}

/** Each chapter's full on-screen span — from its own marker to its last
 * row — so a chapter's visual centerpiece can be driven by the same
 * progress its rows use, rather than a separate trigger. */
const CHAPTER_SPANS: Span[] = CHAPTERS.map((_, chapterIndex) => {
  const markerIndex = BEATS.findIndex(
    (b) => b.kind === "chapter" && b.chapterIndex === chapterIndex
  )
  let lastItemIndex = markerIndex
  BEATS.forEach((b, i) => {
    if (b.kind === "item" && b.chapterIndex === chapterIndex) lastItemIndex = i
  })
  return {
    start: beatWindow(markerIndex).start,
    end: beatWindow(lastItemIndex).end,
  }
})

/** Each chapter's items paired with their own actual on-screen window, so a
 * centerpiece visual (wheel arc, leader line, bar) can be perfectly synced
 * to the row it corresponds to below it.
 *
 * Chapter 3 ("How You Take It") is the exception — Smoking/Vaping/Edibles
 * all share item 0's window instead of each getting their own, so they
 * spawn together on the first trigger rather than staggering in one at a
 * time as you keep scrolling. */
const CHAPTER_ITEM_WINDOWS: Span[][] = CHAPTERS.map((chapter, chapterIndex) => {
  const unifyTrigger = chapterIndex === 2
  const firstBeatIndex = BEATS.findIndex(
    (b) =>
      b.kind === "item" &&
      b.chapterIndex === chapterIndex &&
      b.indexInChapter === 0
  )
  const sharedWindow = unifyTrigger ? beatWindow(firstBeatIndex) : null

  return chapter.items.map((_, indexInChapter) => {
    if (sharedWindow) return sharedWindow
    const beatIndex = BEATS.findIndex(
      (b) =>
        b.kind === "item" &&
        b.chapterIndex === chapterIndex &&
        b.indexInChapter === indexInChapter
    )
    return beatWindow(beatIndex)
  })
})

/** Shared side padding — matches living-soil.tsx's full-bleed columns. */
const GUTTER = "px-5 sm:px-8 lg:px-14"

type ActiveKey = { chapter: number; index: number } | null

export function Breakdown() {
  const headRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const isMobile = useIsMobile()

  // Hover previews on desktop; a tap "pins" the same state for touch —
  // whichever is set wins, so hovering never fights a tap.
  const [hovered, setHovered] = useState<ActiveKey>(null)
  const [pinned, setPinned] = useState<ActiveKey>(null)
  const active = hovered ?? pinned

  const { scrollYProgress: headProgress } = useScroll({
    target: headRef,
    offset: ["start start", "end start"],
  })

  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start 100%", "end start"],
  })

  const titleY = useTransform(
    headProgress,
    [0, 0.52, 0.82, 1],
    ["0%", "0%", "-18%", "-18%"]
  )
  const titleOpacity = useTransform(
    headProgress,
    [0, 0.52, 0.82, 1],
    [1, 1, 0.32, 0.32]
  )
  const titleBlur = useTransform(
    headProgress,
    [0, 0.52, 0.82, 1],
    ["blur(0px)", "blur(0px)", "blur(10px)", "blur(10px)"]
  )
  const smokeY = useTransform(headProgress, [0, 0.5, 1], ["0%", "-14%", "-42%"])
  const smokeX = useTransform(headProgress, [0, 0.5, 1], ["0%", "2%", "6%"])
  const smokeScale = useTransform(headProgress, [0, 0.5, 1], [1, 1.1, 1.28])
  // Peaks much higher (was 0.22, further diluted by the /70 text color) and
  // holds there instead of spiking and dropping in one breath, so it reads
  // as smoke actually drifting off rather than a flicker.
  const smokeOpacity = useTransform(
    headProgress,
    [0, 0.35, 0.65, 1],
    [0, 0.85, 0.7, 0]
  )
  const smokeBlur = useTransform(
    headProgress,
    [0, 0.5, 1],
    ["blur(0px)", "blur(8px)", "blur(18px)"]
  )

  const bodyGlowLeftY = useTransform(
    bodyProgress,
    [0, 0.72, 1],
    ["-4%", "10%", "10%"]
  )
  const bodyGlowRightY = useTransform(
    bodyProgress,
    [0, 0.72, 1],
    ["10%", "-6%", "-6%"]
  )
  const bodyGridOpacity = useTransform(
    bodyProgress,
    [0, 0.2, 0.6, 1],
    [0, 0.3, 0.22, 0]
  )

  return (
    <section id="breakdown" className="relative scroll-mt-20 bg-neutral-900">
      {/* ---------- HEAD ---------- */}
      <div
        ref={headRef}
        className={`relative overflow-hidden bg-neutral-900 pt-28 pb-8 text-neutral-50 sm:pt-48 sm:pb-10 ${GUTTER}`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-16 -left-20 h-56 w-56 rounded-full blur-3xl sm:h-72 sm:w-72">
            <div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: RGB.indica, opacity: 0.18 }}
            />
          </div>
          <div className="absolute top-4 right-[-6rem] h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80">
            <div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: RGB.hybrid, opacity: 0.16 }}
            />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 0%, ${withAlpha(RGB.indica, 0.55)} 20%, ${withAlpha(RGB.hybrid, 0.75)} 50%, ${withAlpha(RGB.sativa, 0.55)} 80%, transparent 100%)`,
            }}
          />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative order-2 pb-3 lg:order-1 lg:w-72 lg:shrink-0">
            <div className="flex items-center gap-3 text-xs tracking-[0.08em] text-neutral-300">
              <span className="tabular-nums">—</span>
              <span className="h-px w-8 bg-neutral-700" />
              <span>The Breakdown</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-[11px] tracking-[0.14em] text-neutral-300 backdrop-blur-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: RGB.indica }}
              />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: RGB.hybrid }}
              />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: RGB.sativa }}
              />
              <span>Effects decoded</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-neutral-200">
              Terpenes, trichomes, how you actually take it. Poke around
              below and watch how it all clicks together.
            </p>
          </div>

          <motion.h2
            className={[
              "relative order-1 font-display leading-[0.86] tracking-[-0.04em] text-neutral-50 uppercase lg:order-2",
              // min-w-0 so this can actually shrink inside the flex row —
              // without it the longest word ("SMOKING") forces the column
              // wider than the viewport and the tail clips off the right.
              "min-w-0 lg:flex-1",
              "text-[clamp(2rem,5.4vw,6rem)]",
            ].join(" ")}
            style={
              reduce
                ? { marginBottom: "-0.02em" }
                : {
                    marginBottom: "-0.02em",
                    y: titleY,
                    opacity: titleOpacity,
                    filter: titleBlur,
                  }
            }
          >
            <motion.span
              aria-hidden
              style={
                reduce
                  ? { opacity: 0 }
                  : {
                      x: smokeX,
                      y: smokeY,
                      scale: smokeScale,
                      opacity: smokeOpacity,
                      filter: smokeBlur,
                    }
              }
              className="pointer-events-none absolute inset-0 text-neutral-50"
            >
              {HEADLINE.split(" ").map((word) => (
                <span
                  key={`${word}-smoke`}
                  className="inline-block whitespace-nowrap"
                >
                  {word}
                  <span className="inline-block w-[0.24em]" />
                </span>
              ))}
            </motion.span>
            {HEADLINE.split(" ").map((word) => (
              <span key={word} className="inline-block whitespace-nowrap">
                {word}
                <span className="inline-block w-[0.24em]" />
              </span>
            ))}
          </motion.h2>
        </div>
      </div>

      {/* ---------- BODY ---------- */}
      <div
        ref={bodyRef}
        className={`relative bg-neutral-900 py-40 text-neutral-50 sm:py-56 ${GUTTER}`}
      >
        {/* overflow-hidden lives HERE, not on bodyRef — bodyRef is the
            sticky-positioned graphic's scrolling ancestor, and clipping it
            (even on one axis) forces the other axis to `auto` per the CSS
            overflow spec, turning bodyRef into its own scroll container.
            Since bodyRef itself never actually scrolls (the page does),
            that silently breaks position:sticky inside it — the graphic
            just sits still instead of pinning. Scoping the clip to this
            decorative layer (a sibling of the chapter content, not an
            ancestor) keeps the bleeding blur circles contained without
            standing between the sticky graphic and the real viewport. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.div
            style={
              reduce
                ? undefined
                : { y: bodyGlowLeftY, opacity: bodyGridOpacity }
            }
            className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full blur-3xl sm:h-[26rem] sm:w-[26rem]"
          >
            <div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: RGB.indica, opacity: 0.14 }}
            />
          </motion.div>
          <motion.div
            style={
              reduce
                ? undefined
                : { y: bodyGlowRightY, opacity: bodyGridOpacity }
            }
            className="absolute top-[38rem] right-[-10rem] h-80 w-80 rounded-full blur-3xl sm:h-[30rem] sm:w-[30rem]"
          >
            <div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: RGB.sativa, opacity: 0.14 }}
            />
          </motion.div>
        </div>
        {/* Lead — plain static text, no scroll-triggered reveal. */}
        <p className="relative max-w-4xl font-display text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.02] tracking-[-0.03em] text-neutral-50">
          {LEAD_EMPHASIS}
        </p>
        <p className="relative mt-5 max-w-5xl text-xl leading-[1.38] text-neutral-200 sm:text-2xl lg:text-[2rem]">
          {LEAD}
        </p>

        {/* Chapters — one continuous sequence of chapter marks, a visual
            centerpiece per chapter, and rows — all keyed to slices of the
            same bodyProgress, and all wired to one hover/tap state per
            chapter so the visual and its rows highlight together. */}
        <div className="relative mt-28 sm:mt-36">
          {CHAPTERS.map((chapter, chapterIndex) => {
            const markerBeatIndex = BEATS.findIndex(
              (b) => b.kind === "chapter" && b.chapterIndex === chapterIndex
            )
            const { start, end } = beatWindow(markerBeatIndex)
            const span = CHAPTER_SPANS[chapterIndex]
            const chapterMarkStart = Math.max(0, start - 0.07)
            const chapterMarkEnd = Math.min(1, start + (span.end - start) * 0.3)
            const spanLead = chapterIndex === 0 ? 0.1 : 0.06
            const visualSpan = {
              start: Math.max(0, span.start - spanLead),
              end: span.end,
            }
            const itemWindows = CHAPTER_ITEM_WINDOWS[chapterIndex]
            const rowLead = chapterIndex === 0 ? 0.09 : 0.045
            const activeIndex =
              active && active.chapter === chapterIndex ? active.index : null
            const onHover = (index: number) =>
              setHovered({ chapter: chapterIndex, index })
            const onLeave = () => setHovered(null)
            const onSelect = (index: number) =>
              setPinned((prev) =>
                prev && prev.chapter === chapterIndex && prev.index === index
                  ? null
                  : { chapter: chapterIndex, index }
              )
            const visual =
              chapterIndex === 0 ? (
                <TerpeneStackVisual
                  items={chapter.items}
                  windows={itemWindows}
                  span={visualSpan}
                  progress={bodyProgress}
                  disabled={!!reduce}
                  activeIndex={activeIndex}
                  onHover={onHover}
                  onLeave={onLeave}
                  onSelect={onSelect}
                />
              ) : chapterIndex === 1 ? (
                <AnatomyVisual
                  items={chapter.items}
                  windows={itemWindows}
                  accent={chapter.accent}
                  span={visualSpan}
                  progress={bodyProgress}
                  disabled={!!reduce}
                  activeIndex={activeIndex}
                  onHover={onHover}
                  onLeave={onLeave}
                  onSelect={onSelect}
                />
              ) : (
                <ConsumptionVisual
                  items={chapter.items}
                  windows={itemWindows}
                  accent={chapter.accent}
                  span={visualSpan}
                  progress={bodyProgress}
                  disabled={!!reduce}
                  activeIndex={activeIndex}
                  onHover={onHover}
                  onLeave={onLeave}
                  onSelect={onSelect}
                />
              )

            return (
              <ChapterFrame
                key={chapter.title}
                accent={chapter.accent}
                isFirst={chapterIndex === 0}
                isExtended={chapterIndex > 0}
                isFirstTall={chapterIndex === 0}
                isExtraTall={chapterIndex === 1}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent 0%, ${withAlpha(chapter.accent, 0.7)} 18%, ${withAlpha(chapter.accent, 0.18)} 82%, transparent 100%)`,
                  }}
                />
                <ChapterAura
                  accent={chapter.accent}
                  span={span}
                  progress={bodyProgress}
                  disabled={!!reduce}
                />
                <ChapterMark
                  number={chapterIndex + 1}
                  title={chapter.title}
                  accent={chapter.accent}
                  start={chapterMarkStart}
                  end={chapterMarkEnd}
                  progress={bodyProgress}
                  disabled={!!reduce}
                  isMobile={isMobile}
                />
                <ChapterSideLabel
                  title={chapter.title}
                  accent={chapter.accent}
                  start={chapterMarkStart}
                  end={chapterMarkEnd}
                  span={span}
                  progress={bodyProgress}
                  disabled={!!reduce}
                />

                <div
                  className={cn(
                    "mt-7 grid gap-7 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-10",
                    chapterIndex === 0 && "lg:min-h-[64rem]",
                    chapterIndex > 0 &&
                      (chapterIndex === 1
                        ? "lg:min-h-[120rem]"
                        : "lg:min-h-[72rem]")
                  )}
                >
                  <GraphicColumn
                    isExtended={chapterIndex > 0}
                    isFirstTall={chapterIndex === 0}
                    isExtraTall={chapterIndex === 1}
                  >
                    {visual}
                  </GraphicColumn>
                  <DescriptionColumn
                    isSticky={chapterIndex > 0}
                    isExtraTall={chapterIndex === 1}
                  >
                    {chapter.items.map((item, indexInChapter) => (
                      <ItemRow
                        key={item.title}
                        item={item}
                        accent={item.accent ?? chapter.accent}
                        isFirstInChapter={indexInChapter === 0}
                        start={Math.max(
                          0,
                          itemWindows[indexInChapter].start - rowLead
                        )}
                        end={itemWindows[indexInChapter].end}
                        progress={bodyProgress}
                        disabled={!!reduce}
                        isActive={activeIndex === indexInChapter}
                        isDimmed={
                          activeIndex !== null && activeIndex !== indexInChapter
                        }
                        onHover={() => onHover(indexInChapter)}
                        onLeave={onLeave}
                        onSelect={() => onSelect(indexInChapter)}
                      />
                    ))}
                  </DescriptionColumn>
                </div>
              </ChapterFrame>
            )
          })}
        </div>

        <ClosingLine progress={bodyProgress} disabled={!!reduce} />
      </div>
    </section>
  )
}

/** Closes out the same continuous scroll — the last beat lands around
 * progress 0.94, so this picks up right after and rides the tail end of
 * bodyProgress rather than sitting there with no motion of its own. */
function ClosingLine({
  progress,
  disabled,
}: {
  progress: MotionValue<number>
  disabled: boolean
}) {
  const y = useTransform(progress, [0.78, 0.84, 0.95, 1], [40, 0, 0, -28])
  const opacity = useTransform(progress, [0.78, 0.84, 0.95, 1], [0, 1, 1, 0.85])

  return (
    <motion.p
      style={disabled ? undefined : { y, opacity }}
      className="relative mt-32 max-w-4xl font-display text-3xl leading-[1.1] sm:mt-44 sm:text-5xl"
    >
      None of it works alone. It&apos;s the combination that decides how a
      strain actually feels.
    </motion.p>
  )
}

function ChapterFrame({
  accent,
  isFirst,
  isExtended,
  isFirstTall,
  isExtraTall,
  children,
}: {
  accent: string
  isFirst: boolean
  isExtended: boolean
  isFirstTall: boolean
  isExtraTall: boolean
  children: ReactNode
}) {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(135deg, ${withAlpha(accent, 0.14)} 0%, ${withAlpha(accent, 0.04)} 22%, ${withAlpha(accent, 0)} 56%)`,
      }}
      className={cn(
        "relative overflow-visible rounded-[1.5rem] border border-neutral-800/80 px-4 py-10 shadow-[0_0_0_1px_rgb(250_248_244_/_0.02)] sm:px-6 sm:py-12",
        isFirstTall && "lg:min-h-[68rem] lg:py-16",
        isExtended &&
          (isExtraTall
            ? "lg:min-h-[128rem] lg:py-16"
            : "lg:min-h-[78rem] lg:py-14"),
        isFirst ? "mt-0" : "mt-20 sm:mt-24"
      )}
    >
      {children}
    </div>
  )
}

function GraphicColumn({
  children,
  isExtended,
  isFirstTall,
  isExtraTall,
}: {
  children: ReactNode
  isExtended: boolean
  isFirstTall: boolean
  isExtraTall: boolean
}) {
  return (
    <div
      className={cn(
        "relative min-h-64 sm:min-h-72 lg:h-full",
        isExtended
          ? isExtraTall
            ? "lg:min-h-[104rem]"
            : "lg:min-h-[60rem]"
          : isFirstTall
            ? "lg:min-h-[52rem]"
            : "lg:min-h-[32rem]"
      )}
    >
      <div className="lg:hidden">{children}</div>
      <div
        className={cn(
          "hidden lg:sticky lg:top-24 lg:flex",
          isExtraTall ? "lg:items-stretch" : "lg:items-center",
          isExtended
            ? isExtraTall
              ? "lg:h-[calc(100vh-1rem)]"
              : "lg:h-[calc(100vh-2rem)]"
            : "lg:h-[calc(100vh-6rem)]"
        )}
      >
        <div className={cn("w-full", isExtraTall && "lg:h-full")}>{children}</div>
      </div>
    </div>
  )
}

function DescriptionColumn({
  children,
  isSticky,
  isExtraTall,
}: {
  children: ReactNode
  isSticky: boolean
  isExtraTall: boolean
}) {
  return (
    <div
      className={cn(
        "relative",
        isSticky && (isExtraTall ? "lg:min-h-[104rem]" : "lg:min-h-[60rem]")
      )}
    >
      <div
        className={cn(
          isSticky &&
            (isExtraTall
              ? "lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100vh-1rem)] lg:items-center"
              : "lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100vh-2rem)] lg:items-center")
        )}
      >
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}

function ChapterAura({
  accent,
  span,
  progress,
  disabled,
}: {
  accent: string
  span: Span
  progress: MotionValue<number>
  disabled: boolean
}) {
  const input = holdWindow(span.start, span.end, 0.12, 0.12)
  const y = useTransform(progress, input, [-12, 0, 0, 18])
  const x = useTransform(progress, input, ["-3%", "0%", "0%", "4%"])
  const opacity = useTransform(progress, input, [0, 1, 1, 0.18])

  return (
    <motion.div
      aria-hidden
      style={disabled ? undefined : { x, y, opacity }}
      className="pointer-events-none absolute top-10 right-[-8%] h-36 w-36 rounded-full blur-3xl sm:h-48 sm:w-48"
    >
      <div
        className="h-full w-full rounded-full"
        style={{ backgroundColor: accent, opacity: 0.12 }}
      />
    </motion.div>
  )
}

function ChapterSideLabel({
  title,
  accent,
  start,
  end,
  span,
  progress,
  disabled,
}: {
  title: string
  accent: string
  start: number
  end: number
  span: Span
  progress: MotionValue<number>
  disabled: boolean
}) {
  const handoffStart = end - (end - start) * 0.18
  const handoffSettle = Math.min(
    span.start + (span.end - span.start) * 0.2,
    end + (span.end - end) * 0.18
  )
  const handoffEnd = span.end - (span.end - span.start) * 0.08
  const opacity = useTransform(
    progress,
    [handoffStart, handoffSettle, handoffEnd, span.end],
    [0, 0.72, 0.72, 0]
  )
  const x = useTransform(
    progress,
    [handoffStart, handoffSettle, handoffEnd, span.end],
    ["18px", "0px", "0px", "10px"]
  )
  const blur = useTransform(
    progress,
    [handoffStart, handoffSettle, handoffEnd, span.end],
    ["blur(10px)", "blur(0px)", "blur(0px)", "blur(6px)"]
  )

  return (
    <div className="pointer-events-none absolute top-28 bottom-8 left-[-3.75rem] hidden lg:block">
      <div className="sticky top-28 flex h-[calc(100vh-8rem)] items-center justify-start">
        {disabled ? (
          <div className="pl-1 text-[12px] tracking-[0.16em] text-neutral-500 uppercase [text-orientation:upright] [writing-mode:vertical-rl]">
            <span style={{ color: accent }}>{title.replaceAll(" ", "  ")}</span>
          </div>
        ) : (
          <motion.div
            style={{ opacity, x, filter: blur }}
            className="pl-1 text-[12px] tracking-[0.16em] text-neutral-500 uppercase [text-orientation:upright] [writing-mode:vertical-rl]"
          >
            <span style={{ color: accent }}>{title.replaceAll(" ", "  ")}</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TerpeneStackVisual({
  items,
  windows,
  span: _span,
  progress: _progress,
  disabled: _disabled,
}: {
  items: Item[]
  windows: Span[]
  span: Span
  progress: MotionValue<number>
  disabled: boolean
} & VisualInteraction) {
  type Terpene = { item: Item & { pct: number }; window: Span; index: number }
  const terpenes = items
    .map((item, index) => ({ item, window: windows[index], index }))
    .filter((t): t is Terpene => t.item.pct != null)
  const popularTerpenes = [
    "Terpinolene",
    "Linalool",
    "Humulene",
    "Ocimene",
    "Bisabolol",
    "Nerolidol",
  ]

  return (
    <div className="relative mx-auto w-full max-w-[24rem] sm:max-w-[26rem]">
      <div className="relative h-[18rem] sm:h-[19.5rem]">
        <div
          aria-hidden
          className="absolute inset-x-10 top-10 bottom-8 rounded-[2rem] blur-3xl"
        >
          <div
            className="h-full w-full rounded-[2rem]"
            style={{
              background: `linear-gradient(135deg, ${withAlpha(RGB.indica, 0.22)} 0%, ${withAlpha(
                RGB.hybrid,
                0.2
              )} 48%, ${withAlpha(RGB.sativa, 0.18)} 100%)`,
            }}
          />
        </div>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#0d0d0f] px-4 py-4 shadow-[0_20px_50px_rgb(0_0_0_/_0.28)] sm:px-5 sm:py-5">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 0%, ${withAlpha(
                RGB.indica,
                0.75
              )} 16%, ${withAlpha(RGB.hybrid, 0.75)} 54%, ${withAlpha(RGB.sativa, 0.75)} 100%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(250 248 244 / 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgb(250 248 244 / 0.035) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="flex items-center justify-between text-[9px] tracking-[0.28em] text-neutral-500 uppercase">
            <span>Effects</span>
            <span>Decode</span>
          </div>
          <div
            className="pointer-events-none absolute inset-x-4 top-[3.25rem] h-px sm:inset-x-5"
            style={{
              backgroundImage: `linear-gradient(90deg, ${withAlpha(RGB.indica, 0.55)} 0%, ${withAlpha(
                RGB.hybrid,
                0.45
              )} 52%, ${withAlpha(RGB.sativa, 0.55)} 100%)`,
            }}
          />
          <div className="relative mt-7 grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[1.15rem] bg-white/[0.04] px-3 py-3">
                <span className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase">
                  Cannabinoids
                </span>
                <span className="mt-1.5 block font-display text-[1.15rem] leading-none text-neutral-50">
                  Set intensity
                </span>
                <span className="mt-1.5 block text-[12px] leading-relaxed text-neutral-300">
                  THC and CBD shape the weight of the high.
                </span>
              </div>
              <div className="rounded-[1.15rem] bg-white/[0.04] px-3 py-3">
                <span className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase">
                  Terpenes
                </span>
                <span className="mt-1.5 block font-display text-[1.15rem] leading-none text-neutral-50">
                  Set character
                </span>
                <span className="mt-1.5 block text-[12px] leading-relaxed text-neutral-300">
                  Aroma compounds steer mood, body feel, and clarity.
                </span>
              </div>
            </div>
            <div className="rounded-[1.15rem] bg-white/[0.03] px-3 py-3">
              <span className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase">
                Common notes
              </span>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {terpenes.map((terpene) => (
                  <div
                    key={terpene.item.title}
                    className="flex items-center gap-2 rounded-full bg-white/[0.035] px-2.5 py-2 text-left"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: terpene.item.accent ?? RGB.hybrid,
                      }}
                    />
                    <span className="truncate text-[12px] tracking-[0.12em] text-neutral-200 uppercase">
                      {terpene.item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none mt-3 min-h-[6rem] sm:mt-4">
        <div className="flex min-h-[6rem] w-[14rem] flex-col justify-between rounded-[1.25rem] bg-[#0d0d0f] px-3.5 py-3 shadow-[0_10px_28px_rgb(0_0_0_/_0.22)]">
          <span className="block text-[10px] tracking-[0.22em] text-neutral-500">
            OTHER POPULAR TERPENES
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {popularTerpenes.map((terpene) => (
              <span
                key={terpene}
                className="rounded-full bg-white/[0.04] px-2 py-1 text-[11px] tracking-[0.12em] text-neutral-300 uppercase"
              >
                {terpene}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Chapter divider — a small numbered eyebrow (matching the site's own
 * SectionLabel pattern) with the actual chapter title stamped in below it:
 * a quick scale+rotate snap rather than a gentle slide, so it reads as a
 * stamp hitting flash paper. The rule under it is tinted to the chapter's
 * spectrum color, so each chapter reads as its own "page."
 */
function ChapterMark({
  number,
  title,
  accent,
  start,
  end,
  progress,
  disabled,
  isMobile,
}: {
  number: number
  title: string
  accent: string
  start: number
  end: number
  progress: MotionValue<number>
  disabled: boolean
  isMobile: boolean
}) {
  // Chapter 2 ("Plant Anatomy") has a much taller physical scroll budget
  // than the others (see GraphicColumn's isExtraTall min-height), so the
  // same fraction-of-window used for chapter 3 drags out into far more
  // real scrolling before the title clears up — it was still visibly
  // blurred well after the image below it had already resolved. Faster
  // fractions here, close to chapter 1's, keep the actual scroll
  // distance to full clarity roughly comparable across chapters.
  const snapEnd = start + (end - start) * (number === 1 ? 0.18 : number === 2 ? 0.12 : 0.55)
  const clarityEnd = start + (end - start) * (number === 1 ? 0.045 : number === 2 ? 0.05 : 0.24)
  const input = holdWindow(start, end, 0.1, number === 1 ? 0.12 : 0.18)

  // Desktop hands the title off to ChapterSideLabel once it recedes, so
  // fading/blurring it out here reads as intentional. That handoff is
  // lg:block only — on mobile there's nothing to take over, so the same
  // recede left the title sitting dim and blurred for the rest of the
  // chapter. Simplified mobile version: snap in once, then hold at full
  // clarity instead of receding.
  const snapInput = isMobile ? [start, snapEnd] : [start, snapEnd, input[2], input[3]]
  const holdInput = isMobile ? [input[0], input[1]] : input
  const opacityInput = isMobile
    ? [start, start + (end - start) * 0.12]
    : [start, start + (end - start) * 0.12, input[2], input[3]]
  const blurInput = isMobile ? [start, clarityEnd] : [start, clarityEnd, input[2], input[3]]

  const scale = useTransform(progress, snapInput, isMobile ? [0.96, 1] : [0.96, 1, 1, 0.98])
  const rotate = useTransform(progress, snapInput, isMobile ? [-0.8, 0] : [-0.8, 0, 0, 0.8])
  const y = useTransform(progress, holdInput, isMobile ? [10, 0] : [10, 0, 0, -8])
  const x = useTransform(
    progress,
    holdInput,
    isMobile ? ["-1.2%", "0%"] : ["-1.2%", "0%", "0%", "1.6%"]
  )
  const opacity = useTransform(
    progress,
    opacityInput,
    isMobile ? [0, 1] : [0, 1, 1, number === 1 ? 0.62 : 0.34]
  )
  const blur = useTransform(
    progress,
    blurInput,
    isMobile ? ["blur(8px)", "blur(0px)"] : ["blur(8px)", "blur(0px)", "blur(0px)", "blur(4px)"]
  )
  const ruleScale = useTransform(progress, holdInput, isMobile ? [0, 1] : [0, 1, 1, 0])

  const label = (
    <div>
      <div className="flex items-center gap-3 text-xs tracking-[0.08em] text-neutral-500">
        <span className="tabular-nums">{String(number).padStart(2, "0")}</span>
        <span className="h-px w-8" style={{ backgroundColor: accent }} />
        <span>Chapter</span>
      </div>
      <h3 className="mt-3 font-display text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">
        {title}
      </h3>
    </div>
  )

  return (
    <div>
      {disabled ? (
        label
      ) : (
        <motion.div
          style={{ scale, rotate, x, y, opacity, filter: blur }}
          className="origin-left"
        >
          {label}
        </motion.div>
      )}
      {/* Doubled rule — a thin hairline riding above the accent bar, the
          way irezumi outlines a band rather than using a single stroke. */}
      <div aria-hidden className="relative mt-5 sm:mt-6">
        <div className="relative h-[3px] bg-neutral-800">
          <motion.div
            style={{
              backgroundColor: accent,
              scaleX: disabled ? 1 : ruleScale,
            }}
            className="absolute inset-0 origin-left"
          />
        </div>
        <div className="relative mt-1 h-px bg-neutral-800">
          <motion.div
            style={{
              backgroundColor: accent,
              scaleX: disabled ? 1 : ruleScale,
              opacity: 0.5,
            }}
            className="absolute inset-0 origin-left"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * One catalog entry. The whole row stamps in (scale+rotate snap) as you
 * scroll to it, and can also be hovered/tapped afterward — active rows get
 * a tinted background and left rule in their accent color; when a sibling
 * is active, everything else dims. Scroll-entrance opacity and hover-dim
 * opacity are two different sources, so they live on separate nested
 * elements rather than fighting over one `opacity` style.
 */
function ItemRow({
  item,
  accent,
  isFirstInChapter,
  start,
  end,
  progress,
  disabled,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  item: Item
  accent: string
  isFirstInChapter: boolean
  start: number
  end: number
  progress: MotionValue<number>
  disabled: boolean
  isActive: boolean
  isDimmed: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const snapEnd = start + (end - start) * 0.6
  const input = holdWindow(start, end, 0.1, 0.18)
  const scale = useTransform(
    progress,
    [start, snapEnd, input[2], input[3]],
    [0.92, 1, 1, 0.96]
  )
  const rotate = useTransform(
    progress,
    [start, snapEnd, input[2], input[3]],
    [-1.5, 0, 0, 1.2]
  )
  // Icon travels the least of anything in the row — it reads as the
  // closest, heaviest element, with the number a step behind it and title
  // /body receding further — four depths instead of three.
  const iconY = useTransform(progress, input, [8, 0, 0, -8])
  const numY = useTransform(progress, input, [20, 0, 0, -12])
  const titleY = useTransform(progress, input, [36, 0, 0, -18])
  const bodyY = useTransform(progress, input, [64, 0, 0, -24])
  const entranceOpacity = useTransform(
    progress,
    [start, start + (end - start) * 0.1],
    [0, 1]
  )
  const ruleScale = useTransform(progress, input, [0, 1, 1, 0])

  const Icon = item.icon
  const iconNode = (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-200"
      style={{
        borderColor: accent,
        color: accent,
        backgroundColor: withAlpha(accent, 0.15),
        transform: isActive ? "scale(1.12)" : undefined,
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  )

  const numberNode = (
    <span className="text-xs tracking-[0.04em] text-neutral-500 tabular-nums">
      {item.n}
    </span>
  )

  const markerNode = (
    <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
      {iconNode}
      {numberNode}
    </div>
  )

  const content = (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      style={{
        backgroundColor: isActive ? withAlpha(accent, 0.08) : "transparent",
        boxShadow: isActive ? `inset 3px 0 0 0 ${accent}` : undefined,
      }}
      className="-mx-3 cursor-pointer rounded-r-md px-3 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {disabled ? (
        <div
          className="grid items-start gap-4 py-6 sm:py-8 lg:grid-cols-12 lg:gap-8"
          style={
            !isFirstInChapter ? { borderTop: `2px solid ${accent}` } : undefined
          }
        >
          <div className="lg:col-span-1">{markerNode}</div>
          <h4 className="font-display text-xl sm:text-2xl lg:col-span-4">
            {item.title}
          </h4>
          <p className="text-base leading-relaxed text-neutral-400 lg:col-span-7">
            {item.body}
          </p>
        </div>
      ) : (
        <motion.div
          style={{ scale, rotate }}
          className="relative origin-left py-6 sm:py-8"
        >
          {!isFirstInChapter && (
            <div className="absolute inset-x-0 top-0">
              <div className="relative h-[2px] bg-neutral-800">
                <motion.div
                  style={{ backgroundColor: accent, scaleX: ruleScale }}
                  className="absolute inset-0 origin-left"
                />
              </div>
              <div className="relative mt-[3px] h-px bg-neutral-800">
                <motion.div
                  style={{
                    backgroundColor: accent,
                    scaleX: ruleScale,
                    opacity: 0.5,
                  }}
                  className="absolute inset-0 origin-left"
                />
              </div>
            </div>
          )}
          <motion.div
            style={{ opacity: entranceOpacity }}
            className="grid items-start gap-4 lg:grid-cols-12 lg:gap-8"
          >
            <div className="flex items-center gap-3 lg:col-span-1 lg:flex-col lg:items-start lg:gap-2.5">
              <motion.div style={{ y: iconY }}>{iconNode}</motion.div>
              <motion.div style={{ y: numY }}>{numberNode}</motion.div>
            </div>
            <motion.h4
              style={{ y: titleY }}
              className="font-display text-xl leading-tight sm:text-2xl lg:col-span-4"
            >
              {item.title}
            </motion.h4>
            <motion.p
              style={{ y: bodyY }}
              className="text-base leading-relaxed text-neutral-400 lg:col-span-7"
            >
              {item.body}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )

  return (
    <div
      style={{ opacity: isDimmed ? 0.4 : 1 }}
      className="transition-opacity duration-200"
    >
      {content}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shared props for a chapter's visual centerpiece.                    */
/* ------------------------------------------------------------------ */

type VisualInteraction = {
  activeIndex: number | null
  onHover: (index: number) => void
  onLeave: () => void
  onSelect: (index: number) => void
}

/* ------------------------------------------------------------------ */
/* Chapter 1 visual — terpene wheel                                    */
/* ------------------------------------------------------------------ */

const RING_CENTER = 100
const RING_RADIUS = 72
const RING_STROKE = 22
const RING_GAP_DEG = 3

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: RING_CENTER + RING_RADIUS * Math.cos(rad),
    y: RING_CENTER + RING_RADIUS * Math.sin(rad),
  }
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(endAngle)
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1"
  return `M ${start.x} ${start.y} A ${RING_RADIUS} ${RING_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function TerpeneWheelVisual({
  items,
  windows,
  span,
  progress,
  disabled,
  activeIndex,
  onHover,
  onLeave,
  onSelect,
}: {
  items: Item[]
  windows: Span[]
  span: Span
  progress: MotionValue<number>
  disabled: boolean
} & VisualInteraction) {
  type Terpene = { item: Item & { pct: number }; window: Span; index: number }
  const terpenes = items
    .map((item, index) => ({ item, window: windows[index], index }))
    .filter((t): t is Terpene => t.item.pct != null)

  const available = 360 - terpenes.length * RING_GAP_DEG
  const segments = terpenes.reduce<
    Array<Terpene & { d: string; cursor: number }>
  >((acc, t) => {
    const cursor = acc.length ? acc[acc.length - 1].cursor : 0
    const sweep = (t.item.pct / 100) * available
    const startAngle = cursor + RING_GAP_DEG / 2
    const endAngle = startAngle + sweep
    acc.push({
      ...t,
      d: describeArc(startAngle, endAngle),
      cursor: cursor + sweep + RING_GAP_DEG,
    })
    return acc
  }, [])

  const wheelSettleEnd = span.start + (span.end - span.start) * 0.22
  const wheelScale = useTransform(
    progress,
    [
      span.start,
      span.start + (span.end - span.start) * 0.08,
      wheelSettleEnd,
      span.end,
    ],
    [0.85, 1, 1, 1]
  )
  const wheelOpacity = useTransform(
    progress,
    [span.start, span.start + (span.end - span.start) * 0.08],
    [0, 1]
  )
  const wheelParallaxEnd = span.start + (span.end - span.start) * 0.28
  // Keeps turning the whole time its chapter is on screen, not just once on
  // entry — a real parallax tied to how far you've scrolled, not a fixed
  // one-shot animation.
  const wheelRotate = useTransform(
    progress,
    [span.start, wheelParallaxEnd, span.end],
    [-12, 12, 12]
  )
  const glowY = useTransform(
    progress,
    [span.start, wheelParallaxEnd, span.end],
    ["-6%", "6%", "6%"]
  )

  const activeTerpene = terpenes.find((t) => t.index === activeIndex)

  return (
    <motion.div
      style={
        disabled ? undefined : { scale: wheelScale, opacity: wheelOpacity }
      }
      className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60"
    >
      <motion.div
        aria-hidden
        style={disabled ? undefined : { y: glowY }}
        className="absolute inset-[10%] rounded-full blur-2xl"
      >
        <div
          className="h-full w-full rounded-full"
          style={{ backgroundColor: RGB.hybrid, opacity: 0.2 }}
        />
      </motion.div>
      <motion.svg
        viewBox="0 0 200 200"
        style={disabled ? undefined : { rotate: wheelRotate }}
        className="relative h-full w-full overflow-visible"
      >
        {segments.map((seg) => (
          <ArcSegment
            key={seg.item.title}
            d={seg.d}
            color={seg.item.accent ?? RGB.hybrid}
            label={seg.item.title}
            window={seg.window}
            progress={progress}
            disabled={disabled}
            isActive={activeIndex === seg.index}
            isDimmed={activeIndex !== null && activeIndex !== seg.index}
            onHover={() => onHover(seg.index)}
            onLeave={onLeave}
            onSelect={() => onSelect(seg.index)}
          />
        ))}
      </motion.svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {activeTerpene ? (
          <>
            <span className="font-display text-lg leading-none">
              {activeTerpene.item.title}
            </span>
            <span className="mt-1.5 text-[10px] tracking-[0.18em] text-neutral-500">
              {activeTerpene.item.pct}%
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] tracking-[0.18em] text-neutral-500">
              TERPENE
            </span>
            <span className="text-[10px] tracking-[0.18em] text-neutral-500">
              PROFILE
            </span>
          </>
        )}
      </div>
    </motion.div>
  )
}

function ArcSegment({
  d,
  color,
  label,
  window,
  progress,
  disabled,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  d: string
  color: string
  label: string
  window: Span
  progress: MotionValue<number>
  disabled: boolean
  isActive: boolean
  isDimmed: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const revealEnd = window.start + (window.end - window.start) * 0.12
  const pathLength = useTransform(progress, [window.start, revealEnd], [0, 1])

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={isActive}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{ cursor: "pointer", opacity: isDimmed ? 0.35 : 1 }}
      className="transition-opacity duration-200 focus-visible:outline-none"
    >
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={isActive ? RING_STROKE + 6 : RING_STROKE}
        strokeLinecap="round"
        fill="none"
        style={disabled ? { pathLength: 1 } : { pathLength }}
        className="transition-[stroke-width] duration-200"
      />
    </motion.g>
  )
}

/* ------------------------------------------------------------------ */
/* Chapter 2 visual — bud anatomy diagram                               */
/* ------------------------------------------------------------------ */

const BUD_ANCHORS = [
  { x: 144, y: 52 },
  { x: 120, y: 86 },
  { x: 202, y: 84 },
  { x: 164, y: 28 },
]
const BUD_TERMINALS = [
  { x: 38, y: 160 },
  { x: 114, y: 160 },
  { x: 206, y: 160 },
  { x: 282, y: 160 },
]

function AnatomyVisual({
  items,
  windows,
  accent,
  span,
  progress,
  disabled,
  activeIndex,
  onHover,
  onLeave,
  onSelect,
}: {
  items: Item[]
  windows: Span[]
  accent: string
  span: Span
  progress: MotionValue<number>
  disabled: boolean
} & VisualInteraction) {
  const budSettleEnd = span.start + (span.end - span.start) * 0.12
  const budScale = useTransform(
    progress,
    [
      span.start,
      span.start + (span.end - span.start) * 0.04,
      budSettleEnd,
      span.end,
    ],
    [0.9, 1, 1, 1]
  )
  const budOpacity = useTransform(
    progress,
    [span.start, span.start + (span.end - span.start) * 0.04],
    [0, 1]
  )
  const anatomyRevealStart = span.start + (span.end - span.start) * 0.015
  const anatomyRevealStep = (span.end - span.start) * 0.04
  const anatomyRevealDuration = (span.end - span.start) * 0.05
  const anatomyWindows = items.map((_, index) => ({
    start: anatomyRevealStart + index * anatomyRevealStep,
    end: anatomyRevealStart + index * anatomyRevealStep + anatomyRevealDuration,
  }))

  return (
    <motion.div
      style={disabled ? undefined : { scale: budScale, opacity: budOpacity }}
      // Mobile: aspect-[4/5] locks the box to the photo's own portrait
      // ratio (1080x1350) since there's nothing else to size it against.
      //
      // Desktop: lg:h-full lg:w-full instead — turns out aspect-ratio on
      // a block box with width:auto does NOT reliably let height drive
      // width the way the old comment here claimed. In practice the
      // browser resolves width:auto to "fill the containing block" first
      // (ordinary block-layout behavior), and only THEN derives height
      // from that already-fixed width via the ratio — the opposite of
      // intended. Net effect: the box's rendered height tracked column
      // WIDTH, not viewport height, so it visibly did nothing as the
      // window was resized taller/shorter. Filling the stretched parent
      // outright (see GraphicColumn's isExtraTall items-stretch) and
      // letting object-contain on the <Image> below preserve the actual
      // photo ratio sidesteps that ambiguity, and still can't overflow
      // the column either way, unlike a hard aspect-ratio + auto-width.
      className="relative mx-auto aspect-[4/5] w-full max-w-[378px] lg:h-full lg:w-full lg:aspect-auto lg:max-w-none"
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <Image
          src="https://res.cloudinary.com/g0mcdcfr/image/upload/v1786335991/Transparent_Background_Design_pmmnq5.svg"
          alt="Cannabis flower close-up"
          fill
          sizes="(min-width: 1024px) 560px, 80vw"
          className="object-contain object-left"
          // SVG source — next/image's optimizer refuses to transform SVGs
          // unless next.config.ts opts in globally, so this bypasses
          // optimization for just this image instead. Same pattern as the
          // navbar's Cloudinary SVG logo.
          unoptimized
        />
      </div>
      {/* Leader-line pointers removed for now — just the photo while we
          settle on the right image. See LeaderLine below to bring them
          back (anatomyWindows/BUD_ANCHORS/BUD_TERMINALS are untouched). */}
    </motion.div>
  )
}

function LeaderLine({
  anchor,
  terminal,
  label,
  title,
  accent,
  window,
  progress,
  disabled,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  anchor: { x: number; y: number }
  terminal: { x: number; y: number }
  label: string
  title: string
  accent: string
  window: Span
  progress: MotionValue<number>
  disabled: boolean
  isActive: boolean
  isDimmed: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const revealEnd = window.start + (window.end - window.start) * 0.12
  const pathLength = useTransform(progress, [window.start, revealEnd], [0, 1])
  const dotOpacity = useTransform(progress, [window.start, revealEnd], [0, 1])

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={title}
      aria-pressed={isActive}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{ cursor: "pointer", opacity: isDimmed ? 0.3 : 1 }}
      className="transition-opacity duration-200 focus-visible:outline-none"
    >
      <motion.line
        x1={anchor.x}
        y1={anchor.y}
        x2={terminal.x}
        y2={terminal.y}
        stroke={accent}
        strokeWidth={isActive ? 3 : 1.5}
        style={disabled ? { pathLength: 1 } : { pathLength }}
      />
      <motion.circle
        cx={anchor.x}
        cy={anchor.y}
        r={isActive ? 4.5 : 3}
        fill={accent}
        style={disabled ? undefined : { opacity: dotOpacity }}
      />
      <circle cx={terminal.x} cy={terminal.y} r={16} fill="transparent" />
      <motion.circle
        cx={terminal.x}
        cy={terminal.y}
        r={isActive ? 11 : 9}
        className="fill-neutral-900"
        stroke={accent}
        strokeWidth={isActive ? 2.5 : 1.5}
        style={disabled ? undefined : { opacity: dotOpacity }}
      />
      <motion.text
        x={terminal.x}
        y={terminal.y + 3.5}
        textAnchor="middle"
        fontSize={9}
        className="fill-neutral-50 tabular-nums"
        style={disabled ? undefined : { opacity: dotOpacity }}
      >
        {label}
      </motion.text>
      {isActive && (
        <text
          x={terminal.x}
          y={terminal.y + 26}
          textAnchor="middle"
          fontSize={11}
          fill={accent}
        >
          {title}
        </text>
      )}
    </motion.g>
  )
}

/* ------------------------------------------------------------------ */
/* Chapter 3 visual — onset/duration comparison bars                   */
/* ------------------------------------------------------------------ */

function ConsumptionVisual({
  items,
  windows,
  accent,
  span,
  progress,
  disabled,
  activeIndex,
  onHover,
  onLeave,
  onSelect,
}: {
  items: Item[]
  windows: Span[]
  accent: string
  span: Span
  progress: MotionValue<number>
  disabled: boolean
} & VisualInteraction) {
  const isMobile = useIsMobile()
  // Mobile keeps just the bar fill (in ConsumptionBarRow) — no slide/fade
  // chrome around it, same as the reduced-motion path.
  const skipChrome = disabled || isMobile
  const barRevealEnd = span.start + (span.end - span.start) * 0.04
  const barSettleEnd = span.start + (span.end - span.start) * 0.1
  const wrapOpacity = useTransform(progress, [span.start, barRevealEnd], [0, 1])
  const onsetX = useTransform(
    progress,
    [span.start, barRevealEnd, barSettleEnd, span.end],
    [-16, 0, 0, 0]
  )
  const durationX = useTransform(
    progress,
    [span.start, barRevealEnd, barSettleEnd, span.end],
    [16, 0, 0, 0]
  )

  return (
    <motion.div
      // Explicit { opacity: 1 } / { x: 0 } rather than `undefined` when
      // skipChrome is true — Motion writes these imperatively to the DOM,
      // and if the style prop just drops the binding it can leave the last
      // animated value (opacity 0, pre-scroll) stuck instead of clearing it.
      style={skipChrome ? { opacity: 1 } : { opacity: wrapOpacity }}
      className="space-y-2.5"
    >
      <div className="flex gap-8 text-xs tracking-[0.08em] text-neutral-500">
        <span className="w-20 shrink-0" />
        <motion.span
          style={skipChrome ? { x: 0 } : { x: onsetX }}
          className="flex-1"
        >
          Onset
        </motion.span>
        <motion.span
          style={skipChrome ? { x: 0 } : { x: durationX }}
          className="flex-1"
        >
          Duration
        </motion.span>
      </div>
      {items.map((item, i) => (
        <ConsumptionBarRow
          key={item.title}
          item={item}
          accent={item.accent ?? accent}
          window={windows[i]}
          progress={progress}
          disabled={disabled}
          isActive={activeIndex === i}
          isDimmed={activeIndex !== null && activeIndex !== i}
          onHover={() => onHover(i)}
          onLeave={onLeave}
          onSelect={() => onSelect(i)}
        />
      ))}
    </motion.div>
  )
}

function ConsumptionBarRow({
  item,
  accent,
  window,
  progress,
  disabled,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  item: Item
  accent: string
  window: Span
  progress: MotionValue<number>
  disabled: boolean
  isActive: boolean
  isDimmed: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}) {
  const onsetPct = item.stat?.onset.pct ?? 0
  const durationPct = item.stat?.duration.pct ?? 0
  const revealEnd = window.start + (window.end - window.start) * 0.04
  const onsetScale = useTransform(
    progress,
    [window.start, revealEnd],
    [0, onsetPct / 100]
  )
  const durationScale = useTransform(
    progress,
    [window.start, revealEnd],
    [0, durationPct / 100]
  )

  if (!item.stat) return null

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      style={{ opacity: isDimmed ? 0.4 : 1 }}
      className="-mx-3 flex cursor-pointer items-center gap-8 rounded-md px-3 py-1.5 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span
        className={cn(
          "w-20 shrink-0 text-sm transition-colors duration-200",
          isActive ? "text-neutral-50" : "text-neutral-300"
        )}
      >
        {item.title}
      </span>
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            style={{
              backgroundColor: accent,
              scaleX: disabled ? item.stat.onset.pct / 100 : onsetScale,
            }}
            className="h-full origin-left rounded-full transition-[height] duration-200"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          {item.stat.onset.label}
        </p>
      </div>
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            style={{
              backgroundColor: accent,
              scaleX: disabled ? item.stat.duration.pct / 100 : durationScale,
            }}
            className="h-full origin-left rounded-full"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          {item.stat.duration.label}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Deterministic pseudo-random value in [-1, 1] from an integer seed — no
 * Math.random(), so server and client render the same value. Rounded to 2
 * decimals: Motion's client-side transform writer rounds composed
 * transform values, but its SSR-rendered inline style doesn't, so an
 * unrounded irrational value here renders as two different-precision
 * strings and trips a hydration mismatch. Rounding it ourselves leaves
 * nothing left for the two passes to disagree on.
 */
function wiggle(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  const raw = (x - Math.floor(x)) * 2 - 1
  return Math.round(raw * 100) / 100
}

/** One word of the lead — words rather than letters; see living-soil.tsx's
 * Word for why letter-by-letter on a full paragraph reads as a gimmick.
 * Pops in with a small scale+tilt snap rather than a plain fade+slide, to
 * match the stamped-ink language used everywhere else in this section. */
function Word({
  word,
  index,
  total,
  progress,
  disabled,
  emphasis = false,
  delay = 0,
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
  disabled: boolean
  emphasis?: boolean
  /** Shifts this word's whole in/out cycle later on the shared progress
   * scale, so a paragraph can wait its turn instead of unraveling at the
   * same time as whatever comes before it. */
  delay?: number
}) {
  const start = delay + (index / total) * (emphasis ? 0.08 : 0.1)
  const end = start + (emphasis ? 0.11 : 0.1)
  const outStart =
    delay +
    (emphasis ? 0.38 : 0.32) +
    (index / total) * (emphasis ? 0.05 : 0.06)
  const outEnd = outStart + (emphasis ? 0.08 : 0.1)
  const tilt = wiggle(index + 100) * (emphasis ? 3.5 : 5)

  const input = [start, end, outStart, outEnd]
  const scale = useTransform(progress, input, [
    emphasis ? 1.04 : 1.02,
    1,
    1,
    emphasis ? 0.99 : 0.97,
  ])
  const rotate = useTransform(progress, input, [tilt * 0.08, 0, 0, -tilt * 0.1])
  const x = useTransform(progress, input, [
    emphasis ? "0.7%" : "0.5%",
    "0%",
    "0%",
    emphasis ? "1.4%" : "1%",
  ])
  const y = useTransform(progress, input, [
    emphasis ? 6 : 5,
    0,
    0,
    emphasis ? -6 : -8,
  ])
  const opacity = useTransform(progress, input, [
    0,
    1,
    1,
    emphasis ? 0.78 : 0.72,
  ])

  if (disabled) return <>{word} </>

  return (
    <motion.span
      style={{ scale, rotate, x, y, opacity }}
      className={cn(
        "inline-block will-change-transform",
        emphasis && "text-neutral-50"
      )}
    >
      {word}
      <span className="inline-block w-[0.26em]" />
    </motion.span>
  )
}

/**
 * One character of the headline — stamps in rather than sliding up out of a
 * clipped slot: scales down from oversized, settles a per-letter tilt back
 * to level, and comes into focus from a blur, like ink hitting flash paper
 * and resolving. Each letter's tilt is fixed (via wiggle()) so the title
 * reads as hand-set type rather than a mechanically uniform sweep.
 */
function Letter({
  char,
  index,
  total,
  progress,
  disabled,
}: {
  char: string
  index: number
  total: number
  progress: MotionValue<number>
  disabled: boolean
}) {
  const outStart = 0.76 + (index / total) * 0.12
  const outEnd = Math.min(outStart + 0.1, 1)
  const tilt = wiggle(index) * 14

  const input = [0, outStart, outEnd]
  const scale = useTransform(progress, input, [1, 1, 0.9])
  const rotate = useTransform(progress, input, [0, 0, -tilt * 0.4])
  const y = useTransform(progress, input, ["0%", "0%", "-28%"])
  const opacity = useTransform(progress, input, [1, 1, 0.86])
  const blur = useTransform(progress, input, [
    "blur(0px)",
    "blur(0px)",
    "blur(4px)",
  ])

  if (disabled) return <span className="inline-block">{char}</span>

  return (
    <motion.span
      style={{ scale, rotate, y, opacity, filter: blur }}
      className="inline-block will-change-transform"
    >
      {char}
    </motion.span>
  )
}
