'use client'

import { ReactLenis } from 'lenis/react'

// Global smooth-scroll provider (lenis.dev-style buttery scroll).
// `root` makes Lenis drive the document scroll, so framer-motion's
// useScroll / window scroll listeners keep working as normal.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,        // lower = smoother / heavier glide
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  )
}
