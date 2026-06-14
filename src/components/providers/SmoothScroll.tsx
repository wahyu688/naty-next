'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Keeps GSAP ScrollTrigger in sync with Lenis. Lives INSIDE the ReactLenis
// provider so `useLenis` reliably gets the instance (no ref-timing races).
function GsapLenisSync() {
  // Update ScrollTrigger on every Lenis scroll tick
  const lenis = useLenis(() => ScrollTrigger.update())
  const pathname = usePathname()

  useEffect(() => {
    if (lenis) ScrollTrigger.refresh()
  }, [lenis])

  // On every route change, recompute trigger positions AFTER the new page's
  // DOM (and its Reveal triggers) has mounted — this evaluates already-in-view
  // triggers so above-the-fold reveals fire without needing a scroll.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}

// Global smooth-scroll provider (lenis.dev-style feel). Lenis self-drives its
// RAF (autoRaf default = true) so scrolling always works.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      <GsapLenisSync />
      {children}
    </ReactLenis>
  )
}
