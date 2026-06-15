'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TIMELINE, MEMBERS, type TimelineEntry, type Member } from '@/lib/data'
import { PageHero, Marquee, FilterTabs, Reveal } from '@/components/ui'
import clsx from 'clsx'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const TYPE_STYLES: Record<string, string> = {
  project:   'bg-[rgba(255,255,255,0.1)] text-ink',
  award:     'bg-[rgba(255,255,255,0.07)] text-violet-soft',
  learning:  'bg-[rgba(255,255,255,0.06)] text-violet-soft',
  milestone: 'bg-[rgba(255,255,255,0.05)] text-muted',
}

const MARQUEE = ['2023','2024','2025','Projects','Hackathons','Internships','Coursework','Launches','Awards']

interface TimelineClientProps {
  timeline?: TimelineEntry[] | null
  members?:  Member[] | null
}

function EntryCard({ entry, members }: { entry: TimelineEntry; members: Member[] }) {
  const member = entry.member >= 0 ? members.find(m => m.id === entry.member) ?? null : null
  const dotColor  = member?.color.accent ?? '#ededed'
  const badgeBg   = member ? `rgba(${member.color.tint.join(',')},0.15)` : 'rgba(255,255,255,0.1)'
  const badgeColor = member?.color.glow ?? '#ededed'

  return (
    <div data-card className="relative pl-10 mb-5 group"
         style={{ '--dot-color': dotColor } as React.CSSProperties}>
      {/* Timeline dot */}
      <div data-dot className="absolute left-0 top-[18px] w-2 h-2 rounded-full border-2 border-bg
                      transition-transform duration-200 group-hover:scale-150"
           style={{ background: dotColor }} />

      <div className="bg-surface border border-white/[0.05] rounded-card p-6
                      transition-all duration-200 group-hover:border-violet/20
                      group-hover:translate-x-1 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <span className={clsx('text-[10px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full', TYPE_STYLES[entry.type])}>
              {entry.type}
            </span>
            <span className="text-[12px] text-muted">{entry.month}</span>
          </div>
          <h3 className="font-display font-semibold text-[16px] mb-1.5 leading-[1.3]">{entry.title}</h3>
          <p className="text-[13px] text-muted leading-[1.65]">{entry.desc}</p>
        </div>
        {member && (
          <span className="text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                style={{ background: badgeBg, color: badgeColor }}>
            {member.shortName}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TimelineClient({ timeline: timelineProp, members: membersProp }: TimelineClientProps) {
  const timeline = timelineProp ?? TIMELINE
  const members  = membersProp  ?? MEMBERS

  // Build dynamic filter tabs from members
  const FILTERS = [
    { value: 'all', label: 'All members' },
    ...members.map(m => ({ value: String(m.id), label: m.shortName })),
  ]

  const [filter, setFilter] = useState('all')
  const years = [...new Set(timeline.map(e => e.year))].sort((a, b) => +b - +a)

  const filtered = filter === 'all'
    ? timeline
    : timeline.filter(e => String(e.member) === filter || (filter === '0' && e.member === -1))

  const timelineRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = timelineRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const drawST = {
        trigger: container,
        start: 'top 78%',
        end: 'bottom 80%',
        scrub: 1,
      }
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleY: 0 },
          { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: drawST })
      }
      if (beamRef.current) {
        gsap.fromTo(beamRef.current,
          { top: '0%', autoAlpha: 0 },
          { top: '100%', autoAlpha: 1, ease: 'none', scrollTrigger: drawST })
      }

      gsap.utils.toArray<HTMLElement>('[data-year-drift]').forEach((el) => {
        gsap.to(el, {
          yPercent: -22, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-year]').forEach((el) => {
        gsap.from(el, {
          xPercent: -6, autoAlpha: 0, scale: 0.78, filter: 'blur(18px)',
          duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((el) => {
        gsap.from(el, {
          x: -56, autoAlpha: 0, rotateZ: -1.5, filter: 'blur(8px)',
          duration: 0.9, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
        const dot = el.querySelector('[data-dot]')
        if (dot) {
          gsap.from(dot, {
            scale: 0, duration: 0.6, ease: 'back.out(3)', clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          })
        }
      })

      ScrollTrigger.refresh()
    }, container)

    return () => ctx.revert()
  }, [filter])

  return (
    <>
      <PageHero
        label="Our journey"
        title={<>How we got<br /><span className="outline-text">here.</span></>}
        sub="Milestones, projects, and turning points — the full story of five people becoming one team."
      />
      <Marquee items={MARQUEE} />

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-40">
        {/* Legend */}
        <Reveal>
          <div className="flex flex-wrap gap-5 p-5 bg-surface border border-white/[0.05] rounded-card mb-12 mt-12">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-[13px] text-muted">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color.accent }} />
                {m.shortName} — {m.role.split(' · ')[0]}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Filter */}
        <Reveal delay={0.1}>
          <FilterTabs tabs={FILTERS} active={filter} onChange={setFilter} />
        </Reveal>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mt-12">
          <div
            ref={lineRef}
            className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-white/[0.04] via-white/[0.16] to-white/[0.04]"
          />
          <div
            ref={beamRef}
            className="absolute left-[-3.5px] w-2 h-2 rounded-full bg-white -translate-y-1/2
                       shadow-[0_0_16px_4px_rgba(255,255,255,0.45)] pointer-events-none"
            style={{ top: '0%' }}
          />

          {years.map(year => {
            const entries = filtered.filter(e => e.year === year)
            if (!entries.length) return null
            return (
              <div key={year} className="mb-14">
                <div data-year-drift className="will-change-transform">
                  <div data-year
                       className="font-display font-bold leading-[1] tracking-[-0.05em] mb-6 select-none will-change-transform"
                       style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                    {year}
                  </div>
                </div>
                {entries.map(e => (
                  <EntryCard key={e.id} entry={e} members={members} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
