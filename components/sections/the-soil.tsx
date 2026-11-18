"use client"

import { Fragment, useRef, type CSSProperties, type ReactNode } from "react"
import Image from "next/image"
import { SOIL_SOURCES } from "@/lib/soil-sources"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

/* ------------------------------------------------------------------ */
/* Content. This is DRAFT copy, written from the photos and from what   */
/* the rest of the site already says, for the growers to revise. Lines  */
/* marked CONFIRM are guesses about how the grow is actually run.       */
/* Swap the image `src` values for Cloudinary URLs when they're ready.  */
/* ------------------------------------------------------------------ */

const HERO = {
  heading: "Living soil",
  lead: "A real ecosystem under every plant. We feed the soil, and the soil feeds the flower.",
  image: {
    src: "/soil/bed.jpg",
    alt: "Cannabis stems rising from fabric pots filled with dark living soil, each marked with a small plant tag",
  },
}

const INTRO = {
  statement:
    "We don't empty the beds after harvest. The same soil grows the next round, and the round after that.",
  paragraphs: [
    // CONFIRM: what the mix is actually built from.
    "Each bed is built on compost and kept alive by worms, fungi and microbes. They break down what we add at the surface into food the roots can take up, so nothing synthetic goes into the feed.",
    "Leaving the soil alone is the point. Digging tears up the fungal threads and the channels that old roots and worms leave behind. Left in place, they are there for the next plant.",
  ],
}

const CHAPTERS = [
  {
    heading: "The cover crop",
    paragraphs: [
      // CONFIRM: which species are sown.
      "Under the canopy we grow a low green carpet. Its roots keep the soil life fed, and its leaves shade the surface so the bed stays damp.",
      // CONFIRM: that it is cut and left in place.
      "When it gets tall we cut it back and leave the cuttings where they fall. They become the next layer of mulch.",
    ],
    image: {
      src: "/soil/cover-crop.jpg",
      alt: "A dense green cover crop growing across the surface of a living soil bed, around the base of cannabis stems",
    },
    caption: "Cover crop filling in around the stems.",
  },
  {
    heading: "The mulch",
    paragraphs: [
      "The soil is never left bare. A layer of straw and dried leaves covers the surface, holds the moisture in and slowly breaks down into the bed.",
      // CONFIRM: that roots are left in the bed after harvest.
      "After harvest the stalk is cut at the base and the roots stay in the ground. The next plant goes in beside them.",
    ],
    image: {
      src: "/soil/mulch.jpg",
      alt: "Straw and dried leaves mulching a living soil bed, with young cover crop seedlings coming up around a cannabis stem",
    },
    caption:
      "Straw and old leaves over the bed, with new cover crop coming through.",
  },
]


/* ------------------------------------------------------------------ */

const GUTTER = "px-5 sm:px-8 lg:px-14"

export function TheSoil() {
  return (
    <article className="bg-neutral-900 text-neutral-50">
      <Hero />
      <Intro />
      {CHAPTERS.map((chapter, index) => (
        <Chapter
          key={chapter.image.src}
          chapter={chapter}
          refNumber={index + 2}
          flip={index % 2 === 1}
        />
      ))}
      <Sources />
    </article>
  )
}

/**
 * The opening. On desktop the screen pins: the heading sits bottom-left
 * and the photo is a tall window on the right, which swipes open across
 * the heading until it fills the screen, the picture sliding inside its
 * frame as it goes.
 *
 * The words are masked by the photo rather than buried under it: a second
 * copy of the heading sits above the photo, clipped to exactly the photo's
 * window and blended with `difference`. So wherever the picture has passed
 * over a letter, that part of the letter becomes a negative of the photo
 * behind it, and the split follows the photo's edge.
 *
 * The scroll values are handed to CSS as custom properties, and the
 * classes that read them are all `lg:motion-safe:`. So phones and Reduce
 * Motion get a plain stacked heading and photo from the same markup, with
 * no layout switch after hydration.
 */
function Hero() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const p = useTransform(scrollYProgress, [0, 0.85], [0, 1])
  const clipLeft = useTransform(p, [0, 1], ["58%", "0%"])
  const clipRight = useTransform(p, [0, 1], ["3.5%", "0%"])
  const clipTop = useTransform(p, [0, 1], ["4%", "0%"])
  const clipBottom = useTransform(p, [0, 1], ["6%", "0%"])
  const shift = useTransform(p, [0, 1], ["27vw", "0vw"])
  const scale = useTransform(p, [0, 1], [1.12, 1])

  const vars = {
    "--cl": clipLeft,
    "--cr": clipRight,
    "--ct": clipTop,
    "--cb": clipBottom,
    "--shift": shift,
    "--scale": scale,
  } as unknown as CSSProperties

  const WINDOW =
    "lg:motion-safe:[clip-path:inset(var(--ct)_var(--cr)_var(--cb)_var(--cl))]"

  return (
    <div ref={trackRef} className="relative lg:motion-safe:h-[220vh]">
      <div className="pt-28 lg:pt-20 lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-svh lg:motion-safe:overflow-hidden">
        <motion.div style={vars} className="relative lg:motion-safe:h-full">
          <HeroText />

          <figure
            className={`relative mt-12 aspect-[4/5] overflow-hidden sm:aspect-[3/2] lg:motion-safe:absolute lg:motion-safe:inset-0 lg:motion-safe:mt-0 lg:motion-safe:aspect-auto ${WINDOW}`}
          >
            <div className="absolute inset-0 lg:motion-safe:[transform:translateX(var(--shift))_scale(var(--scale))] lg:motion-safe:will-change-transform">
              <Image
                src={HERO.image.src}
                alt={HERO.image.alt}
                fill
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          </figure>

          {/* The negative copy, visible only inside the photo's window. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 hidden mix-blend-difference lg:motion-safe:block ${WINDOW}`}
          >
            <HeroText overPhoto />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/** The hero's words. Rendered twice at the same spot: once solid (the
 * real <h1>), once for the layer above the photo. */
function HeroText({ overPhoto = false }: { overPhoto?: boolean }) {
  const Heading = overPhoto ? "div" : "h1"
  return (
    <div
      className={`${GUTTER} lg:motion-safe:absolute lg:motion-safe:bottom-[9%] lg:motion-safe:left-0 lg:motion-safe:w-[60%]`}
    >
      <Heading
        className={`font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.88] uppercase ${
          overPhoto ? "text-neutral-50" : ""
        }`}
      >
        {HERO.heading.split(" ").map((word, index) => (
          <Fragment key={word}>
            {index > 0 && " "}
            <span className="block">{word}</span>
          </Fragment>
        ))}
      </Heading>
      <p
        className={`mt-7 max-w-md text-lg leading-relaxed text-neutral-300 sm:text-xl ${
          overPhoto ? "invisible" : ""
        }`}
      >
        {HERO.lead}
      </p>
    </div>
  )
}

/**
 * The opening statement, set like the site's other headlines: full width,
 * uppercase, heavy. The words start dim and light up one after another as
 * the block scrolls through the screen. The two paragraphs sit in the
 * right half, so the block reads headline first, then detail, instead of
 * everything hugging the left edge.
 */
function Intro() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  })
  const words = INTRO.statement.split(" ")

  return (
    <section className={`${GUTTER} py-24 sm:py-36`}>
      <p
        ref={ref}
        className="font-display text-[clamp(2.25rem,6.2vw,6.5rem)] leading-[0.92] uppercase"
      >
        {words.map((word, index) => (
          <Fragment key={index}>
            <LitWord
              progress={scrollYProgress}
              start={index / words.length}
              end={(index + 1) / words.length}
              disabled={!!reduce}
            >
              {word}
            </LitWord>{" "}
          </Fragment>
        ))}
        <Ref n={1} />
      </p>

      <div className="mt-14 grid gap-8 sm:mt-20 sm:grid-cols-2 sm:gap-12 lg:ml-auto lg:w-[58%]">
        {INTRO.paragraphs.map((text) => (
          <p key={text} className="text-lg leading-relaxed text-neutral-300">
            {text}
          </p>
        ))}
      </div>
    </section>
  )
}

/** One word of the statement: dim until the scroll reaches its slot. */
function LitWord({
  children,
  progress,
  start,
  end,
  disabled,
}: {
  children: ReactNode
  progress: MotionValue<number>
  start: number
  end: number
  disabled: boolean
}) {
  const opacity = useTransform(progress, [start, end], [0.22, 1])
  return (
    <motion.span style={disabled ? undefined : { opacity }}>
      {children}
    </motion.span>
  )
}

function Chapter({
  chapter,
  refNumber,
  flip,
}: {
  chapter: (typeof CHAPTERS)[number]
  refNumber: number
  flip: boolean
}) {
  return (
    <section className={`${GUTTER} pb-24 sm:pb-36`}>
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
        <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          <SwipeFigure image={chapter.image} from={flip ? "right" : "left"} />
          <p className="mt-4 text-sm text-neutral-400">{chapter.caption}</p>
        </div>

        <div className={`lg:col-span-5 lg:pb-12 ${flip ? "lg:order-1" : ""}`}>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.9] uppercase">
            {chapter.heading}
          </h2>
          <div className="mt-8 space-y-6">
            {chapter.paragraphs.map((text, index) => (
              <p
                key={text}
                className="max-w-md text-lg leading-relaxed text-neutral-300"
              >
                {text}
                {index === 0 && <Ref n={refNumber} />}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * A photo that swipes open from one side as it scrolls into view, while
 * the picture drifts slowly inside the frame. Same CSS-variable approach
 * as the hero: with Reduce Motion the photo simply sits there.
 */
function SwipeFigure({
  image,
  from,
}: {
  image: { src: string; alt: string }
  from: "left" | "right"
}) {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress: reveal } = useScroll({
    target: ref,
    offset: ["start 95%", "start 40%"],
  })
  const { scrollYProgress: travel } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const closed = useTransform(reveal, [0, 1], ["55%", "0%"])
  const drift = useTransform(travel, [0, 1], ["-5%", "5%"])

  const vars = {
    "--l": from === "right" ? closed : "0%",
    "--r": from === "left" ? closed : "0%",
    "--drift": drift,
  } as unknown as CSSProperties

  return (
    <motion.figure
      ref={ref}
      style={vars}
      className="relative aspect-[3/2] overflow-hidden motion-safe:[clip-path:inset(0_var(--r)_0_var(--l))]"
    >
      <div className="absolute inset-0 motion-safe:[transform:translateY(var(--drift))_scale(1.12)] motion-safe:will-change-transform">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
      </div>
    </motion.figure>
  )
}

/** A footnote marker that jumps to its entry in the Sources list. */
function Ref({ n }: { n: number }): ReactNode {
  return (
    <sup className="ml-1 font-sans text-[13px] font-normal tracking-normal">
      <a
        href={`#source-${n}`}
        aria-label={`Source ${n}`}
        className="rounded-sm px-0.5 text-neutral-400 underline-offset-2 hover:text-neutral-50 hover:underline focus-visible:outline-2 focus-visible:outline-neutral-50"
      >
        {n}
      </a>
    </sup>
  )
}

function Sources() {
  return (
    <section
      aria-labelledby="soil-sources-heading"
      className={`${GUTTER} py-16 sm:py-20`}
    >
      <h2 id="soil-sources-heading" className="font-display text-2xl">
        Sources
      </h2>
      <ol className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-neutral-300">
        {SOIL_SOURCES.map((source, index) => (
          <li
            key={index}
            id={`source-${index + 1}`}
            className="flex scroll-mt-28 gap-4"
          >
            <span className="w-5 shrink-0 text-neutral-400 tabular-nums">
              {index + 1}
            </span>
            <a
              href={source.href}
              target="_blank"
              rel="noopener"
              className="underline decoration-neutral-600 underline-offset-4 hover:text-neutral-50 hover:decoration-neutral-50 focus-visible:outline-2 focus-visible:outline-neutral-50"
            >
              {source.text}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
