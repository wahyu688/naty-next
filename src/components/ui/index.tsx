'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import clsx from 'clsx'

// ── Reveal wrapper ────────────────────────────────────
interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
}

export function Reveal({ children, delay = 0, className, y = 36 }: RevealProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ── Marquee ───────────────────────────────────────────
interface MarqueeProps {
  items: string[]
}

export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-t border-b border-white/[0.05] py-[18px] bg-surface">
      <div className="flex gap-16 w-max animate-marquee">
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
    <div className="max-w-[1100px] mx-auto px-10 pt-40 pb-20">
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
              ? 'bg-violet border-violet text-white'
              : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
