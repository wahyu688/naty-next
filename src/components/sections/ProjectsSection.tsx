'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import clsx from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { PROJECTS, type Project } from '@/lib/data'
import { SectionHeader, StackPills } from '@/components/ui'
import { VelocitySkew } from '@/components/ui/VelocitySkew'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ── Single project card ─────────────────────────────────────
function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="h-full flex flex-col rounded-[22px] overflow-hidden border border-white/[0.08] bg-surface">
      {/* Image — emoji + bg drift horizontally as the card crosses the viewport center */}
      <div className="relative h-[320px] overflow-hidden shrink-0">
        <div
          data-parallax-bg
          className="absolute -top-[20%] -bottom-[20%] -left-[14%] -right-[14%] will-change-transform"
          style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span data-parallax-fg className="text-[68px] will-change-transform">{p.emoji}</span>
        </div>
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

// ── Projects — scroll-driven horizontal carousel ────────────
export default function ProjectsSection() {
  const projects = PROJECTS
  const lenis = useLenis()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const viewAllRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const track = trackRef.current
    if (!section || !stage || !track) return

    const ctx = gsap.context(() => {
      // Cache the layered elements per card (transform targets never overlap)
      const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[]
      const emph = slots.map(s => s.querySelector<HTMLElement>('[data-emph]'))
      const bg = slots.map(s => s.querySelector<HTMLElement>('[data-parallax-bg]'))
      const fg = slots.map(s => s.querySelector<HTMLElement>('[data-parallax-fg]'))
      const firstEntry = slots[0]?.querySelector<HTMLElement>('[data-entry]') ?? null
      const viewAll = viewAllRef.current

      // Exact translate needed to center the LAST card (layout-based, transform-proof)
      const getMaxX = () => {
        const last = slots[slots.length - 1]
        return last.offsetLeft + last.offsetWidth / 2 - track.clientWidth / 2
      }
      // Extra scroll past the last card during which the "View all" button reveals
      const revealDist = () => Math.min(window.innerHeight * 0.7, 560)

      // Continuous emphasis + horizontal image parallax, driven by each card's
      // live distance from the viewport center.
      const render = () => {
        const viewCenter = window.innerWidth / 2
        let best = 0
        let bestDist = Infinity
        slots.forEach((slot, i) => {
          const r = slot.getBoundingClientRect()
          const dist = r.left + r.width / 2 - viewCenter
          const ad = Math.abs(dist)
          if (ad < bestDist) { bestDist = ad; best = i }
          const norm = Math.min(ad / (r.width * 0.9), 1)
          // center card pops to 1.04, neighbors shrink/dim toward the edges
          gsap.set(emph[i], { scale: 1.04 - norm * 0.24, autoAlpha: 1 - norm * 0.6 })
          // layered drift — emoji moves opposite the card, bg trails it (depth)
          gsap.set(fg[i], { x: dist * -0.07 })
          gsap.set(bg[i], { x: dist * 0.045 })
        })
        if (best !== activeRef.current) { activeRef.current = best; setActive(best) }
      }

      // Pin the stage and translate the track horizontally with vertical scroll.
      // Scroll down → progress↑ → track moves left → next card enters from the right.
      // The final `revealDist` of scroll holds the last card and parallaxes in the CTA.
      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => '+=' + (getMaxX() + revealDist()),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefresh: render,
        onUpdate: (self) => {
          const maxX = getMaxX()
          const dist = self.progress * (maxX + revealDist())
          // Phase 1: slide the track until the last card is centered, then hold.
          gsap.set(track, { x: -Math.min(dist, maxX) })
          // Phase 2: reveal the "View all" CTA with a parallax rise + blur clear.
          const rp = gsap.utils.clamp(0, 1, (dist - maxX) / revealDist())
          if (viewAll) {
            gsap.set(viewAll, {
              autoAlpha: rp,
              y: (1 - rp) * 70,
              scale: 0.92 + rp * 0.08,
              filter: `blur(${(1 - rp) * 12}px)`,
            })
          }
          render()
        },
      })
      stRef.current = st

      // First card: parallax entrance as you scroll in from the pricing section.
      if (firstEntry) {
        gsap.fromTo(
          firstEntry,
          { xPercent: 26, autoAlpha: 0.3, filter: 'blur(14px)' },
          {
            xPercent: 0, autoAlpha: 1, filter: 'blur(0px)', ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              onUpdate: render,
            },
          },
        )
      }

      if (viewAll) gsap.set(viewAll, { autoAlpha: 0 })
      render()
    }, section)

    return () => ctx.revert()
  }, [])

  // Dots jump to a card by scrolling the page to where that card is centered.
  const scrollToIndex = (i: number) => {
    const st = stRef.current
    const track = trackRef.current
    const slot = slotRefs.current[i]
    if (!st || !track || !slot) return
    const offset = slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2
    const target = st.start + offset
    if (lenis) lenis.scrollTo(target, { duration: 1 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="projects" className="py-[140px] overflow-hidden">
      <SectionHeader
        label="Our work"
        title="Products, not just projects."
        sub="Scroll to move through our work — each project slides in as you go."
      />

      {/* Pinned horizontal stage */}
      <div ref={stageRef} className="relative h-screen flex flex-col justify-center overflow-hidden">
        <div
          ref={trackRef}
          className="relative flex gap-8 will-change-transform px-[calc((100vw-min(760px,84vw))/2)]"
        >
          {projects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => { slotRefs.current[i] = el }}
              data-slot
              className="shrink-0 w-[min(760px,84vw)]"
            >
              <div data-emph className="h-full" style={{ opacity: i === 0 ? 1 : 0.4 }}>
                <div data-entry className="h-full">
                  <VelocitySkew className="h-full" maxSkew={5} intensity={0.18}>
                    <ProjectCard p={p} />
                  </VelocitySkew>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots — progress + jump */}
        <div className="flex items-center justify-center gap-2 mt-8">
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

        {/* View all — parallaxes in once you reach the last card */}
        <div ref={viewAllRef} className="text-center mt-8 will-change-transform">
          <Link href="/works">
            <LiquidButton size="xl" className="text-white border border-white/20 font-semibold text-[15px]">
              View all projects →
            </LiquidButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
