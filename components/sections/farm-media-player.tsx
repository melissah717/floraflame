"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  animate,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useMotionTemplate,
  useReducedMotion,
  type MotionValue,
} from "motion/react"

// Next's <Image> is a plain component — a MotionValue passed into its
// style prop directly wouldn't update reactively, only re-stringify once.
// Wrapping it via motion.create() makes it a proper motion component that
// actually subscribes to MotionValue changes, same as any motion.div.
const MotionImage = motion.create(Image)

type MediaItem =
  | { type: "video"; src: string; scrollWeight?: number }
  | { type: "image"; src: string; alt: string; scrollWeight?: number }
type ScrollDirection = "down" | "up"

const MEDIA: MediaItem[] = [
  {
    type: "video",
    src: "https://res.cloudinary.com/g0mcdcfr/video/upload/v1786344108/DRONE_BOTTOMTOTOPPULL_dox1os.mp4",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484377/topshelf-view.jpg",
    alt: "Top shelf, Oakland facility",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786498062/plant-pots.jpg",
    alt: "Plant pots, Oakland facility",
    scrollWeight: 2.8,
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484376/aisle-center-view.jpg",
    alt: "Center aisle, Oakland facility",
    scrollWeight: 2.4,
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484377/bottom-shelf-view.jpg",
    alt: "Bottom shelf, Oakland facility",
    scrollWeight: 2.4,
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484376/top-aisle-view.jpg",
    alt: "Top of the aisle, Oakland facility",
    scrollWeight: 2.4,
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786492144/guy-work.jpg",
    alt: "Hands at work, Oakland facility",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786497578/forklift-work-guy.jpg",
    alt: "Moving product with the forklift, Oakland facility",
  },
]

/** Where a hero frame needs to start (relative to its own natural, centered,
 * full-size box) so it exactly overlaps its thumbnail — a FLIP transition,
 * not a guessed offset. scaleX/scaleY are separate since the thumbnail is
 * roughly square and the stage is a wide rectangle. */
type Delta = { dx: number; dy: number; scaleX: number; scaleY: number }
const IDLE_DELTA: Delta = { dx: 0, dy: 0, scaleX: 0.16, scaleY: 0.16 }
const TALL_IMAGE_ASPECT_START = 1.2
const TALL_IMAGE_MAX_WEIGHT = 3
const TALL_IMAGE_EDGE_HOLD = 0.16

const HERO_IN_TIMES = [0, 0.46, 1]
const HERO_X_TIMES = [0, 0.46, 1]
const HERO_OUT_TIMES = [0, 0.54, 1]
const HERO_IN_DELAY = 0.88
const HERO_IN_TRANSITION = {
  type: "tween" as const,
  duration: 0.9,
  ease: "easeInOut" as const,
  times: HERO_IN_TIMES,
}
const HERO_OUT_TRANSITION = {
  type: "tween" as const,
  duration: 0.62,
  ease: "easeInOut" as const,
  times: HERO_OUT_TIMES,
}
const THUMB_RADIUS = 8
const HERO_RADIUS = 28

function getScaledThumbRadius(delta: Delta) {
  const scale = Math.max(Math.min(delta.scaleX, delta.scaleY), 0.01)
  return Math.max(HERO_RADIUS, THUMB_RADIUS / scale)
}

function getWeightedIndex(progress: number, weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const target = progress * total
  let cursor = 0

  for (let i = 0; i < weights.length; i += 1) {
    cursor += weights[i] ?? 1
    if (target < cursor) return i
  }

  return Math.max(weights.length - 1, 0)
}

function getTallImageWeight(width: number, height: number) {
  if (!width || !height) return 1

  const aspect = height / width
  if (aspect <= TALL_IMAGE_ASPECT_START) return 1

  return Math.min(TALL_IMAGE_MAX_WEIGHT, 1 + (aspect - TALL_IMAGE_ASPECT_START) * 0.9)
}

/**
 * A thumbnail rail on the right, one per photo/video. Scrolling picks
 * which item is "active" (a discrete index, not a continuously-scrubbed
 * value) — and when that changes, the outgoing and incoming frames each
 * get a real animate() call toward their target transform, rather
 * than the transform being computed frame-by-frame from scroll position.
 * That's what gives each swap a deliberate center-then-expand rhythm
 * instead of an approximation built from hand-picked keyframes.
 */
export function FarmMediaPlayer() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])
  const [deltas, setDeltas] = useState<Delta[]>(() => MEDIA.map(() => IDLE_DELTA))
  const [mediaWeights, setMediaWeights] = useState(() =>
    MEDIA.map((item) => item.scrollWeight ?? 1),
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [entryDirection, setEntryDirection] = useState<ScrollDirection>("down")
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null)
  const activeIndexRef = useRef(0)
  const lastProgressRef = useRef(0)
  const reduce = useReducedMotion()
  const spans: { start: number; weight: number }[] = []
  let totalScrollWeight = 0

  for (const weight of mediaWeights) {
    spans.push({ start: totalScrollWeight, weight })
    totalScrollWeight += weight
  }

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  })
  // Smooths the raw scroll value into something with a little inertia,
  // used for the in-frame pan (see HeroFrame) — the active/inactive
  // SWITCH itself is read off raw scrollYProgress below, deliberately not
  // smoothed, so the trigger stays responsive. The glide lives in the
  // animate() calls this trigger kicks off, not in smoothing the trigger.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = getWeightedIndex(v, mediaWeights)
    const direction: ScrollDirection = v >= lastProgressRef.current ? "down" : "up"
    lastProgressRef.current = v

    if (idx !== activeIndexRef.current) {
      setOutgoingIndex(activeIndexRef.current)
      setEntryDirection(direction)
      activeIndexRef.current = idx
      setActiveIndex(idx)
    }
  })

  const handleImageLoad = (index: number, width: number, height: number) => {
    const nextWeight = Math.max(MEDIA[index]?.scrollWeight ?? 1, getTallImageWeight(width, height))

    setMediaWeights((current) => {
      if (Math.abs((current[index] ?? 1) - nextWeight) < 0.01) return current

      return current.map((weight, i) => (i === index ? nextWeight : weight))
    })
  }

  useEffect(() => {
    if (outgoingIndex == null) return

    const id = window.setTimeout(() => {
      setOutgoingIndex((current) => (current === outgoingIndex ? null : current))
    }, 650)

    return () => window.clearTimeout(id)
  }, [outgoingIndex])

  useEffect(() => {
    const measure = () => {
      const heroEl = heroRef.current
      if (!heroEl) return
      const heroRect = heroEl.getBoundingClientRect()
      const heroCenterX = heroRect.left + heroRect.width / 2
      const heroCenterY = heroRect.top + heroRect.height / 2

      setDeltas(
        MEDIA.map((_, i) => {
          const thumbEl = thumbRefs.current[i]
          if (!thumbEl || !heroRect.width || !heroRect.height) return IDLE_DELTA
          const tRect = thumbEl.getBoundingClientRect()
          return {
            dx: tRect.left + tRect.width / 2 - heroCenterX,
            dy: tRect.top + tRect.height / 2 - heroCenterY,
            scaleX: tRect.width / heroRect.width,
            scaleY: tRect.height / heroRect.height,
          }
        })
      )
    }

    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${totalScrollWeight * 100}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center gap-4 overflow-hidden px-4 sm:gap-6 sm:px-8">
        {/* A real flex column, not an absolute overlay pinned to the
            viewport edge — the rail sitting alongside the hero (rather
            than on top of it) is what actually guarantees no overlap,
            instead of chasing breakpoint-specific offsets that only
            happened to leave enough margin at some widths and not
            others. No overflow-hidden here — the hero frame's "closed"
            state sits over in the rail's territory (that's the whole
            FLIP effect), so clipping to this column's own bounds would
            cut it off mid-transition. The outer stage already clips to
            the viewport. */}
        <div ref={heroRef} className="relative h-[78vh] max-h-[820px] w-full max-w-[1000px] flex-1">
          {MEDIA.map((item, index) => (
            <HeroFrame
              key={item.src}
              item={item}
              index={index}
              spanStart={spans[index]?.start ?? index}
              spanWeight={spans[index]?.weight ?? 1}
              totalScrollWeight={totalScrollWeight}
              isActive={index === activeIndex}
              isOutgoing={index === outgoingIndex}
              entryDirection={entryDirection}
              progress={scrollYProgress}
              disabled={!!reduce}
              delta={deltas[index]}
              onImageLoad={handleImageLoad}
            />
          ))}
        </div>

        <div className="flex shrink-0 flex-col">
          {MEDIA.map((item, index) => (
            <Thumbnail
              key={item.src}
              item={item}
              isLast={index === MEDIA.length - 1}
              isActive={index === activeIndex}
              isOutgoing={index === outgoingIndex}
              disabled={!!reduce}
              elRef={(el) => {
                thumbRefs.current[index] = el
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function HeroFrame({
  item,
  index,
  spanStart,
  spanWeight,
  totalScrollWeight,
  isActive,
  isOutgoing,
  entryDirection,
  progress,
  disabled,
  delta,
  onImageLoad,
}: {
  item: MediaItem
  index: number
  spanStart: number
  spanWeight: number
  totalScrollWeight: number
  isActive: boolean
  isOutgoing: boolean
  entryDirection: ScrollDirection
  progress: MotionValue<number>
  disabled: boolean
  delta: Delta
  onImageLoad: (index: number, width: number, height: number) => void
}) {
  const scaleX = useMotionValue(delta.scaleX)
  const scaleY = useMotionValue(delta.scaleY)
  const x = useMotionValue(delta.dx)
  const y = useMotionValue(delta.dy)
  const opacity = useMotionValue(0)
  const thumbFrameRadius = getScaledThumbRadius(delta)
  const borderRadius = useMotionValue(thumbFrameRadius)

  useEffect(() => {
    if (disabled) {
      scaleX.set(isActive ? 1 : delta.scaleX)
      scaleY.set(isActive ? 1 : delta.scaleY)
      x.set(isActive ? 0 : delta.dx)
      y.set(isActive ? 0 : delta.dy)
      opacity.set(isActive ? 1 : 0)
      borderRadius.set(isActive ? HERO_RADIUS : thumbFrameRadius)
      return
    }

    if (!isActive && !isOutgoing) {
      scaleX.set(delta.scaleX)
      scaleY.set(delta.scaleY)
      x.set(delta.dx)
      y.set(delta.dy)
      opacity.set(0)
      borderRadius.set(thumbFrameRadius)
      return
    }

    const controls = [
      animate(
        scaleX,
        isActive ? [delta.scaleX, delta.scaleX, 1] : [1, delta.scaleX, delta.scaleX],
        isActive ? { ...HERO_IN_TRANSITION, delay: HERO_IN_DELAY } : HERO_OUT_TRANSITION,
      ),
      animate(
        scaleY,
        isActive ? [delta.scaleY, delta.scaleY, 1] : [1, delta.scaleY, delta.scaleY],
        isActive ? { ...HERO_IN_TRANSITION, delay: HERO_IN_DELAY } : HERO_OUT_TRANSITION,
      ),
      animate(
        x,
        isActive ? [delta.dx, delta.dx * 0.36, 0] : [0, delta.dx * 0.36, delta.dx],
        isActive ? { ...HERO_IN_TRANSITION, times: HERO_X_TIMES, delay: HERO_IN_DELAY } : HERO_OUT_TRANSITION,
      ),
      animate(
        y,
        isActive ? [delta.dy, delta.dy, 0] : [0, delta.dy, delta.dy],
        isActive ? { ...HERO_IN_TRANSITION, times: HERO_X_TIMES, delay: HERO_IN_DELAY } : HERO_OUT_TRANSITION,
      ),
      animate(opacity, isActive ? [0.42, 0.42, 1] : [1, 1, 0], {
        duration: isActive ? 0.9 : 0.62,
        ease: "easeInOut",
        times: isActive ? HERO_IN_TIMES : [0, 0.86, 1],
        delay: isActive ? HERO_IN_DELAY : 0,
      }),
      animate(
        borderRadius,
        isActive
          ? [thumbFrameRadius, thumbFrameRadius, HERO_RADIUS]
          : [HERO_RADIUS, thumbFrameRadius, thumbFrameRadius],
        isActive ? { ...HERO_IN_TRANSITION, delay: HERO_IN_DELAY } : HERO_OUT_TRANSITION,
      ),
    ]
    return () => controls.forEach((c) => c.stop())
  }, [
    borderRadius,
    isActive,
    isOutgoing,
    disabled,
    delta.scaleX,
    delta.scaleY,
    delta.dx,
    delta.dy,
    thumbFrameRadius,
    scaleX,
    scaleY,
    x,
    y,
    opacity,
  ])

  // Pans the crop from top to bottom while this item is the active one —
  // self-adjusting rather than needing to know which images are unusually
  // tall: object-cover crops less the closer the photo's own aspect ratio
  // is to the frame's, so a normal photo barely moves, while a portrait
  // shot that would otherwise only ever show its dead center pans through
  // its whole height instead.
  const panY = useTransform(progress, (v) => {
    if (!isActive) return 0
    const local = (v * totalScrollWeight - spanStart) / spanWeight
    const clamped = Math.min(Math.max(local, 0), 1)

    if (spanWeight <= 1.2) return clamped * 100

    if (entryDirection === "down" && clamped < TALL_IMAGE_EDGE_HOLD) return 0
    if (entryDirection === "up" && clamped > 1 - TALL_IMAGE_EDGE_HOLD) return 100

    const scan = (clamped - TALL_IMAGE_EDGE_HOLD) / (1 - TALL_IMAGE_EDGE_HOLD * 2)
    return Math.min(Math.max(scan, 0), 1) * 100
  })
  const objectPosition = useMotionTemplate`50% ${panY}%`

  return (
    <motion.div
      style={
        disabled
          ? undefined
          : {
              scaleX,
              scaleY,
              x,
              y,
              opacity,
              borderRadius,
              zIndex: isActive ? 3 : isOutgoing ? 2 : 1,
            }
      }
      className="absolute inset-0 overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0_30px_80px_rgb(0_0_0_/_0.45)]"
    >
      {item.type === "video" ? (
        <video className="h-full w-full object-cover" src={item.src} autoPlay muted loop playsInline />
      ) : (
        <MotionImage
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 80vw, 1000px"
          className="object-cover"
          style={disabled ? undefined : { objectPosition }}
          onLoad={(event) => {
            onImageLoad(index, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)
          }}
          priority={index === 0}
        />
      )}
    </motion.div>
  )
}

/** Matches sm:h-14 (the larger of the two breakpoint sizes) — close enough
 * below sm too that the rare few-px mismatch there isn't worth threading a
 * measured value through just for this. */
const THUMB_GAP_PX = 16
const THUMB_HIDE_DELAY = 0.08
const THUMB_ACTIVE_HIDE_DELAY = HERO_IN_DELAY
const THUMB_RETURN_SHOW_DELAY = HERO_OUT_TRANSITION.duration
const THUMB_SHOW_DELAY = 0.02

function Thumbnail({
  item,
  isLast,
  isActive,
  isOutgoing,
  disabled,
  elRef,
}: {
  item: MediaItem
  isLast: boolean
  isActive: boolean
  isOutgoing: boolean
  disabled: boolean
  elRef: (el: HTMLDivElement | null) => void
}) {
  const idleMargin = isLast ? 0 : THUMB_GAP_PX
  const opacity = useMotionValue(0.85)
  const scale = useMotionValue(1)
  const isDocked = !isActive && !isOutgoing
  const isVisible = isDocked || isOutgoing
  const hideDelay = isActive ? THUMB_ACTIVE_HIDE_DELAY : THUMB_HIDE_DELAY
  const showDelay = isOutgoing ? THUMB_RETURN_SHOW_DELAY : THUMB_SHOW_DELAY

  // This is the thumbnail whose media is currently the one expanded
  // onstage — it collapses (height AND its own trailing gap, so the rest
  // of the rail actually shifts up to close the gap) and fades out via a
  // real spring the instant it becomes active, snapping back the same way
  // once something else takes over.
  useEffect(() => {
    if (disabled) {
      opacity.set(isVisible ? 0.85 : 0)
      scale.set(isVisible ? 1 : 0.96)
      return
    }

    const controls = [
      animate(opacity, isVisible ? 0.85 : 0, {
        duration: 0.18,
        delay: isVisible ? showDelay : hideDelay,
      }),
      animate(scale, isVisible ? 1 : 0.96, {
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.7,
        delay: isVisible ? showDelay : hideDelay,
      }),
    ]
    return () => controls.forEach((c) => c.stop())
  }, [hideDelay, isVisible, showDelay, disabled, opacity, scale])

  return (
    <motion.div
      style={disabled ? undefined : { marginBottom: idleMargin }}
      className="w-12 shrink-0 overflow-hidden sm:w-14"
    >
      <motion.div
        ref={elRef}
        style={disabled ? undefined : { opacity, scale }}
        className="relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 sm:h-14 sm:w-14"
      >
        {item.type === "video" ? (
          <video className="h-full w-full object-cover" src={item.src} muted loop playsInline />
        ) : (
          <Image src={item.src} alt="" fill sizes="56px" className="object-cover" />
        )}
      </motion.div>
    </motion.div>
  )
}
