'use client'

import { useAnimationFrame } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { useRef, useEffect } from 'react'
import clsx from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ── Reveal wrapper ────────────────────────────────────
interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
  /** disable blur-in for large/expensive subtrees */
  blur?: boolean
  /**
   * Tie the reveal to scroll position (scrubbed) instead of a one-shot pop-in.
   * `true` = scrub:1, or pass a number for a custom scrub smoothing.
   * Scrubbed reveals are reversible — they play forward/back with the scroll.
   */
  scrub?: boolean | number
}

export function Reveal({ children, delay = 0, className, y = 52, blur = true, scrub = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const fromVars = { autoAlpha: 0, y, filter: blur ? 'blur(16px)' : 'blur(0px)' }

      if (scrub) {
        // Scrubbed: opacity/y/blur follow scroll progress (reversible)
        gsap.fromTo(el, fromVars, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 55%',
            scrub: scrub === true ? 1 : scrub,
          },
        })
      } else {
        // One-shot pop-in
        gsap.fromTo(el, fromVars, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          delay,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      }
    }, el)
    return () => ctx.revert()
  }, [delay, y, blur, scrub])

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </div>
  )
}

// ── Marquee (scroll-velocity reactive — lenis.dev style) ───
interface MarqueeProps {
  items: string[]
  /** base auto-scroll speed in px/frame */
  baseVelocity?: number
}

export function Marquee({ items, baseVelocity = 0.6 }: MarqueeProps) {
  const doubled = [...items, ...items]
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const velRef = useRef(0)

  // capture live scroll velocity from Lenis
  useLenis((lenis) => { velRef.current = lenis.velocity })

  useAnimationFrame((_, delta) => {
    const track = trackRef.current
    if (!track) return
    const half = track.scrollWidth / 2 || 1
    const frames = delta / 16.6667
    // base drift + boost proportional to scroll velocity
    const speed = baseVelocity + Math.min(Math.abs(velRef.current), 50) * 0.32
    xRef.current -= speed * frames
    // wrap seamlessly
    if (xRef.current <= -half) xRef.current += half
    if (xRef.current > 0) xRef.current -= half
    // skew + scroll direction reaction
    const skew = Math.max(-14, Math.min(14, velRef.current * 0.35))
    track.style.transform = `translate3d(${xRef.current}px,0,0) skewX(${skew}deg)`
  })

  return (
    <div className="overflow-hidden border-t border-b border-white/[0.05] py-[18px] bg-surface">
      <div ref={trackRef} className="flex gap-16 w-max will-change-transform">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-display text-[13px] font-medium tracking-[0.06em] uppercase text-muted whitespace-nowrap flex items-center gap-6
                       after:content-['✦'] after:text-violet after:text-[10px]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Page hero ─────────────────────────────────────────
interface PageHeroProps {
  label: string
  title: React.ReactNode
  sub?: string
}

export function PageHero({ label, title, sub }: PageHeroProps) {
  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-20">
      <Reveal>
        <span className="page-hero-label">{label}</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="page-hero-title">{title}</h1>
      </Reveal>
      {sub && (
        <Reveal delay={0.2}>
          <p className="text-[16px] font-light text-muted leading-[1.7] max-w-[52ch] mt-6">{sub}</p>
        </Reveal>
      )}
    </div>
  )
}

// ── Section header ────────────────────────────────────
interface SectionHeaderProps {
  label: string
  title: React.ReactNode
  sub?: string
  className?: string
}

export function SectionHeader({ label, title, sub, className }: SectionHeaderProps) {
  return (
    <div className={clsx('text-center max-w-[600px] mx-auto mb-[72px]', className)}>
      <Reveal>
        <span className="section-label">{label}</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] mb-4 text-balance">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.2}>
          <p className="text-[16px] font-light text-muted leading-[1.65]">{sub}</p>
        </Reveal>
      )}
    </div>
  )
}

// ── Stack pill list ───────────────────────────────────
export function StackPills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(s => <span key={s} className="stack-pill">{s}</span>)}
    </div>
  )
}

// ── Filter tabs ───────────────────────────────────────
interface FilterTabsProps {
  tabs: { value: string; label: string }[]
  active: string
  onChange: (v: string) => void
}

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'font-display text-[13px] font-medium px-5 py-2 rounded-full border transition-all duration-200',
            active === tab.value
              ? 'bg-ink border-ink text-bg'
              : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
