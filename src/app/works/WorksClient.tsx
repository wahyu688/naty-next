'use client'

import { useState } from 'react'
import { PROJECTS, MEMBERS, type Project, type Member } from '@/lib/data'
import { PageHero, Marquee, FilterTabs, Reveal, StackPills } from '@/components/ui'
import { ProjectModal } from '@/components/ui/ProjectModal'
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
  live:      'bg-[rgba(255,255,255,0.14)] text-ink border border-white/25',
  shipped:   'bg-[rgba(255,255,255,0.1)] text-violet-soft border border-white/20',
  wip:       'bg-[rgba(255,255,255,0.07)] text-violet-soft border border-white/15',
  portfolio: 'bg-surface2 text-muted border border-white/[0.05]',
}

const MARQUEE = ['Marketplace','AR/XR','Mobile','ML / Data','Location Intel','Dashboard','Sustainability']

interface WorksClientProps {
  projects?: Project[] | null
  members?: Member[] | null
}

export default function WorksClient({ projects: projectsProp, members: membersProp }: WorksClientProps) {
  const projects = projectsProp ?? PROJECTS
  const members  = membersProp  ?? MEMBERS

  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Project | null>(null)

  // Lookup member by ID (safe fallback to first member)
  const getMember = (id: number) => members.find(m => m.id === id) ?? members[0]

  const visible = projects.filter(p =>
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

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-24 md:pb-40">
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
                  style={p.preview_url ? undefined : { background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                >
                  {p.preview_url
                    ? <img src={p.preview_url} alt={p.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    : p.emoji
                  }
                  <span className={clsx('absolute top-4 right-4 text-[11px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full', STATUS_STYLES[p.status])}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-2">{p.type}</div>
                  <div className="font-display font-semibold text-[17px] mb-2">{p.name}</div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {p.members.map(mi => {
                      const m = getMember(mi)
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

      {selected && <ProjectModal project={selected} members={members} onClose={() => setSelected(null)} />}
    </>
  )
}
