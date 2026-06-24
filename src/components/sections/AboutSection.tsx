// AboutSection.tsx — pinned section, content animates by scroll progress
'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STATS = [
  { num: '5+', label: 'Team members' },
  { num: '12+', label: 'Projects shipped' },
  { num: '3rd', label: 'Year of study' },
  { num: '∞', label: 'Cups of coffee' },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=80%',   // pin distance — keep it short so it stays subtle
          pin: true,
          scrub: 1,
        },
      })
      // Subtle drift on the text column while pinned
      tl.fromTo(textRef.current, { y: 48 }, { y: -48, ease: 'none' }, 0)
      // Stats tiles stagger in, tied to scroll progress
      const tiles = statsRef.current?.querySelectorAll('[data-stat]')
      if (tiles?.length) {
        tl.fromTo(
          tiles,
          { autoAlpha: 0, y: 64 },
          { autoAlpha: 1, y: 0, stagger: 0.18, ease: 'none' },
          0.1,
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="min-h-screen flex items-center px-6 overflow-hidden">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center w-full">
        <div ref={textRef}>
          <span className="section-label">Who we are</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-6 text-balance">
            A team forged in late-night commits.
          </h2>
          <p className="text-[16px] font-light text-muted leading-[1.75] max-w-[60ch]">
            <strong className="text-ink font-medium">NATY</strong> (derived from{' '}
            <em>Nusantara</em>) is a five-person software house run by CS students at Binus
            University, Jakarta. We design, develop, and deliver — from prototypes to production.
            <br /><br />
            We&#39;re not just students finishing assignments. We ship real products, take on real
            clients, and hold each other accountable for craft that works in the wild.
          </p>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-2 gap-0.5 rounded-card overflow-hidden border border-white/[0.05]"
        >
          {STATS.map(s => (
            <div
              key={s.label}
              data-stat
              className="bg-surface hover:bg-surface2 transition-colors duration-200 p-5 sm:p-9"
            >
              <div className="font-display font-bold text-[2.8rem] tracking-[-0.04em] leading-[1]">
                {s.num.replace(/[^\d∞]+$/, '')}
                <span className="text-violet">{s.num.match(/[^\d∞]+$/)?.[0]}</span>
              </div>
              <div className="text-[13px] text-muted mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
