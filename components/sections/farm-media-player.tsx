"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
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
  | { type: "video"; src: string }
  | { type: "image"; src: string; alt: string }

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
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484376/aisle-center-view.jpg",
    alt: "Center aisle, Oakland facility",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484377/bottom-shelf-view.jpg",
    alt: "Bottom shelf, Oakland facility",
  },
  {
    type: "image",
    src: "https://res.cloudinary.com/g0mcdcfr/image/upload/v1786484376/top-aisle-view.jpg",
    alt: "Top of the aisle, Oakland facility",
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

/** enter -> hold -> exit 4-point window — same convention as breakdown.tsx. */
function holdWindow(start: number, end: number, inPortion: number, outPortion: number) {
  const length = end - start
  const inEnd = start + length * inPortion
  const outStart = Math.max(inEnd, end - length * outPortion)
  return [start, inEnd, outStart, end]
}

/** Where a hero frame needs to start (relative to its own natural, centered,
 * full-size box) so it exactly overlaps its thumbnail — a FLIP transition,
 * not a guessed offset. scaleX/scaleY are separate since the thumbnail is
 * roughly square and the stage is a wide rectangle. */
type Delta = { dx: number; dy: number; scaleX: number; scaleY: number }
const IDLE_DELTA: Delta = { dx: 0, dy: 0, scaleX: 0.16, scaleY: 0.16 }

/**
 * A thumbnail rail on the right, one per photo/video. As you scroll, the
 * current item's frame expands out of its own thumbnail's exact position
 * and size — measured live via refs, not estimated — into a near-fullscreen
 * stage, then contracts back into the rail as the next one takes over.
 */
export function FarmMediaPlayer() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])
  const [deltas, setDeltas] = useState<Delta[]>(() => MEDIA.map(() => IDLE_DELTA))
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  })
  // Smooths the raw scroll value into something with a little inertia —
  // without it, the expand/contract tracks the scrollbar 1:1 and every
  // wheel tick or trackpad stutter reads directly as a stepped jump.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
  })
  const progress = reduce ? scrollYProgress : smoothProgress

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
    <div ref={wrapperRef} className="relative" style={{ height: `${MEDIA.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center gap-4 overflow-hidden px-4 sm:gap-6 sm:px-8">
        {/* A real flex column, not an absolute overlay pinned to the
            viewport edge — the rail sitting alongside the hero (rather
            than on top of it) is what actually guarantees no overlap,
            instead of chasing breakpoint-specific offsets that only
            happened to leave enough margin at some widths and not
            others. */}
        {/* No overflow-hidden here — the hero frame's "closed" state sits
            over in the rail's territory (that's the whole FLIP effect),
            so clipping to this column's own bounds would cut it off
            mid-transition. The outer stage below already clips to the
            viewport. */}
        <div ref={heroRef} className="relative h-[78vh] max-h-[820px] w-full max-w-[1000px] flex-1">

          {MEDIA.map((item, index) => (
            <HeroFrame
              key={item.src}
              item={item}
              index={index}
              total={MEDIA.length}
              progress={progress}
              disabled={!!reduce}
              delta={deltas[index]}
            />
          ))}
        </div>

        <div className="flex shrink-0 flex-col">
          {MEDIA.map((item, index) => (
            <Thumbnail
              key={item.src}
              item={item}
              index={index}
              total={MEDIA.length}
              isLast={index === MEDIA.length - 1}
              progress={progress}
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
  total,
  progress,
  disabled,
  delta,
}: {
  item: MediaItem
  index: number
  total: number
  progress: MotionValue<number>
  disabled: boolean
  delta: Delta
}) {
  const start = index / total
  const end = (index + 1) / total
  const length = end - start
  const input = holdWindow(start, end, 0.18, 0.18)
  const opacity = useTransform(progress, input, [0, 1, 1, 0])

  // Two distinct beats instead of one blended motion: first it slides out
  // from the thumbnail while STILL AT THUMBNAIL SIZE (scale doesn't move
  // yet), then it grows into the full stage. Six points, mirrored on the
  // way back out. Framer composes x/y as the OUTER transform (applied in
  // un-scaled pixels), which is what makes dx/dy — the raw measured pixel
  // gap between the two elements' centers — work directly here without
  // also getting multiplied by scale.
  const points = [
    start,
    start + length * 0.12,
    start + length * 0.32,
    end - length * 0.32,
    end - length * 0.12,
    end,
  ]
  const scaleX = useTransform(
    progress,
    points,
    [delta.scaleX, delta.scaleX, 1, 1, delta.scaleX, delta.scaleX]
  )
  const scaleY = useTransform(
    progress,
    points,
    [delta.scaleY, delta.scaleY, 1, 1, delta.scaleY, delta.scaleY]
  )
  const x = useTransform(
    progress,
    points,
    [`${delta.dx}px`, `${delta.dx * 0.68}px`, "0px", "0px", `${delta.dx * 0.68}px`, `${delta.dx}px`]
  )
  const y = useTransform(
    progress,
    points,
    [`${delta.dy}px`, `${delta.dy}px`, "0px", "0px", `${delta.dy}px`, `${delta.dy}px`]
  )

  // Pans the crop from top to bottom across the hold phase (points[2] to
  // points[3], i.e. while it's actually fully open on stage) — self-
  // adjusting rather than needing to know which images are unusually
  // tall: object-cover crops less the closer the photo's own aspect ratio
  // is to the frame's, so a normal photo barely moves, while a portrait
  // shot that would otherwise only ever show its dead center pans through
  // its whole height instead.
  const panY = useTransform(progress, [points[2], points[3]], [0, 100])
  const objectPosition = useMotionTemplate`50% ${panY}%`

  return (
    <motion.div
      style={disabled ? undefined : { scaleX, scaleY, x, y, opacity }}
      className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-950 shadow-[0_30px_80px_rgb(0_0_0_/_0.45)]"
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
          priority={index === 0}
        />
      )}
    </motion.div>
  )
}

/** Matches sm:h-14 (the larger of the two breakpoint sizes) — close enough
 * below sm too that the rare few-px mismatch there isn't worth threading a
 * measured value through just for this. */
const THUMB_COLLAPSE_PX = 56
const THUMB_GAP_PX = 16

function Thumbnail({
  item,
  index,
  total,
  isLast,
  progress,
  disabled,
  elRef,
}: {
  item: MediaItem
  index: number
  total: number
  isLast: boolean
  progress: MotionValue<number>
  disabled: boolean
  elRef: (el: HTMLDivElement | null) => void
}) {
  const start = index / total
  const end = (index + 1) / total
  const input = holdWindow(start, end, 0.18, 0.18)

  // Inverse of the hero's openAmount — this is the thumbnail whose media is
  // currently the one expanded onstage, so it fully collapses (height AND
  // its own trailing gap go to 0) rather than just dimming in place. The
  // rest of the rail actually shifts to close the gap, instead of sitting
  // there with a dimmed placeholder where it used to be.
  const openAmount = useTransform(progress, input, [0, 1, 1, 0])
  const height = useTransform(openAmount, [0, 1], [THUMB_COLLAPSE_PX, 0])
  const marginBottom = useTransform(openAmount, [0, 1], [isLast ? 0 : THUMB_GAP_PX, 0])
  const opacity = useTransform(openAmount, [0, 0.6, 1], [0.85, 0.1, 0])
  const scale = useTransform(openAmount, [0, 1], [1, 0.7])

  return (
    <motion.div
      style={disabled ? undefined : { height, marginBottom }}
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
