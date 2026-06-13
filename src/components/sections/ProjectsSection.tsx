'use client'
import Link from 'next/link'
import { useRef, useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { PROJECTS, type Project } from '@/lib/data'
import { Reveal, SectionHeader, StackPills } from '@/components/ui'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

// ── Single project card ─────────────────────────────────────
function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="h-full flex flex-col rounded-[22px] overflow-hidden border border-white/[0.08] bg-surface">
      {/* Image */}
      <div
        className="h-[230px] flex items-center justify-center text-[68px] shrink-0"
        style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
      >
        {p.emoji}
      </div>

      {/* Body */}
      <div className="p-7 flex-1 flex flex-col">
        <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-2">
          {p.type}
        </div>
        <h3 className="font-display font-bold text-[22px] tracking-[-0.02em] mb-3">{p.name}</h3>
        <p className="text-[14px] text-muted leading-[1.65] flex-1 mb-6">{p.desc}</p>
        <StackPills items={p.stack.slice(0, 5)} />
      </div>
    </div>
  )
}

// ── Projects carousel ───────────────────────────────────────
export default function ProjectsSection() {
  const projects = PROJECTS
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  const updateActive = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const center = scroller.scrollLeft + scroller.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cardRefs.current.forEach((c, i) => {
      if (!c) return
      const cCenter = c.offsetLeft + c.offsetWidth / 2
      const d = Math.abs(cCenter - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setActive(best)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    updateActive()
    scroller.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      scroller.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [updateActive])

  const scrollToIndex = (i: number) => {
    const card = cardRefs.current[i]
    const scroller = scrollerRef.current
    if (!card || !scroller) return
    const left = card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2
    scroller.scrollTo({ left, behavior: 'smooth' })
  }

  const go = (dir: -1 | 1) => scrollToIndex(Math.min(projects.length - 1, Math.max(0, active + dir)))

  return (
    <section id="projects" className="py-[140px] overflow-hidden">
      <SectionHeader
        label="Our work"
        title="Products, not just projects."
        sub="We build for real users. Here's a selection of what we've shipped."
      />

      {/* Carousel track */}
      <Reveal>
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth
                     px-[calc((100%-min(640px,84vw))/2)] py-4
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => { cardRefs.current[i] = el }}
              onClick={() => i !== active && scrollToIndex(i)}
              className={clsx(
                'snap-center shrink-0 w-[min(640px,84vw)] transition-all duration-500 ease-out',
                i === active
                  ? 'opacity-100 scale-100'
                  : 'opacity-40 scale-[0.9] cursor-pointer hover:opacity-60',
              )}
            >
              <ProjectCard p={p} />
            </div>
          ))}
        </div>
      </Reveal>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous project"
          className="w-11 h-11 rounded-full border border-white/[0.12] text-ink flex items-center justify-center
                     transition-all duration-200 hover:border-white/30 hover:bg-white/[0.04]
                     disabled:opacity-30 disabled:pointer-events-none"
        >
          ←
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${p.name}`}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-6 bg-ink' : 'w-1.5 bg-white/20 hover:bg-white/40',
              )}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={active === projects.length - 1}
          aria-label="Next project"
          className="w-11 h-11 rounded-full border border-white/[0.12] text-ink flex items-center justify-center
                     transition-all duration-200 hover:border-white/30 hover:bg-white/[0.04]
                     disabled:opacity-30 disabled:pointer-events-none"
        >
          →
        </button>
      </div>

      <div className="text-center mt-12">
        <Reveal>
          <Link href="/works">
            <LiquidButton size="xl" className="text-white border border-white/20 font-semibold text-[15px]">
              View all projects →
            </LiquidButton>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
