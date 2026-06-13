'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { Reveal } from '@/components/ui'

const SKILLS = [
  { name: 'UI/UX & Product Design', pct: 92, amber: false },
  { name: 'Frontend Development',   pct: 88, amber: false },
  { name: 'Mobile (Android/iOS)',    pct: 78, amber: true  },
  { name: 'Machine Learning & Data', pct: 75, amber: true  },
  { name: 'AR/XR Development',      pct: 70, amber: false },
]

const TECHS = [
  { label: 'Vue 3',      hot: true  },
  { label: 'React',      hot: true  },
  { label: 'Figma',      hot: true  },
  { label: 'TypeScript', hot: false },
  { label: 'Tailwind',   hot: true  },
  { label: 'Supabase',   hot: false },
  { label: 'Unity',      hot: false },
  { label: 'Vuforia',    hot: false },
  { label: 'Android',    hot: false },
  { label: 'Python',     hot: false },
  { label: 'Node.js',    hot: true  },
  { label: 'Pinia',      hot: false },
  { label: 'Vite',       hot: false },
  { label: 'Vercel',     hot: false },
  { label: 'After Effects', hot: false },
  { label: 'Power BI',   hot: false },
]

function SkillBar({ name, pct, amber }: { name: string; pct: number; amber: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        <span className="font-medium text-ink">{name}</span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div className="h-[3px] bg-surface2 rounded-full overflow-hidden">
        <div
          className={amber ? 'skill-bar-fill-amber' : 'skill-bar-fill'}
          style={{ width: inView ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  )
}

export default function SkillsSection() {
  return (
    <section id="skills" className="py-[120px] px-6 bg-surface border-t border-white/[0.05]">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-20 items-start">
        <div>
          <Reveal><span className="section-label">Capabilities</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-6">
              Broad stack,<br />deep craft.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-col gap-2.5">
              {SKILLS.map(s => <SkillBar key={s.name} {...s} />)}
            </div>
          </Reveal>
        </div>
        <div>
          <Reveal><span className="section-label">Technologies</span></Reveal>
          <Reveal delay={0.1}>
            <p className="text-[16px] font-light text-muted leading-[1.75] mb-6">
              Tools we&#39;ve shipped production code with — not just tutorials we&#39;ve watched.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap gap-2.5">
              {TECHS.map(t => (
                <span key={t.label}
                  className={`font-display text-[13px] font-medium px-4 py-2 rounded-full border cursor-default
                             transition-all duration-200 hover:-translate-y-0.5 ${
                    t.hot
                      ? 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.14)] text-ink'
                      : 'bg-bg border-white/[0.05] text-muted hover:text-ink hover:border-white/20'
                  }`}>
                  {t.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
