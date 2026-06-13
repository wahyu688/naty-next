'use client'

import { useRef, useEffect } from 'react'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'

interface VelocitySkewProps {
  children: React.ReactNode
  className?: string
  /** max |skewY| in degrees at high velocity */
  maxSkew?: number
  /** velocity → skew sensitivity */
  intensity?: number
  /** lerp factor toward target each frame (higher = snappier, lower = floatier) */
  damping?: number
}

/**
 * Wraps children and applies a subtle skewY (+ slight scale) based on the live
 * Lenis scroll velocity, easing back to 0 when scrolling stops. Uses the GSAP
 * ticker that already runs for ScrollTrigger — no extra RAF loop, no new deps.
 */
export function VelocitySkew({
  children,
  className,
  maxSkew = 6,
  intensity = 0.25,
  damping = 0.1,
}: VelocitySkewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const velRef = useRef(0)
  const skewRef = useRef(0)

  // capture live scroll velocity from Lenis
  useLenis((lenis) => {
    velRef.current = lenis.velocity
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const tick = () => {
      const target = gsap.utils.clamp(-maxSkew, maxSkew, velRef.current * intensity)
      // damped approach → smooth return to 0 when velocity dies down
      skewRef.current += (target - skewRef.current) * damping
      const s = Math.abs(skewRef.current) < 0.001 ? 0 : skewRef.current
      const scale = 1 - Math.min(Math.abs(s) * 0.006, 0.05)
      el.style.transform = `skewY(${s.toFixed(3)}deg) scale(${scale.toFixed(4)})`
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [maxSkew, intensity, damping])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
