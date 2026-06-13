'use client'

import { useState, useRef } from 'react'
import { useLenis } from 'lenis/react'
import clsx from 'clsx'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const visRef = useRef(false)

  // Show once the user has scrolled past the first viewport-ish; only flips
  // state on threshold crossings (no re-render storm during scroll).
  const lenis = useLenis((l) => {
    const should = l.scroll > 400
    if (should !== visRef.current) {
      visRef.current = should
      setVisible(should)
    }
  })

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={toTop}
      aria-label="Back to top"
      className={clsx(
        'fixed bottom-6 right-6 z-[1000] w-12 h-12 rounded-full',
        'flex items-center justify-center group',
        'bg-surface/80 backdrop-blur-md border border-white/[0.12] text-ink',
        'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        'transition-all duration-300 ease-out',
        'hover:border-white/30 hover:bg-surface hover:-translate-y-1',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none',
      )}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
