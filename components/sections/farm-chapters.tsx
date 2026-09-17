"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import { cn } from "@/lib/utils"
import { useLenis } from "@/components/smooth-scroll"

/**
 * Scroll-snapped chapter carousel for the farm page.
 *
 * Each chapter owns one full viewport. The stage is pinned while a tall
 * wrapper scrolls underneath it, and the same scroll progress drives two
 * tracks at once:
 *   – LEFT: a padded portrait frame per chapter, stacked vertically, so it
 *     scrolls away up the page the way normal content would. Inside the
 *     frame a small set of photos hard-cuts on a timer (no crossfade).
 *   – RIGHT: one big feature photo/video per chapter, laid out side by
 *     side, so vertical scroll slides them in horizontally.
 * A chapter title sits dead centre in mix-blend-difference (white over
 * black, inverted over photos) and flips word-by-word when the chapter
 * changes. A caption pill at the bottom names what you're looking at.
 *
 * Snapping: Lenis owns the wheel, so CSS scroll-snap can't be used. A
 * small idle-settle (see below) lands each gesture on the nearest chapter
 * while inside the section and stays out of the way elsewhere.
 */

type Frame = { src: string; alt: string }
type Feature =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string }
type Chapter = {
  title: string
  caption: string
  frames: Frame[]
  feature: Feature
}

const IMG = "https://res.cloudinary.com/g0mcdcfr/image/upload"
const VID = "https://res.cloudinary.com/g0mcdcfr/video/upload"

const CHAPTERS: Chapter[] = [
  {
    title: "The room",
    caption: "The Oakland facility, floor to ceiling",
    frames: [
      { src: `${IMG}/v1786484376/top-aisle-view.jpg`, alt: "Top of the aisle, Oakland facility" },
      { src: `${IMG}/v1786484376/aisle-center-view.jpg`, alt: "Center aisle, Oakland facility" },
    ],
    feature: {
      type: "video",
      src: `${VID}/v1786344108/DRONE_BOTTOMTOTOPPULL_dox1os.mp4`,
    },
  },
  {
    title: "The plants",
    caption: "Living soil beds. No-till, no synthetics.",
    frames: [
      { src: `${IMG}/v1786484377/bottom-shelf-view.jpg`, alt: "Bottom shelf, Oakland facility" },
      { src: `${IMG}/v1786484377/topshelf-view.jpg`, alt: "Top shelf, Oakland facility" },
    ],
    feature: {
      type: "image",
      src: `${IMG}/v1786498062/plant-pots.jpg`,
      alt: "Plant pots, Oakland facility",
    },
  },
  {
    title: "The hands",
    caption: "Hand-trimmed, hand-moved, hand-everything",
    frames: [
      { src: `${IMG}/v1786497578/forklift-work-guy.jpg`, alt: "Moving product with the forklift, Oakland facility" },
      { src: `${IMG}/v1786484376/aisle-center-view.jpg`, alt: "Center aisle, Oakland facility" },
    ],
    feature: {
      type: "image",
      src: `${IMG}/v1786492144/guy-work.jpg`,
      alt: "Hands at work, Oakland facility",
    },
  },
]

/** How long each photo in the left frame holds before the hard cut. */
const FRAME_HOLD_MS = 1400
/** Quiet time after the last wheel tick before settling onto a chapter. */
const WHEEL_SETTLE_MS = 120
/** Quiet time after a native (touch) scroll stops before settling. */
const TOUCH_SETTLE_MS = 160
/** How far short of the section (in viewports) a scroll heading toward it
 * can land and still get pulled onto the first/last chapter. */
const SNAP_REACH = 0.35
/** Movement (in viewports) a gesture has to make before it counts as
 * moving to the next chapter rather than a nudge. One wheel tick clears it. */
const SNAP_DEAD_ZONE = 0.08
const SNAP_EASE = (t: number) => 1 - Math.pow(1 - t, 4)

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw"

export function FarmChapters() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)
  const reduce = useReducedMotion()
  const lenis = useLenis()

  const count = CHAPTERS.length
  const steps = Math.max(count - 1, 1)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  })

  // Both tracks are laid out so one cell == 100% of the track's own box,
  // so the same percentage shift works as `y` on the left and `x` on the
  // right. Linear with scroll — the ease comes from Lenis + the snap.
  const shift = useTransform(scrollYProgress, (p) => `${-p * steps * 100}%`)

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(Math.max(Math.round(p * steps), 0), count - 1)
    if (next !== activeRef.current) {
      activeRef.current = next
      setActive(next)
    }
  })

  // One shared clock for the hard-cut slideshow in the active frame.
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setTick((t) => t + 1), FRAME_HOLD_MS)
    return () => window.clearInterval(id)
  }, [reduce])

  /** Page-Y of chapter i's snap point, and the stage height. */
  const measure = () => {
    const wrapper = wrapperRef.current
    const stage = stageRef.current
    if (!wrapper || !stage) return null
    const top = wrapper.getBoundingClientRect().top + window.scrollY
    return { top, h: stage.offsetHeight }
  }

  // Snapping. Lenis owns wheel/trackpad scrolling, so CSS scroll-snap is
  // out. Instead, once a gesture stops (debounced), look at where it's
  // going to land: inside the section, settle onto the nearest chapter;
  // anywhere else on the page, leave it alone. `SNAP_REACH` gives a small
  // pull-in when a scroll would land just short of the section.
  //   – wheel/trackpad: Lenis animates toward `targetScroll`, so judge
  //     from that rather than the position mid-glide.
  //   – touch: native (Lenis doesn't sync it), so wait for the momentum to
  //     die and judge from the real scroll position.
  useEffect(() => {
    if (!lenis || reduce) return
    let timer = 0

    // Where the scroll position was when the current gesture began, so
    // the settle knows which way the user was heading.
    let gestureStartY: number | null = null
    const begin = () => {
      if (gestureStartY === null) gestureStartY = lenis.scroll
    }

    const settle = (landingY: number, duration: number) => {
      const startY = gestureStartY ?? landingY
      gestureStartY = null
      const m = measure()
      if (!m) return

      const rel = (landingY - m.top) / m.h
      const dir = Math.sign(landingY - startY)
      const inside = rel >= 0 && rel <= steps
      // Outside the section only pull in when heading toward it, and only
      // from close by — never yank someone back who's scrolling away.
      const entering =
        (rel < 0 && dir > 0 && rel >= -SNAP_REACH) ||
        (rel > steps && dir < 0 && rel <= steps + SNAP_REACH)
      if (!inside && !entering) return

      // Step in the direction of travel: any gesture past the dead zone
      // moves at least one chapter, a long flick can skip several. Mirrors
      // how a mandatory CSS snap feels without needing one.
      const stepped =
        dir > 0 ? Math.ceil(rel - SNAP_DEAD_ZONE) : dir < 0 ? Math.floor(rel + SNAP_DEAD_ZONE) : Math.round(rel)
      const index = Math.min(Math.max(stepped, 0), steps)
      const target = Math.round(m.top + index * m.h)
      if (Math.abs(target - landingY) < 1) return
      lenis.scrollTo(target, { duration, easing: SNAP_EASE })
    }

    const offWheel = lenis.on("virtual-scroll", ({ event }) => {
      if (!(event instanceof WheelEvent)) return
      begin()
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const landing = Math.min(Math.max(lenis.targetScroll, 0), lenis.limit)
        settle(landing, 1)
      }, WHEEL_SETTLE_MS)
    })

    const offScroll = lenis.on("scroll", (l) => {
      if (l.isScrolling !== "native") return
      begin()
      window.clearTimeout(timer)
      timer = window.setTimeout(() => settle(window.scrollY, 0.8), TOUCH_SETTLE_MS)
    })

    // A finger landing mid-settle should take over immediately instead of
    // fighting the rest of the programmatic glide.
    const onTouchStart = () => {
      window.clearTimeout(timer)
      if (lenis.isScrolling === "smooth") lenis.scrollTo(lenis.scroll, { immediate: true })
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true })

    return () => {
      offWheel()
      offScroll()
      window.removeEventListener("touchstart", onTouchStart)
      window.clearTimeout(timer)
    }
  }, [lenis, reduce, steps])

  const chapter = CHAPTERS[active]

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(${count} * 100svh)` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 isolate flex h-svh w-full flex-col overflow-hidden bg-neutral-900 md:flex-row"
      >
        {/* LEFT — vertical track of padded frames */}
        <div className="relative h-1/2 w-full overflow-hidden md:h-full md:w-1/2">
          <motion.div
            style={reduce ? undefined : { y: shift }}
            className="flex h-full w-full flex-col will-change-transform"
          >
            {CHAPTERS.map((c, i) => (
              <FrameCell
                key={c.title}
                frames={c.frames}
                isActive={i === active}
                tick={tick}
                priority={i === 0}
                disabled={!!reduce}
              />
            ))}
          </motion.div>
        </div>

        {/* RIGHT — horizontal track of feature media */}
        <div className="relative h-1/2 w-full overflow-hidden md:h-full md:w-1/2">
          <motion.div
            style={reduce ? undefined : { x: shift }}
            className="flex h-full w-full will-change-transform"
          >
            {CHAPTERS.map((c, i) => (
              <FeatureCell
                key={c.title}
                feature={c.feature}
                isActive={i === active}
                priority={i === 0}
              />
            ))}
          </motion.div>
        </div>

        {/* TITLE — centred over the seam, inverted over photos. Every title
            stays mounted and is posed by where it sits relative to the
            active chapter (waiting below / on stage / gone above), so fast
            scrolling through several chapters can't strand one mid-swap the
            way an exit-then-enter presence could. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {CHAPTERS.map((c, i) => (
            <ChapterTitle
              key={c.title}
              title={c.title}
              pose={i === active ? "stage" : i < active ? "above" : "below"}
              disabled={!!reduce}
            />
          ))}
        </div>

        {/* CAPTION pill */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-5 sm:bottom-8">
          <motion.div
            key={chapter.title}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-full items-center gap-3 rounded-full border border-neutral-700/80 bg-neutral-900/70 px-4 py-2 text-xs tracking-[0.06em] text-neutral-200 backdrop-blur-md sm:px-5 sm:py-2.5"
          >
            <span className="shrink-0 tabular-nums text-neutral-500">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-3 w-px shrink-0 bg-neutral-700" />
            <span className="truncate">{chapter.caption}</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function FrameCell({
  frames,
  isActive,
  tick,
  priority,
  disabled,
}: {
  frames: Frame[]
  isActive: boolean
  tick: number
  priority: boolean
  disabled: boolean
}) {
  // Every frame stays mounted and stacked; only opacity flips, so the
  // hard cut never waits on a network request.
  const visible = isActive && !disabled ? tick % frames.length : 0

  return (
    <div className="relative h-full w-full shrink-0 p-4 sm:p-8 md:p-14 lg:p-24">
      <div className="relative h-full w-full overflow-hidden bg-black">
        {frames.map((f, i) => (
          <Image
            key={`${f.src}-${i}`}
            src={f.src}
            alt={f.alt}
            fill
            sizes={IMAGE_SIZES}
            priority={priority && i === 0}
            className={cn("object-cover", visible === i ? "opacity-100" : "opacity-0")}
          />
        ))}
      </div>
    </div>
  )
}

function FeatureCell({
  feature,
  isActive,
  priority,
}: {
  feature: Feature
  isActive: boolean
  priority: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Only the on-screen chapter's video runs; the rest sit paused on
  // their first frame instead of decoding off-screen.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [isActive])

  return (
    <div className="relative h-full w-full shrink-0 overflow-hidden bg-black">
      {feature.type === "video" ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={feature.src}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <Image
          src={feature.src}
          alt={feature.alt}
          fill
          sizes={IMAGE_SIZES}
          priority={priority}
          className="object-cover"
        />
      )}
      {/* Light dim so the inverted title stays legible over bright shots. */}
      <div aria-hidden className="absolute inset-0 bg-black/15" />
    </div>
  )
}

const WORD_EASE = [0.22, 1, 0.36, 1] as const
type TitlePose = "below" | "stage" | "above"

const POSES = {
  below: { opacity: 0, rotateX: -90, y: "0.45em" },
  stage: { opacity: 1, rotateX: 0, y: "0em" },
  above: { opacity: 0, rotateX: 90, y: "-0.45em" },
}

function ChapterTitle({
  title,
  pose,
  disabled,
}: {
  title: string
  pose: TitlePose
  disabled: boolean
}) {
  const words = title.split(" ")
  const onStage = pose === "stage"

  return (
    <motion.h2
      aria-hidden={!onStage}
      className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-x-[0.22em] px-5 text-center font-display uppercase leading-[0.9] tracking-[-0.03em] text-white [mix-blend-mode:difference] text-[clamp(2.75rem,9vw,8.5rem)]"
      style={{ perspective: 800 }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden py-[0.06em]">
          <motion.span
            className="inline-block will-change-transform"
            style={{ transformOrigin: "50% 100%" }}
            initial={false}
            animate={disabled ? { opacity: onStage ? 1 : 0 } : POSES[pose]}
            transition={{
              duration: disabled ? 0.2 : 0.55,
              ease: WORD_EASE,
              // Incoming words wait a beat so the outgoing ones clear first,
              // then cascade in; outgoing words leave almost together.
              delay: disabled ? 0 : onStage ? 0.14 + i * 0.07 : i * 0.03,
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  )
}
