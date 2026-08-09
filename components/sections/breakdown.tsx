"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
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
} from "lucide-react";
import { RGB } from "@/lib/spectrum";
import { cn } from "@/lib/utils";

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

const HEADLINE = "Know what you're smoking";

const LEAD =
  "A strain is more than its THC percentage. Cannabinoids and terpenes shape the effect, the plant's own anatomy is where they're made, and how you consume it changes all of it again.";

/** Inserts an alpha channel into a legacy-space rgb() string, e.g.
 * "rgb(139 92 246)" -> "rgb(139 92 246 / 0.15)". */
function withAlpha(rgb: string, alpha: number) {
  return rgb.replace(/\)$/, ` / ${alpha})`);
}

type Item = {
  n: string;
  title: string;
  body: string;
  icon: LucideIcon;
  accent?: string;
  /** Terpene wheel share, chapter 1 only — shares among wheel items sum to 100. */
  pct?: number;
  /** Onset/duration comparison bars, chapter 3 only. */
  stat?: { onset: { pct: number; label: string }; duration: { pct: number; label: string } };
};
type Chapter = { title: string; accent: string; items: Item[] };

const CHAPTERS: Chapter[] = [
  {
    title: "Cannabinoids & Terpenes",
    accent: RGB.indica,
    items: [
      {
        n: "01",
        title: "THC",
        body: "Binds CB1 receptors in the brain — psychoactive, the reason for the high.",
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
        body: "Earthy, musky terpene — the heavy-lidded, body-melting one.",
        icon: Leaf,
        accent: RGB.indica,
        pct: 35,
      },
      {
        n: "04",
        title: "Caryophyllene",
        body: "Peppery and spicy — the one terpene that's also a cannabinoid.",
        icon: Zap,
        accent: RGB.red,
        pct: 25,
      },
      {
        n: "05",
        title: "Limonene",
        body: "Citrus terpene. Mood-lifting, straight off the jar.",
        icon: Citrus,
        accent: RGB.hybrid,
        pct: 22,
      },
      {
        n: "06",
        title: "Pinene",
        body: "Pine, sharp. Keeps a heavy strain from feeling foggy.",
        icon: TreePine,
        accent: RGB.sativa,
        pct: 18,
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
        body: "The frosty crystals coating the bud — where the cannabinoids and terpenes actually live.",
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
        body: "The wispy hairs — white when young, darkening as the plant matures.",
        icon: Feather,
      },
      {
        n: "04",
        title: "Cola",
        body: "The main flowering cluster at the top of the branch — the densest bud on the plant.",
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
        body: "Fastest onset, shortest duration — effects in minutes, gone in a couple hours.",
        icon: Flame,
        stat: {
          onset: { pct: 8, label: "Seconds to minutes" },
          duration: { pct: 20, label: "1–3 hours" },
        },
      },
      {
        n: "02",
        title: "Vaping",
        body: "Similar speed to smoking, gentler on the lungs — heat, not combustion.",
        icon: Cloud,
        stat: {
          onset: { pct: 10, label: "Minutes" },
          duration: { pct: 22, label: "1–3 hours" },
        },
      },
      {
        n: "03",
        title: "Edibles",
        body: "Slowest onset, longest duration — processed through the liver into a stronger compound.",
        icon: Cookie,
        stat: {
          onset: { pct: 75, label: "30–90 minutes" },
          duration: { pct: 95, label: "4–8 hours" },
        },
      },
    ],
  },
];

/** Flat list driving the shared scroll progress — chapter markers and their
 * items share one sequence, so the whole section reads as a single
 * continuous scroll rather than three separately-triggered blocks. */
type Beat =
  | { kind: "chapter"; chapterIndex: number; title: string; accent: string }
  | { kind: "item"; chapterIndex: number; item: Item; accent: string; indexInChapter: number };

const BEATS: Beat[] = CHAPTERS.flatMap((chapter, chapterIndex) => [
  { kind: "chapter" as const, chapterIndex, title: chapter.title, accent: chapter.accent },
  ...chapter.items.map((item, indexInChapter) => ({
    kind: "item" as const,
    chapterIndex,
    item,
    accent: item.accent ?? chapter.accent,
    indexInChapter,
  })),
]);

// Windows are tuned so the last one ends comfortably before progress caps at
// 1 — see about.tsx's note on this same failure mode.
const BEATS_BASE = 0.0;
const BEATS_RANGE = 0.82;
const BEATS_WINDOW = 0.16;

function beatWindow(index: number) {
  const start = BEATS_BASE + (index / BEATS.length) * BEATS_RANGE;
  return { start, end: start + BEATS_WINDOW };
}

type Span = { start: number; end: number };

function holdWindow(start: number, end: number, inPortion = 0.35, outPortion = 0.3): number[] {
  const length = end - start;
  const inEnd = start + length * inPortion;
  const outStart = Math.max(inEnd, end - length * outPortion);
  return [start, inEnd, outStart, end];
}

/** Each chapter's full on-screen span — from its own marker to its last
 * row — so a chapter's visual centerpiece can be driven by the same
 * progress its rows use, rather than a separate trigger. */
const CHAPTER_SPANS: Span[] = CHAPTERS.map((_, chapterIndex) => {
  const markerIndex = BEATS.findIndex((b) => b.kind === "chapter" && b.chapterIndex === chapterIndex);
  let lastItemIndex = markerIndex;
  BEATS.forEach((b, i) => {
    if (b.kind === "item" && b.chapterIndex === chapterIndex) lastItemIndex = i;
  });
  return { start: beatWindow(markerIndex).start, end: beatWindow(lastItemIndex).end };
});

/** Each chapter's items paired with their own actual on-screen window, so a
 * centerpiece visual (wheel arc, leader line, bar) can be perfectly synced
 * to the row it corresponds to below it. */
const CHAPTER_ITEM_WINDOWS: Span[][] = CHAPTERS.map((chapter, chapterIndex) =>
  chapter.items.map((_, indexInChapter) => {
    const beatIndex = BEATS.findIndex(
      (b) => b.kind === "item" && b.chapterIndex === chapterIndex && b.indexInChapter === indexInChapter
    );
    return beatWindow(beatIndex);
  })
);

/** Shared side padding — matches living-soil.tsx's full-bleed columns. */
const GUTTER = "px-5 sm:px-8 lg:px-14";

type ActiveKey = { chapter: number; index: number } | null;

export function Breakdown() {
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Hover previews on desktop; a tap "pins" the same state for touch —
  // whichever is set wins, so hovering never fights a tap.
  const [hovered, setHovered] = useState<ActiveKey>(null);
  const [pinned, setPinned] = useState<ActiveKey>(null);
  const active = hovered ?? pinned;

  const { scrollYProgress: headProgress } = useScroll({
    target: headRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start 100%", "end start"],
  });

  const titleY = useTransform(headProgress, [0, 0.52, 0.82, 1], ["0%", "0%", "-18%", "-18%"]);
  const titleOpacity = useTransform(headProgress, [0, 0.52, 0.82, 1], [1, 1, 0.32, 0.32]);
  const titleBlur = useTransform(headProgress, [0, 0.52, 0.82, 1], ["blur(0px)", "blur(0px)", "blur(10px)", "blur(10px)"]);
  const smokeY = useTransform(headProgress, [0, 0.5, 1], ["0%", "-14%", "-42%"]);
  const smokeX = useTransform(headProgress, [0, 0.5, 1], ["0%", "2%", "6%"]);
  const smokeScale = useTransform(headProgress, [0, 0.5, 1], [1, 1.1, 1.28]);
  // Peaks much higher (was 0.22, further diluted by the /70 text color) and
  // holds there instead of spiking and dropping in one breath, so it reads
  // as smoke actually drifting off rather than a flicker.
  const smokeOpacity = useTransform(headProgress, [0, 0.35, 0.65, 1], [0, 0.85, 0.7, 0]);
  const smokeBlur = useTransform(headProgress, [0, 0.5, 1], ["blur(0px)", "blur(8px)", "blur(18px)"]);

  const bodyGlowLeftY = useTransform(bodyProgress, [0, 0.72, 1], ["-4%", "10%", "10%"]);
  const bodyGlowRightY = useTransform(bodyProgress, [0, 0.72, 1], ["10%", "-6%", "-6%"]);
  const bodyGridOpacity = useTransform(bodyProgress, [0, 0.2, 0.6, 1], [0, 0.3, 0.22, 0]);

  return (
    <section id="breakdown" className="scroll-mt-20 relative bg-neutral-900">
      {/* ---------- HEAD ---------- */}
      <div
        ref={headRef}
        className={`relative overflow-hidden bg-neutral-900 pb-8 pt-28 text-neutral-50 sm:pb-10 sm:pt-48 ${GUTTER}`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-20 top-16 h-56 w-56 rounded-full blur-3xl sm:h-72 sm:w-72"
          >
            <div className="h-full w-full rounded-full" style={{ backgroundColor: RGB.indica, opacity: 0.18 }} />
          </div>
          <div
            className="absolute right-[-6rem] top-4 h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80"
          >
            <div className="h-full w-full rounded-full" style={{ backgroundColor: RGB.hybrid, opacity: 0.16 }} />
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
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RGB.indica }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RGB.hybrid }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RGB.sativa }} />
              <span>Effects decoded</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-neutral-200">
              Terpenes, trichomes, and how you actually take it — tap
              anything below to see how the pieces connect.
            </p>
          </div>

          <motion.h2
            className={[
              "relative order-1 font-display uppercase leading-[0.86] tracking-[-0.04em] text-neutral-50 lg:order-2",
              // min-w-0 so this can actually shrink inside the flex row —
              // without it the longest word ("SMOKING") forces the column
              // wider than the viewport and the tail clips off the right.
              "min-w-0 lg:flex-1",
              "text-[clamp(2rem,5.4vw,6rem)]",
            ].join(" ")}
            style={
              reduce
                ? { marginBottom: "-0.02em" }
                : { marginBottom: "-0.02em", y: titleY, opacity: titleOpacity, filter: titleBlur }
            }
          >
            <motion.span
              aria-hidden
              style={
                reduce
                  ? { opacity: 0 }
                  : { x: smokeX, y: smokeY, scale: smokeScale, opacity: smokeOpacity, filter: smokeBlur }
              }
              className="pointer-events-none absolute inset-0 text-neutral-50"
            >
              {HEADLINE.split(" ").map((word) => (
                <span key={`${word}-smoke`} className="inline-block whitespace-nowrap">
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
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            style={reduce ? undefined : { y: bodyGlowLeftY, opacity: bodyGridOpacity }}
            className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full blur-3xl sm:h-[26rem] sm:w-[26rem]"
          >
            <div className="h-full w-full rounded-full" style={{ backgroundColor: RGB.indica, opacity: 0.14 }} />
          </motion.div>
          <motion.div
            style={reduce ? undefined : { y: bodyGlowRightY, opacity: bodyGridOpacity }}
            className="absolute right-[-10rem] top-[38rem] h-80 w-80 rounded-full blur-3xl sm:h-[30rem] sm:w-[30rem]"
          >
            <div className="h-full w-full rounded-full" style={{ backgroundColor: RGB.sativa, opacity: 0.14 }} />
          </motion.div>
          <motion.div
            style={reduce ? undefined : { opacity: bodyGridOpacity }}
            className="absolute inset-0"
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(250 248 244 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(250 248 244 / 0.04) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "linear-gradient(to bottom, transparent, black 12%, black 82%, transparent)",
              }}
            />
          </motion.div>
        </div>
        {/* Lead — assembles word by word, resolves early in the scroll. */}
        <p className="relative max-w-5xl text-2xl leading-[1.35] text-neutral-50 sm:text-3xl lg:text-4xl">
          {LEAD.split(" ").map((word, i, arr) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              index={i}
              total={arr.length}
              progress={bodyProgress}
              disabled={!!reduce}
            />
          ))}
        </p>

        {/* Chapters — one continuous sequence of chapter marks, a visual
            centerpiece per chapter, and rows — all keyed to slices of the
            same bodyProgress, and all wired to one hover/tap state per
            chapter so the visual and its rows highlight together. */}
        <div className="relative mt-28 sm:mt-36">
          {CHAPTERS.map((chapter, chapterIndex) => {
            const markerBeatIndex = BEATS.findIndex(
              (b) => b.kind === "chapter" && b.chapterIndex === chapterIndex
            );
            const { start, end } = beatWindow(markerBeatIndex);
            const span = CHAPTER_SPANS[chapterIndex];
            const spanLead = chapterIndex === 0 ? 0.1 : 0.06;
            const visualSpan = { start: Math.max(0, span.start - spanLead), end: span.end };
            const itemWindows = CHAPTER_ITEM_WINDOWS[chapterIndex];
            const rowLead = chapterIndex === 0 ? 0.09 : 0.045;
            const activeIndex = active && active.chapter === chapterIndex ? active.index : null;
            const onHover = (index: number) => setHovered({ chapter: chapterIndex, index });
            const onLeave = () => setHovered(null);
            const onSelect = (index: number) =>
              setPinned((prev) =>
                prev && prev.chapter === chapterIndex && prev.index === index
                  ? null
                  : { chapter: chapterIndex, index }
              );
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
              );

            return (
              <ChapterFrame
                key={chapter.title}
                accent={chapter.accent}
                isFirst={chapterIndex === 0}
                isExtended={chapterIndex > 0}
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
                  start={start}
                  end={end}
                  progress={bodyProgress}
                  disabled={!!reduce}
                />

                <div
                  className={cn(
                    "mt-7 grid gap-7 lg:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.35fr)] lg:items-stretch lg:gap-10",
                    chapterIndex > 0 && "lg:min-h-[72rem]"
                  )}
                >
                  <GraphicColumn isExtended={chapterIndex > 0}>
                    {visual}
                  </GraphicColumn>
                  <DescriptionColumn isSticky={chapterIndex > 0}>
                    {chapter.items.map((item, indexInChapter) => (
                      <ItemRow
                        key={item.title}
                        item={item}
                        accent={item.accent ?? chapter.accent}
                        isFirstInChapter={indexInChapter === 0}
                        start={Math.max(0, itemWindows[indexInChapter].start - rowLead)}
                        end={itemWindows[indexInChapter].end}
                        progress={bodyProgress}
                        disabled={!!reduce}
                        isActive={activeIndex === indexInChapter}
                        isDimmed={activeIndex !== null && activeIndex !== indexInChapter}
                        onHover={() => onHover(indexInChapter)}
                        onLeave={onLeave}
                        onSelect={() => onSelect(indexInChapter)}
                      />
                    ))}
                  </DescriptionColumn>
                </div>
              </ChapterFrame>
            );
          })}
        </div>

        <ClosingLine progress={bodyProgress} disabled={!!reduce} />
      </div>
    </section>
  );
}

/** Closes out the same continuous scroll — the last beat lands around
 * progress 0.94, so this picks up right after and rides the tail end of
 * bodyProgress rather than sitting there with no motion of its own. */
function ClosingLine({ progress, disabled }: { progress: MotionValue<number>; disabled: boolean }) {
  const y = useTransform(progress, [0.78, 0.84, 0.95, 1], [40, 0, 0, -28]);
  const opacity = useTransform(progress, [0.78, 0.84, 0.95, 1], [0, 1, 1, 0.85]);

  return (
    <motion.p
      style={disabled ? undefined : { y, opacity }}
      className="relative mt-32 max-w-4xl font-display text-3xl leading-[1.1] sm:mt-44 sm:text-5xl"
    >
      None of it works alone — it&apos;s the combination that decides how a
      strain actually feels.
    </motion.p>
  );
}

function ChapterFrame({
  accent,
  isFirst,
  isExtended,
  children,
}: {
  accent: string;
  isFirst: boolean;
  isExtended: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(135deg, ${withAlpha(accent, 0.14)} 0%, ${withAlpha(accent, 0.04)} 22%, ${withAlpha(accent, 0)} 56%)`,
      }}
      className={cn(
        "relative overflow-visible rounded-[1.5rem] border border-neutral-800/80 px-4 py-10 shadow-[0_0_0_1px_rgb(250_248_244_/_0.02)] sm:px-6 sm:py-12",
        isExtended && "lg:min-h-[78rem] lg:py-14",
        isFirst ? "mt-0" : "mt-20 sm:mt-24"
      )}
    >
      {children}
    </div>
  );
}

function GraphicColumn({
  children,
  isExtended,
}: {
  children: ReactNode;
  isExtended: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-64 sm:min-h-72 lg:h-full",
        isExtended ? "lg:min-h-[60rem]" : "lg:min-h-[28rem]"
      )}
    >
      <div className="lg:hidden">{children}</div>
      <div
        className={cn(
          "hidden lg:flex lg:sticky lg:top-24 lg:items-center",
          isExtended ? "lg:h-[calc(100vh-2rem)]" : "lg:h-[calc(100vh-6rem)]"
        )}
      >
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

function DescriptionColumn({
  children,
  isSticky,
}: {
  children: ReactNode;
  isSticky: boolean;
}) {
  return (
    <div className={cn("relative", isSticky && "lg:min-h-[60rem]")}>
      <div
        className={cn(
          isSticky && "lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100vh-2rem)] lg:items-center"
        )}
      >
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

function ChapterAura({
  accent,
  span,
  progress,
  disabled,
}: {
  accent: string;
  span: Span;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const input = holdWindow(span.start, span.end, 0.12, 0.12);
  const y = useTransform(progress, input, [-12, 0, 0, 18]);
  const x = useTransform(progress, input, ["-3%", "0%", "0%", "4%"]);
  const opacity = useTransform(progress, input, [0, 1, 1, 0.18]);

  return (
    <motion.div
      aria-hidden
      style={disabled ? undefined : { x, y, opacity }}
      className="pointer-events-none absolute right-[-8%] top-10 h-36 w-36 rounded-full blur-3xl sm:h-48 sm:w-48"
    >
      <div className="h-full w-full rounded-full" style={{ backgroundColor: accent, opacity: 0.12 }} />
    </motion.div>
  );
}

function TerpeneStackVisual({
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
  items: Item[];
  windows: Span[];
  span: Span;
  progress: MotionValue<number>;
  disabled: boolean;
} & VisualInteraction) {
  type Terpene = { item: Item & { pct: number }; window: Span; index: number };
  const terpenes = items
    .map((item, index) => ({ item, window: windows[index], index }))
    .filter((t): t is Terpene => t.item.pct != null);

  const activeTerpene = terpenes.find((t) => t.index === activeIndex);

  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[24rem]">
      <div className="relative h-[18rem] sm:h-[20rem]">
        <div aria-hidden className="absolute inset-x-10 bottom-8 top-14 rounded-[2rem] blur-3xl">
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
        <div className="absolute inset-0 rounded-[2rem] border border-neutral-800/80 bg-neutral-950/50" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-neutral-700/50 bg-neutral-950/55 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            <span>Terpene</span>
            <span>Blend</span>
          </div>
          <div className="pointer-events-none absolute inset-x-6 top-[4.5rem] h-px bg-neutral-800/80 sm:inset-x-8" />
          <div className="relative mt-10 flex-1">
            {terpenes.map((terpene, stackIndex) => (
            <TerpeneBand
              key={terpene.item.title}
              item={terpene.item}
              stackIndex={stackIndex}
              isActive={activeIndex === terpene.index}
              isDimmed={activeIndex !== null && activeIndex !== terpene.index}
                onHover={() => onHover(terpene.index)}
                onLeave={onLeave}
                onSelect={() => onSelect(terpene.index)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none mt-4 sm:mt-5">
        {activeTerpene ? (
          <div className="max-w-[12rem] rounded-2xl border border-neutral-700/70 bg-neutral-950/80 px-4 py-3 backdrop-blur-sm">
            <span className="block text-[10px] tracking-[0.22em] text-neutral-500">DOMINANT NOTE</span>
            <span className="mt-2 block font-display text-xl leading-none text-neutral-50">
              {activeTerpene.item.title}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              {activeTerpene.item.pct}% of profile
            </span>
          </div>
        ) : (
          <div className="max-w-[12rem] rounded-2xl border border-neutral-700/60 bg-neutral-950/72 px-4 py-3 backdrop-blur-sm">
            <span className="block text-[10px] tracking-[0.22em] text-neutral-500">PROFILE STACK</span>
            <span className="mt-2 block font-display text-xl leading-none text-neutral-50">
              Terpenes in play
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-neutral-300">
              Scroll to layer in the scent notes and feel the profile build.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TerpeneBand({
  item,
  stackIndex,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  item: Item & { pct: number };
  stackIndex: number;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const top = 8 + stackIndex * 13;
  const width = `${44 + item.pct * 0.42}%`;
  const color = item.accent ?? RGB.hybrid;

  return (
    <motion.button
      type="button"
      role="button"
      aria-label={item.title}
      aria-pressed={isActive}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      style={{ opacity: isDimmed ? 0.3 : 1, top: `${top}%`, width }}
      className="absolute left-0 flex h-12 items-center gap-3 rounded-r-full border border-neutral-800/80 bg-neutral-950/78 px-4 text-left transition-[opacity,border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-200/70 sm:h-14"
    >
      <span
        className="absolute inset-y-[6px] left-[6px] w-1.5 rounded-full sm:inset-y-[7px]"
        style={{ backgroundColor: color, opacity: isActive ? 1 : 0.82 }}
      />
      <span className="pl-2">
        <span className="block font-display text-lg leading-none text-neutral-50 sm:text-xl">
          {item.title}
        </span>
        <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          {item.pct}% share
        </span>
      </span>
    </motion.button>
  );
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
}: {
  number: number;
  title: string;
  accent: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const snapEnd = start + (end - start) * 0.55;
  const input = holdWindow(start, end, 0.1, 0.18);
  const scale = useTransform(progress, [start, snapEnd, input[2], input[3]], [0.82, 1, 1, 0.92]);
  const rotate = useTransform(progress, [start, snapEnd, input[2], input[3]], [-4, 0, 0, 3]);
  const opacity = useTransform(progress, [start, start + (end - start) * 0.1], [0, 1]);
  const ruleScale = useTransform(progress, input, [0, 1, 1, 0]);

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
  );

  return (
    <div>
      {disabled ? (
        label
      ) : (
        <motion.div style={{ scale, rotate, opacity }} className="origin-left">
          {label}
        </motion.div>
      )}
      {/* Doubled rule — a thin hairline riding above the accent bar, the
          way irezumi outlines a band rather than using a single stroke. */}
      <div aria-hidden className="relative mt-5 sm:mt-6">
        <div className="relative h-[3px] bg-neutral-800">
          <motion.div
            style={{ backgroundColor: accent, scaleX: disabled ? 1 : ruleScale }}
            className="absolute inset-0 origin-left"
          />
        </div>
        <div className="relative mt-1 h-px bg-neutral-800">
          <motion.div
            style={{ backgroundColor: accent, scaleX: disabled ? 1 : ruleScale, opacity: 0.5 }}
            className="absolute inset-0 origin-left"
          />
        </div>
      </div>
    </div>
  );
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
  item: Item;
  accent: string;
  isFirstInChapter: boolean;
  start: number;
  end: number;
  progress: MotionValue<number>;
  disabled: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const snapEnd = start + (end - start) * 0.6;
  const input = holdWindow(start, end, 0.1, 0.18);
  const scale = useTransform(progress, [start, snapEnd, input[2], input[3]], [0.92, 1, 1, 0.96]);
  const rotate = useTransform(progress, [start, snapEnd, input[2], input[3]], [-1.5, 0, 0, 1.2]);
  // Icon travels the least of anything in the row — it reads as the
  // closest, heaviest element, with the number a step behind it and title
  // /body receding further — four depths instead of three.
  const iconY = useTransform(progress, input, [8, 0, 0, -8]);
  const numY = useTransform(progress, input, [20, 0, 0, -12]);
  const titleY = useTransform(progress, input, [36, 0, 0, -18]);
  const bodyY = useTransform(progress, input, [64, 0, 0, -24]);
  const entranceOpacity = useTransform(progress, [start, start + (end - start) * 0.1], [0, 1]);
  const ruleScale = useTransform(progress, input, [0, 1, 1, 0]);

  const Icon = item.icon;
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
  );

  const numberNode = (
    <span className="text-xs tabular-nums tracking-[0.04em] text-neutral-500">{item.n}</span>
  );

  const markerNode = (
    <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
      {iconNode}
      {numberNode}
    </div>
  );

  const content = (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      style={{
        backgroundColor: isActive ? withAlpha(accent, 0.08) : "transparent",
        boxShadow: isActive ? `inset 3px 0 0 0 ${accent}` : undefined,
      }}
      className="cursor-pointer rounded-r-md px-3 -mx-3 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {disabled ? (
        <div
          className="grid items-start gap-4 py-6 sm:py-8 lg:grid-cols-12 lg:gap-8"
          style={!isFirstInChapter ? { borderTop: `2px solid ${accent}` } : undefined}
        >
          <div className="lg:col-span-1">{markerNode}</div>
          <h4 className="font-display text-xl sm:text-2xl lg:col-span-4">{item.title}</h4>
          <p className="text-base leading-relaxed text-neutral-400 lg:col-span-7">{item.body}</p>
        </div>
      ) : (
        <motion.div style={{ scale, rotate }} className="relative origin-left py-6 sm:py-8">
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
                  style={{ backgroundColor: accent, scaleX: ruleScale, opacity: 0.5 }}
                  className="absolute inset-0 origin-left"
                />
              </div>
            </div>
          )}
          <motion.div
            style={{ opacity: entranceOpacity }}
            className="grid items-start gap-4 lg:grid-cols-12 lg:gap-8"
          >
            <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5 lg:col-span-1">
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
  );

  return (
    <div style={{ opacity: isDimmed ? 0.4 : 1 }} className="transition-opacity duration-200">
      {content}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared props for a chapter's visual centerpiece.                    */
/* ------------------------------------------------------------------ */

type VisualInteraction = {
  activeIndex: number | null;
  onHover: (index: number) => void;
  onLeave: () => void;
  onSelect: (index: number) => void;
};

/* ------------------------------------------------------------------ */
/* Chapter 1 visual — terpene wheel                                    */
/* ------------------------------------------------------------------ */

const RING_CENTER = 100;
const RING_RADIUS = 72;
const RING_STROKE = 22;
const RING_GAP_DEG = 3;

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: RING_CENTER + RING_RADIUS * Math.cos(rad),
    y: RING_CENTER + RING_RADIUS * Math.sin(rad),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${RING_RADIUS} ${RING_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
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
  items: Item[];
  windows: Span[];
  span: Span;
  progress: MotionValue<number>;
  disabled: boolean;
} & VisualInteraction) {
  type Terpene = { item: Item & { pct: number }; window: Span; index: number };
  const terpenes = items
    .map((item, index) => ({ item, window: windows[index], index }))
    .filter((t): t is Terpene => t.item.pct != null);

  const available = 360 - terpenes.length * RING_GAP_DEG;
  const segments = terpenes.reduce<Array<Terpene & { d: string; cursor: number }>>(
    (acc, t) => {
      const cursor = acc.length ? acc[acc.length - 1].cursor : 0;
      const sweep = (t.item.pct / 100) * available;
      const startAngle = cursor + RING_GAP_DEG / 2;
      const endAngle = startAngle + sweep;
      acc.push({ ...t, d: describeArc(startAngle, endAngle), cursor: cursor + sweep + RING_GAP_DEG });
      return acc;
    },
    []
  );

  const wheelSettleEnd = span.start + (span.end - span.start) * 0.22;
  const wheelScale = useTransform(progress, [span.start, span.start + (span.end - span.start) * 0.08, wheelSettleEnd, span.end], [0.85, 1, 1, 1]);
  const wheelOpacity = useTransform(progress, [span.start, span.start + (span.end - span.start) * 0.08], [0, 1]);
  const wheelParallaxEnd = span.start + (span.end - span.start) * 0.28;
  // Keeps turning the whole time its chapter is on screen, not just once on
  // entry — a real parallax tied to how far you've scrolled, not a fixed
  // one-shot animation.
  const wheelRotate = useTransform(progress, [span.start, wheelParallaxEnd, span.end], [-12, 12, 12]);
  const glowY = useTransform(progress, [span.start, wheelParallaxEnd, span.end], ["-6%", "6%", "6%"]);

  const activeTerpene = terpenes.find((t) => t.index === activeIndex);

  return (
    <motion.div
      style={disabled ? undefined : { scale: wheelScale, opacity: wheelOpacity }}
      className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60"
    >
      <motion.div
        aria-hidden
        style={disabled ? undefined : { y: glowY }}
        className="absolute inset-[10%] rounded-full blur-2xl"
      >
        <div className="h-full w-full rounded-full" style={{ backgroundColor: RGB.hybrid, opacity: 0.2 }} />
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
            <span className="font-display text-lg leading-none">{activeTerpene.item.title}</span>
            <span className="mt-1.5 text-[10px] tracking-[0.18em] text-neutral-500">
              {activeTerpene.item.pct}%
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] tracking-[0.18em] text-neutral-500">TERPENE</span>
            <span className="text-[10px] tracking-[0.18em] text-neutral-500">PROFILE</span>
          </>
        )}
      </div>
    </motion.div>
  );
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
  d: string;
  color: string;
  label: string;
  window: Span;
  progress: MotionValue<number>;
  disabled: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const revealEnd = window.start + (window.end - window.start) * 0.12;
  const pathLength = useTransform(progress, [window.start, revealEnd], [0, 1]);

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
          e.preventDefault();
          onSelect();
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
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2 visual — bud anatomy diagram                               */
/* ------------------------------------------------------------------ */

const BUD_ANCHORS = [
  { x: 118, y: 92 },
  { x: 143, y: 100 },
  { x: 177, y: 100 },
  { x: 202, y: 92 },
];
const BUD_TERMINALS = [
  { x: 34, y: 158 },
  { x: 112, y: 158 },
  { x: 208, y: 158 },
  { x: 286, y: 158 },
];

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
  items: Item[];
  windows: Span[];
  accent: string;
  span: Span;
  progress: MotionValue<number>;
  disabled: boolean;
} & VisualInteraction) {
  const budSettleEnd = span.start + (span.end - span.start) * 0.22;
  const budScale = useTransform(progress, [span.start, span.start + (span.end - span.start) * 0.08, budSettleEnd, span.end], [0.85, 1, 1, 1]);
  const budOpacity = useTransform(progress, [span.start, span.start + (span.end - span.start) * 0.08], [0, 1]);
  const budParallaxEnd = span.start + (span.end - span.start) * 0.26;
  // Same idea as the terpene wheel — motion tied to the full chapter span,
  // not just a one-shot entrance, so it keeps drifting while you're in it.
  const budX = useTransform(progress, [span.start, budParallaxEnd, span.end], ["-2%", "2%", "2%"]);

  return (
    <motion.div
      style={disabled ? undefined : { scale: budScale, opacity: budOpacity, x: budX }}
      className="relative mx-auto aspect-[320/196] w-full max-w-[380px]"
    >
      {/* viewBox is taller than the diagram needs so the active item's label
          (drawn below its terminal) has room INSIDE the box — at the old
          height it rendered past the bottom edge and sat on top of the rows
          below. No overflow-visible for the same reason. */}
      <svg viewBox="0 0 320 196" className="h-full w-full">
        <path
          d="M160 8c30 0 48 26 48 52 0 22-16 34-48 34s-48-12-48-34c0-26 18-52 48-52Z"
          className="fill-neutral-800"
          stroke={accent}
          strokeWidth={2}
        />
        {[
          [140, 30], [178, 24], [122, 52], [198, 50], [160, 20], [150, 68], [172, 66],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} className="fill-neutral-50" opacity={0.55} />
        ))}
        {items.map((item, i) => (
          <LeaderLine
            key={item.title}
            anchor={BUD_ANCHORS[i]}
            terminal={BUD_TERMINALS[i]}
            label={item.n}
            title={item.title}
            accent={accent}
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
      </svg>
    </motion.div>
  );
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
  anchor: { x: number; y: number };
  terminal: { x: number; y: number };
  label: string;
  title: string;
  accent: string;
  window: Span;
  progress: MotionValue<number>;
  disabled: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const revealEnd = window.start + (window.end - window.start) * 0.12;
  const pathLength = useTransform(progress, [window.start, revealEnd], [0, 1]);
  const dotOpacity = useTransform(progress, [window.start, revealEnd], [0, 1]);

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
          e.preventDefault();
          onSelect();
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
  );
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
  items: Item[];
  windows: Span[];
  accent: string;
  span: Span;
  progress: MotionValue<number>;
  disabled: boolean;
} & VisualInteraction) {
  const input = holdWindow(span.start, span.end, 0.05, 0.08);
  const barRevealEnd = span.start + (span.end - span.start) * 0.04;
  const barSettleEnd = span.start + (span.end - span.start) * 0.1;
  const wrapOpacity = useTransform(progress, [span.start, barRevealEnd], [0, 1]);
  const onsetX = useTransform(progress, [span.start, barRevealEnd, barSettleEnd, span.end], [-16, 0, 0, 0]);
  const durationX = useTransform(progress, [span.start, barRevealEnd, barSettleEnd, span.end], [16, 0, 0, 0]);

  return (
    <motion.div
      style={disabled ? undefined : { opacity: wrapOpacity }}
      className="space-y-2.5"
    >
      <div className="flex gap-8 text-xs tracking-[0.08em] text-neutral-500">
        <span className="w-20 shrink-0" />
        <motion.span style={disabled ? undefined : { x: onsetX }} className="flex-1">
          Onset
        </motion.span>
        <motion.span style={disabled ? undefined : { x: durationX }} className="flex-1">
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
  );
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
  item: Item;
  accent: string;
  window: Span;
  progress: MotionValue<number>;
  disabled: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const onsetPct = item.stat?.onset.pct ?? 0;
  const durationPct = item.stat?.duration.pct ?? 0;
  const revealEnd = window.start + (window.end - window.start) * 0.04;
  const onsetScale = useTransform(progress, [window.start, revealEnd], [0, onsetPct / 100]);
  const durationScale = useTransform(progress, [window.start, revealEnd], [0, durationPct / 100]);

  if (!item.stat) return null;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      style={{ opacity: isDimmed ? 0.4 : 1 }}
      className="flex cursor-pointer items-center gap-8 rounded-md px-3 -mx-3 py-1.5 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
            style={{ backgroundColor: accent, scaleX: disabled ? item.stat.onset.pct / 100 : onsetScale }}
            className="h-full origin-left rounded-full transition-[height] duration-200"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">{item.stat.onset.label}</p>
      </div>
      <div className="flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            style={{ backgroundColor: accent, scaleX: disabled ? item.stat.duration.pct / 100 : durationScale }}
            className="h-full origin-left rounded-full"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">{item.stat.duration.label}</p>
      </div>
    </div>
  );
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
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const raw = (x - Math.floor(x)) * 2 - 1;
  return Math.round(raw * 100) / 100;
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
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = (index / total) * 0.13;
  const end = start + 0.08;
  const outStart = 0.24 + (index / total) * 0.08;
  const outEnd = outStart + 0.08;
  const tilt = wiggle(index + 100) * 5;

  const input = [start, end, outStart, outEnd];
  const scale = useTransform(progress, input, [1, 1, 1, 0.92]);
  const rotate = useTransform(progress, input, [0, 0, 0, -tilt * 0.5]);
  const y = useTransform(progress, input, [0, 0, 0, -14]);
  const opacity = useTransform(progress, input, [1, 1, 1, 0.8]);

  if (disabled) return <>{word} </>;

  return (
    <motion.span
      style={{ scale, rotate, y, opacity }}
      className="inline-block will-change-transform"
    >
      {word}
      <span className="inline-block w-[0.26em]" />
    </motion.span>
  );
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
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const outStart = 0.76 + (index / total) * 0.12;
  const outEnd = Math.min(outStart + 0.1, 1);
  const tilt = wiggle(index) * 14;

  const input = [0, outStart, outEnd];
  const scale = useTransform(progress, input, [1, 1, 0.9]);
  const rotate = useTransform(progress, input, [0, 0, -tilt * 0.4]);
  const y = useTransform(progress, input, ["0%", "0%", "-28%"]);
  const opacity = useTransform(progress, input, [1, 1, 0.86]);
  const blur = useTransform(
    progress,
    input,
    ["blur(0px)", "blur(0px)", "blur(4px)"]
  );

  if (disabled) return <span className="inline-block">{char}</span>;

  return (
    <motion.span
      style={{ scale, rotate, y, opacity, filter: blur }}
      className="inline-block will-change-transform"
    >
      {char}
    </motion.span>
  );
}
