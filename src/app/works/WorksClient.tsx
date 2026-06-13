'use client'

import { useState } from 'react'
import { PROJECTS, MEMBERS, type Project } from '@/lib/data'
import { PageHero, Marquee, FilterTabs, Reveal, StackPills } from '@/components/ui'
import clsx from 'clsx'

const FILTERS = [
  { value: 'all',    label: 'All'       },
  { value: 'web',    label: 'Web'       },
  { value: 'mobile', label: 'Mobile'    },
  { value: 'ar',     label: 'AR/XR'     },
  { value: 'data',   label: 'Data / ML' },
  { value: 'design', label: 'Design'    },
]

const STATUS_STYLES: Record<string, string> = {
  live:      'bg-[rgba(93,202,165,0.15)] text-teal border border-teal/25',
  shipped:   'bg-[rgba(124,92,252,0.13)] text-violet-soft border border-violet/25',
  wip:       'bg-[rgba(245,166,35,0.1)] text-amber border border-amber/25',
  portfolio: 'bg-surface2 text-muted border border-white/[0.05]',
}

const MARQUEE = ['Marketplace','AR/XR','Mobile','ML / Data','Location Intel','Dashboard','Sustainability']

function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-10
                    bg-bg/85 backdrop-blur-xl"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-white/[0.09] rounded-[20px] w-full max-w-[720px]
                      max-h-[85vh] overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-start justify-between gap-4 p-8 pb-0">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-1">{project.type}</div>
            <h3 className="font-display font-bold text-[26px] tracking-[-0.03em]">{project.name}</h3>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface2 border border-white/[0.05]
                       text-muted text-lg flex items-center justify-center flex-shrink-0
                       hover:text-ink hover:bg-white/[0.09] transition-colors duration-200">
            ×
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Overview</div>
            <p className="text-[14px] text-muted leading-[1.75]">{project.overview}</p>
          </div>
          <div className="h-px bg-white/[0.05]" />
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">The challenge</div>
            <p className="text-[14px] text-muted leading-[1.75]">{project.challenge}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">The solution</div>
            <p className="text-[14px] text-muted leading-[1.75]">{project.solution}</p>
          </div>
          <div className="h-px bg-white/[0.05]" />
          <div className="flex flex-wrap gap-8">
            <div className="flex-1">
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Stack</div>
              <StackPills items={project.stack} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Role</div>
              <p className="text-[14px] text-muted">{project.role}</p>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Year</div>
              <p className="text-[14px] text-muted">{project.year}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorksClient() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Project | null>(null)

  const visible = PROJECTS.filter(p =>
    filter === 'all' || p.categories.includes(filter as any)
  )

  return (
    <>
      <PageHero
        label="Selected work"
        title={<>What we&#39;ve<br /><span className="outline-text">shipped.</span></>}
        sub="Real products, real constraints, real users. Every project here was finished, deployed, and used."
      />
      <Marquee items={MARQUEE} />

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-40">
        <div className="flex items-center justify-between flex-wrap gap-4 mt-12 mb-10">
          <Reveal>
            <FilterTabs tabs={FILTERS} active={filter} onChange={setFilter} />
          </Reveal>
          <span className="text-[13px] text-muted">{visible.length} project{visible.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04} className={clsx(p.featured && 'lg:col-span-2')}>
              <div
                className="card h-full flex flex-col cursor-pointer"
                onClick={() => setSelected(p)}
              >
                <div
                  className={clsx('relative flex items-center justify-center overflow-hidden',
                    p.featured ? 'h-[240px] text-[72px]' : 'h-[180px] text-[52px]')}
                  style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                >
                  {p.emoji}
                  <span className={clsx('absolute top-4 right-4 text-[11px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full', STATUS_STYLES[p.status])}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-2">{p.type}</div>
                  <div className="font-display font-semibold text-[17px] mb-2">{p.name}</div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {p.members.map(mi => {
                      const m = MEMBERS[mi]
                      return (
                        <span key={mi} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                              style={{ background: `rgba(${m.color.tint.join(',')},0.15)`, color: m.color.glow }}>
                          {m.shortName}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-[13px] text-muted leading-[1.65] flex-1 mb-5">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <StackPills items={p.stack.slice(0, 3)} />
                    <span className="text-[13px] font-medium text-violet-soft ml-3">Case study →</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {selected && <CaseModal project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
