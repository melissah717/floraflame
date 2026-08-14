"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Recycle, Microscope, Sprout, Gem, Layers } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { SectionLabel } from "@/components/scroll-primitives";
import { RGB } from "@/lib/spectrum";

gsap.registerPlugin(Flip);

const HEADLINE = "Living soil is a whole system.";

const LEAD =
  "Not a bag of dirt. A living root zone built from compost, minerals, fungi, bacteria, worms, mulch, and time.";

const PRINCIPLES = [
  {
    n: "01",
    eyebrow: "Feed the soil",
    title: "The plant eats through biology",
    body: "Microbes break down organic matter and make nutrients available near the roots. The grower feeds that ecosystem, then the ecosystem feeds the plant.",
  },
  {
    n: "02",
    eyebrow: "Keep the bed alive",
    title: "No till means no reset button",
    body: "The soil is reused cycle after cycle. Roots, mulch, cover crop, and compost keep structure intact so fungal networks and microbial life can keep building.",
  },
  {
    n: "03",
    eyebrow: "Let the plant speak",
    title: "Less force, more expression",
    body: "Living soil gives the plant a wider pantry to pull from. That supports fuller aroma, cleaner flavor, and a finish that feels less one dimensional.",
  },
];

const SOIL_SIGILS = [
  {
    label: "Mulch",
    note: "protect",
    detail: "Keeps the surface covered so moisture stays steady and the bed does not dry out between waterings. It also breaks down slowly on its own, adding another layer of organic matter back into the system over time.",
    color: RGB.hybrid,
  },
  {
    label: "Compost",
    note: "feed",
    detail: "Adds slow-release organic matter that microbes can break down into plant-available nutrition. Built from food scraps, plant material, and manure, it is the base layer everything else in the bed builds on.",
    color: RGB.slate,
  },
  {
    label: "Fungi",
    note: "connect",
    detail: "Mycorrhizal networks help roots reach water and nutrients beyond the root zone itself. In exchange, the plant feeds the fungi sugars it makes through photosynthesis, a trade that keeps both sides healthy.",
    color: RGB.indica,
  },
  {
    label: "Worms",
    note: "aerate",
    detail: "Worm movement opens tiny air channels and turns organic matter into rich castings. Those castings end up some of the most nutrient dense material anywhere in the bed.",
    color: RGB.red,
  },
  {
    label: "Minerals",
    note: "balance",
    detail: "Rock dust and mineral amendments support trace elements that shape plant health and expression. Even small amounts can round out flavor and help the plant handle stress.",
    color: RGB.sativa,
  },
];

const SOIL_FLOW = [
  {
    label: "Compost",
    note: "Organic matter breaks down",
    icon: Recycle,
    color: RGB.slate,
  },
  {
    label: "Microbes",
    note: "Biology unlocks the nutrients",
    icon: Microscope,
    color: RGB.hybrid,
  },
  {
    label: "Roots",
    note: "The plant takes up what it needs",
    icon: Sprout,
    color: RGB.sativa,
  },
  {
    label: "Minerals",
    note: "Trace elements round it out",
    icon: Gem,
    color: RGB.indica,
  },
];

const GUTTER = "px-5 sm:px-8 lg:px-14";

function withAlpha(rgb: string, alpha: number) {
  return rgb.replace(/\)$/, ` / ${alpha})`);
}

export function LivingSoil() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: bodyProgress } = useScroll({
    target: bodyRef,
    offset: ["start end", "end center"],
  });

  const heroY = useTransform(heroProgress, [0, 1], [28, -36]);
  const heroOpacity = useTransform(heroProgress, [0, 0.08, 0.82, 1], [0, 1, 1, 0.52]);

  return (
    <section ref={sectionRef} id="living-soil" className="scroll-mt-20 bg-neutral-900 text-neutral-50">
      <div
        ref={heroRef}
        className={`relative overflow-hidden pt-20 pb-20 sm:pt-28 sm:pb-28 ${GUTTER}`}
      >
        <SoilAtmosphere />

        <div className="relative grid min-h-[calc(100vh-9rem)] gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.9fr)] lg:items-center">
          <motion.div style={reduce ? undefined : { y: heroY, opacity: heroOpacity }}>
            <SectionLabel number="01" tone="light">
              The Method
            </SectionLabel>

            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.9] uppercase sm:text-7xl lg:text-8xl">
              {HEADLINE.split(" ").map((word, index, words) => (
                <Fragment key={`${word}-${index}`}>
                  <HeroWord word={word} index={index} disabled={!!reduce} />
                  {/* Each word is its own inline-block span (for the
                      slide-up reveal) with no actual whitespace text node
                      between them, so browsers have nowhere to break the
                      line — invisible on desktop where the sentence fits
                      on one line anyway, but on mobile it can't wrap and
                      silently overflows past the hero's overflow-hidden.
                      wbr is an explicit, invisible break opportunity —
                      exactly this case — without adding real spacing. */}
                  {index < words.length - 1 && <wbr />}
                </Fragment>
              ))}
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-neutral-300 sm:text-2xl">
              {LEAD}
            </p>
          </motion.div>

          <SoilProfile progress={heroProgress} disabled={!!reduce} />
        </div>
      </div>

      <div ref={bodyRef} className={`relative py-20 sm:py-28 ${GUTTER}`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          {/* This min-height sets how long the sticky graphic stays
              pinned before it releases and scrolls away with the rest of
              the row — sized (by hand, against the actual description
              copy) so release lands around the graphic's own vertical
              midpoint rather than continuing long after the description
              text has already ended, which just left a dead gap below. */}
          <div className="relative min-h-[28rem] lg:min-h-[65rem]">
            <div className="lg:sticky lg:top-28">
              <SoilSystemVisual progress={bodyProgress} disabled={!!reduce} />
            </div>
          </div>

          <div>
            <p className="max-w-3xl font-display text-3xl leading-[1.05] sm:text-5xl">
              No shortcuts, no synthetic push. Just a bed that gets better when it is cared for.
            </p>

            <div className="mt-16 sm:mt-20">
              {PRINCIPLES.map((point, index) => (
                <PrincipleRow
                  key={point.n}
                  point={point}
                  index={index}
                  total={PRINCIPLES.length}
                  progress={bodyProgress}
                  disabled={!!reduce}
                />
              ))}
            </div>
          </div>
        </div>

        <ClosingSoilLine progress={bodyProgress} disabled={!!reduce} />
      </div>
    </section>
  );
}

function SoilAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute top-16 right-[-10rem] h-80 w-80 rounded-full blur-3xl sm:h-[32rem] sm:w-[32rem]"
        style={{ backgroundColor: withAlpha(RGB.hybrid, 0.12) }}
      />
      <div
        className="absolute bottom-[-10rem] left-[-12rem] h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: withAlpha(RGB.sativa, 0.1) }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(RGB.hybrid, 0.55)}, transparent)`,
        }}
      />
    </div>
  );
}

function SoilProfile({
  progress,
  disabled,
}: {
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const isShufflingRef = useRef(false);
  const returningIndexRef = useRef<number | null>(null);
  const y = useTransform(progress, [0, 1], [18, -18]);
  const rotate = useTransform(progress, [0, 1], [-0.8, 0.8]);
  const ringScale = useTransform(progress, [0.05, 0.28], [0.9, 1]);
  const ringOpacity = useTransform(progress, [0.04, 0.2], [0, 1]);

  useLayoutEffect(() => {
    if (disabled || !gridRef.current || !flipStateRef.current) {
      flipStateRef.current = null;
      return;
    }

    const ctx = gsap.context(() => {
      const cardFaces = gridRef.current!.querySelectorAll("[data-soil-token-inner]");
      const returningCard = gridRef.current!.querySelector("[data-soil-returning='true']");

      Flip.from(flipStateRef.current!, {
        absolute: false,
        duration: 0.5,
        ease: "power2.inOut",
        nested: true,
        prune: true,
        stagger: {
          amount: 0.04,
          from: "start",
        },
        onStart: () => {
          if (returningCard) {
            gsap.set(returningCard, { zIndex: 0 });
          }

          gsap.to(cardFaces, {
            opacity: 0.34,
            scale: 0.9,
            duration: 0.12,
            ease: "power2.out",
          });
        },
        onComplete: () => {
          flipStateRef.current = null;
          gsap.to(cardFaces, {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(gridRef.current!.querySelectorAll("[data-soil-token]"), {
                clearProps: "zIndex",
              });
              returningIndexRef.current = null;
              isShufflingRef.current = false;
            },
          });
        },
      });
    }, gridRef);

    return () => {
      isShufflingRef.current = false;
      ctx.revert();
    };
  }, [selectedIndex, disabled]);

  function handleSigilSelect(index: number) {
    if (isShufflingRef.current) return;

    returningIndexRef.current = selectedIndex;
    const cards = gridRef.current?.querySelectorAll("[data-soil-token]");
    const cardFaces = gridRef.current?.querySelectorAll("[data-soil-token-inner]");

    if (disabled || !cards?.length || !cardFaces?.length) {
      setSelectedIndex((current) => (current === index ? null : index));
      return;
    }

    isShufflingRef.current = true;
    gsap.killTweensOf(cardFaces);
    gsap.to(cardFaces, {
      scale: 0.92,
      opacity: 0.28,
      duration: 0.12,
      ease: "power2.out",
      transformOrigin: "50% 50%",
      onComplete: () => {
        flipStateRef.current = Flip.getState(cards);
        setSelectedIndex((current) => (current === index ? null : index));
      },
    });
  }

  return (
    <motion.div
      style={disabled ? undefined : { y, rotate }}
      className="relative mx-auto w-full max-w-[29rem]"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-[#0b0a08] p-4 shadow-[0_32px_90px_rgb(0_0_0_/_0.5)] sm:p-5">
        <div className="flex items-center justify-between text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
          <span>Living Soil</span>
          <span>Ingredients</span>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[1rem] border border-neutral-800 bg-[#090805] p-4 sm:p-5">
          <div aria-hidden className="absolute inset-0 opacity-80">
            <div
              className="absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: withAlpha(RGB.hybrid, 0.18) }}
            />
            <div
              className="absolute bottom-[-5rem] right-[-4rem] h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: withAlpha(RGB.sativa, 0.14) }}
            />
          </div>

          <motion.div
            style={disabled ? undefined : { scale: ringScale, opacity: ringOpacity }}
            className="relative mb-5 min-h-32 overflow-hidden rounded-[1rem] border border-neutral-800 bg-neutral-950/70 p-5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04),0_0_50px_rgb(251_176_58_/_0.1)]"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ backgroundColor: withAlpha(RGB.hybrid, 0.8) }}
            />
            <div
              aria-hidden
              className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full blur-2xl"
              style={{ backgroundColor: withAlpha(RGB.hybrid, 0.2) }}
            />
            <div className="relative flex h-full items-center justify-between gap-5">
              <div>
                <p className="font-display text-3xl leading-none">Soil</p>
                <p className="mt-2 text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
                  Living inputs
                </p>
              </div>
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: withAlpha(RGB.hybrid, 0.62),
                  backgroundColor: withAlpha(RGB.hybrid, 0.12),
                  color: RGB.hybrid,
                }}
              >
                <Layers className="h-6 w-6" strokeWidth={1.75} />
              </div>
            </div>
            <span
              aria-hidden
              className="absolute bottom-0 left-5 h-1 w-28 rounded-full blur-sm"
              style={{ backgroundColor: withAlpha(RGB.hybrid, 0.42) }}
            />
          </motion.div>

          <div ref={gridRef} className="relative grid h-[32rem] grid-cols-2 grid-rows-4 gap-3">
            {SOIL_SIGILS.map((sigil, index) => (
              <SoilSigil
                key={sigil.label}
                sigil={sigil}
                index={index}
                isSelected={selectedIndex === index}
                hasSelection={selectedIndex !== null}
                isReturning={returningIndexRef.current === index}
                slotClass={soilSlotClass(index, selectedIndex)}
                onSelect={() => handleSigilSelect(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SoilSigil({
  sigil,
  index,
  isSelected,
  hasSelection,
  isReturning,
  slotClass,
  onSelect,
}: {
  sigil: (typeof SOIL_SIGILS)[number];
  index: number;
  isSelected: boolean;
  hasSelection: boolean;
  isReturning: boolean;
  slotClass: string;
  onSelect: () => void;
}) {
  return (
    <div
      data-soil-token={sigil.label}
      data-soil-returning={isReturning ? "true" : undefined}
      className={`
        relative min-h-0 ${isReturning ? "z-0" : "z-10"} ${slotClass}
      `}
    >
      <button
        type="button"
        aria-expanded={isSelected}
        onClick={onSelect}
        data-soil-token-inner
        className={`
          group relative h-full w-full overflow-hidden rounded-[1rem] border border-neutral-800
          bg-neutral-950/70 text-left shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]
          transition-colors duration-300 hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500
          ${hasSelection && !isSelected ? "p-3" : "p-4"}
        `}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: sigil.color }}
        />
        <div
          aria-hidden
          className="absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full blur-2xl"
          style={{ backgroundColor: withAlpha(sigil.color, 0.16) }}
        />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sigil.color }} />
              <span
                className={hasSelection && !isSelected ? "h-px w-6" : "h-px w-10"}
                style={{ backgroundColor: withAlpha(sigil.color, 0.62) }}
              />
            </div>
            <span className="text-[10px] tracking-[0.2em] text-neutral-600 tabular-nums">
              0{index + 1}
            </span>
          </div>

          <div>
            <div
              aria-hidden
              className={hasSelection && !isSelected ? "mb-3 h-1.5 w-10 rounded-full" : "mb-4 h-2 w-16 rounded-full"}
              style={{ backgroundColor: sigil.color }}
            />
            <p className={hasSelection && !isSelected ? "font-display text-xl leading-none" : "font-display text-2xl leading-none"}>
              {sigil.label}
            </p>
            <p className="mt-2 text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
              {sigil.note}
            </p>
            {isSelected && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400"
              >
                {sigil.detail}
              </motion.p>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

function soilSlotClass(index: number, selectedIndex: number | null) {
  if (selectedIndex === null) {
    return [
      "col-start-1 row-start-1",
      "col-start-2 row-start-1",
      "col-start-1 row-start-2",
      "col-start-2 row-start-2",
      "col-start-1 col-span-2 row-start-3 row-span-2",
    ][index];
  }

  if (index === selectedIndex) {
    return "col-start-1 col-span-2 row-start-1 row-span-2";
  }

  const slot = SOIL_SIGILS.map((_, sigilIndex) => sigilIndex)
    .filter((sigilIndex) => sigilIndex !== selectedIndex)
    .indexOf(index);

  return [
    "col-start-1 row-start-3",
    "col-start-2 row-start-3",
    "col-start-1 row-start-4",
    "col-start-2 row-start-4",
  ][slot];
}

function SoilSystemVisual({
  progress,
  disabled,
}: {
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const reveal = useTransform(progress, [0.01, 0.26], [0.94, 1]);
  const opacity = useTransform(progress, [0.01, 0.18], [0, 1]);

  return (
    <motion.div
      style={disabled ? undefined : { scale: reveal, opacity }}
      className="relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-[#0c0b09] p-6 shadow-[0_26px_80px_rgb(0_0_0_/_0.42)] sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 20% 0%, ${withAlpha(RGB.hybrid, 0.16)}, transparent 60%)`,
        }}
      />

      <p className="relative text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
        The cycle
      </p>

      <div className="relative mt-5 flex flex-col">
        {SOIL_FLOW.map((step, index) => (
          <SoilFlowStep
            key={step.label}
            step={step}
            index={index}
            isLast={index === SOIL_FLOW.length - 1}
            progress={progress}
            disabled={disabled}
          />
        ))}
      </div>
    </motion.div>
  );
}

/** One stop in the cycle, connected to the next by a thin vertical line
 * running behind the icons — compost breaks down, microbes unlock it,
 * roots take it up, minerals round it out. A straight read top to bottom
 * instead of a diagram trying to force a literal circle. */
function SoilFlowStep({
  step,
  index,
  isLast,
  progress,
  disabled,
}: {
  step: (typeof SOIL_FLOW)[number];
  index: number;
  isLast: boolean;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const Icon = step.icon;
  const start = 0.02 + index * 0.05;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const x = useTransform(progress, [start, start + 0.12], [-12, 0]);

  return (
    <motion.div
      style={disabled ? undefined : { opacity, x }}
      className="relative flex items-start gap-4 py-2.5"
    >
      {!isLast && (
        <div
          aria-hidden
          className="absolute top-[3.1rem] left-[1.5rem] h-[calc(100%-1.6rem)] w-px"
          style={{ backgroundColor: withAlpha(RGB.hybrid, 0.28) }}
        />
      )}
      <div
        className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-neutral-950"
        style={{ borderColor: withAlpha(step.color, 0.55), color: step.color }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="pt-1.5">
        <p className="font-display text-lg leading-none">{step.label}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{step.note}</p>
      </div>
    </motion.div>
  );
}

function PrincipleRow({
  point,
  index,
  total,
  progress,
  disabled,
}: {
  point: (typeof PRINCIPLES)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const start = 0.02 + (index / total) * 0.42;
  const end = start + 0.18;
  const y = useTransform(progress, [start, end], [42, 0]);
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const ruleScale = useTransform(progress, [start, end], [0, 1]);

  return (
    <div className="relative py-10 sm:py-14">
      <motion.div
        style={{
          scaleX: disabled ? 1 : ruleScale,
          backgroundColor: index === 0 ? RGB.hybrid : index === 1 ? RGB.sativa : RGB.red,
        }}
        className="absolute inset-x-0 top-0 h-px origin-left"
      />

      <motion.div
        style={disabled ? undefined : { y, opacity }}
        className="grid gap-5 lg:grid-cols-[5rem_minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-8"
      >
        <span className="text-xs tabular-nums tracking-[0.16em] text-neutral-500">
          {point.n}
        </span>
        <div>
          <p className="text-[10px] tracking-[0.18em] text-neutral-500 uppercase">
            {point.eyebrow}
          </p>
          <h3 className="mt-2 font-display text-3xl leading-tight">
            {point.title}
          </h3>
        </div>
        <p className="text-lg leading-relaxed text-neutral-400">{point.body}</p>
      </motion.div>
    </div>
  );
}

function ClosingSoilLine({
  progress,
  disabled,
}: {
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const y = useTransform(progress, [0.54, 0.7], [28, 0]);
  const opacity = useTransform(progress, [0.54, 0.7], [0, 1]);

  return (
    <motion.p
      style={disabled ? undefined : { y, opacity }}
      className="mt-24 max-w-4xl font-display text-4xl leading-[1.05] sm:mt-32 sm:text-6xl"
    >
      The flavor starts before the flower. It starts in the bed.
    </motion.p>
  );
}

function HeroWord({
  word,
  index,
  disabled,
}: {
  word: string;
  index: number;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-block whitespace-nowrap">
        {word}
        <span className="inline-block w-[0.24em]" />
      </span>
    );
  }

  // A one-time mount animation, not scroll-linked — this headline sits at
  // the very top of the page with nothing above it, so there's no "scroll
  // it into view" moment for a progress value to track: at mount, scroll
  // position (and so the derived progress) could be anywhere, catching a
  // word mid-slide with no scrolling ever having happened. initial/animate
  // always starts from a known hidden state regardless, same pattern as
  // hero.tsx's own headline reveal.
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block whitespace-nowrap"
      >
        {word}
        <span className="inline-block w-[0.24em]" />
      </motion.span>
    </span>
  );
}
