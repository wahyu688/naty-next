'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Scroll-driven splash intro (homepage only).
 * A full-height spacer creates the scroll room; the fixed overlay covers the
 * viewport on load, then zooms + fades out as you scroll — revealing the hero,
 * which has settled at the top of the viewport by the time the overlay clears.
 */
export default function HomeIntro() {
  const spacerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const spacer = spacerRef.current
    if (!spacer) return

    const ctx = gsap.context(() => {
      // Entrance on load
      gsap.set([logoRef.current, hintRef.current], { autoAlpha: 0 })
      gsap.timeline()
        .fromTo(logoRef.current, { autoAlpha: 0, scale: 0.82, filter: 'blur(8px)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, 0.1)
        .fromTo(hintRef.current, { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.6)

      // Scroll-driven exit — heboh zoom-through into the hero
      const tl = gsap.timeline({
        scrollTrigger: { trigger: spacer, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.to(hintRef.current, { autoAlpha: 0, y: -24, duration: 0.15, ease: 'power1.in' }, 0)
        .to(logoRef.current, { scale: 6.5, autoAlpha: 0, filter: 'blur(18px)', duration: 0.85, ease: 'power2.in' }, 0.12)
        .to(overlayRef.current, { autoAlpha: 0, scale: 1.14, duration: 0.45, ease: 'power1.inOut' }, 0.55)
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* Scroll room for the intro */}
      <div ref={spacerRef} className="h-screen" aria-hidden />

      {/* Fixed splash overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[1500] flex flex-col items-center justify-center bg-bg will-change-transform"
      >
        <div ref={logoRef} className="will-change-transform">
          <img src="/logo.svg" alt="NATY" className="h-28 w-auto" />
        </div>

        <div ref={hintRef} className="absolute bottom-14 flex flex-col items-center gap-3">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted">
            Start scrolling
          </span>
          <span className="block w-px h-9 bg-gradient-to-b from-white/40 to-transparent" />
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-muted animate-floathint"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </>
  )
}
