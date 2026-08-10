"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * Wraps a nug photo so hovering pulls off a loupe-style zoom: the image
 * scales up with its transform-origin tracking the cursor, so whatever
 * the pointer sits over is the part that grows. Mouse-only by nature —
 * touch has no hover to drive it, so it just renders the photo as-is.
 */
export function NugZoom({
  children,
  className,
  zoom = 1.6,
}: {
  children: ReactNode
  className?: string
  zoom?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const originX = useMotionValue(50)
  const originY = useMotionValue(50)
  const springX = useSpring(originX, { stiffness: 300, damping: 32, mass: 0.3 })
  const springY = useSpring(originY, { stiffness: 300, damping: 32, mass: 0.3 })
  const transformOrigin = useMotionTemplate`${springX}% ${springY}%`

  const scale = useMotionValue(1)
  const springScale = useSpring(scale, { stiffness: 260, damping: 28 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return
    originX.set(((e.clientX - bounds.left) / bounds.width) * 100)
    originY.set(((e.clientY - bounds.top) / bounds.height) * 100)
  }

  const onMouseLeave = () => {
    scale.set(1)
    originX.set(50)
    originY.set(50)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => scale.set(zoom)}
      onMouseLeave={onMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div style={{ scale: springScale, transformOrigin }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  )
}
