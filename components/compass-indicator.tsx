"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"

// Deliberately outside the indica/hybrid/sativa spectrum palette (lib/spectrum.ts)
// — this is site chrome, not strain data, so it shouldn't read as one more
// spectrum color competing with the actual spectrum UI.
const COMPASS_COLOR = "rgb(20 184 138)"

/**
 * Fixed N/S line on the right edge, present on every page. The fill and
 * thumb track whole-page scroll progress (0 at the top, 1 at the bottom),
 * and the thumb doubles as a scrollbar — drag it to scroll the page.
 */
export function CompassIndicator() {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackHeight, setTrackHeight] = useState(0)
  // Scroll normally drives the thumb; while a drag is in progress the
  // thumb drives scroll instead. This flag stops the two fighting —
  // without it, scrollTo() during a drag would trigger a scroll event
  // that snaps the thumb back to the pre-drag position mid-gesture.
  const draggingRef = useRef(false)

  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })

  const thumbY = useMotionValue(0)
  const fillScaleY = useTransform(thumbY, (y) => (trackHeight ? y / trackHeight : 0))

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setTrackHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const source = reduce ? scrollYProgress : smoothProgress
    return source.on("change", (v) => {
      if (draggingRef.current) return
      thumbY.set(v * trackHeight)
    })
  }, [reduce, scrollYProgress, smoothProgress, thumbY, trackHeight])

  const scrollToFraction = (fraction: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: fraction * Math.max(max, 0) })
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-1/2 right-4 z-40 hidden h-[40vh] w-6 -translate-y-1/2 flex-col items-center sm:right-6 lg:flex"
    >
      <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500">N</span>

      <div
        ref={trackRef}
        className="pointer-events-auto relative mt-3 mb-3 w-px flex-1 bg-neutral-700"
      >
        <motion.div
          style={{ scaleY: fillScaleY, transformOrigin: "top", backgroundColor: COMPASS_COLOR }}
          className="absolute inset-x-0 top-0 h-full w-px"
        />
        <motion.div
          drag="y"
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => {
            draggingRef.current = true
          }}
          onDrag={() => {
            if (!trackHeight) return
            const clamped = Math.min(Math.max(thumbY.get(), 0), trackHeight)
            scrollToFraction(clamped / trackHeight)
          }}
          onDragEnd={() => {
            draggingRef.current = false
          }}
          style={{ y: thumbY, backgroundColor: COMPASS_COLOR }}
          className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing"
        />
      </div>

      <span className="text-[10px] font-medium tracking-[0.3em] text-neutral-500">S</span>
    </div>
  )
}
