'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { PROJECTS } from '@/lib/data'
import { Reveal, SectionHeader, StackPills } from '@/components/ui'

// ── Projects ────────────────────────────────────────────────
export default function ProjectsSection() {
  const featured = PROJECTS.find(p => p.featured)
  const rest = PROJECTS.filter(p => !p.featured).slice(0, 5)

  return (
    <section id="projects" className="py-[140px] px-6">
      <SectionHeader
        label="Our work"
        title="Products, not just projects."
        sub="We build for real users. Here's a selection of what we've shipped."
      />
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Featured */}
        {featured && (
          <Reveal className="lg:col-span-2">
            <div className="card h-full flex flex-col">
              <div className="h-[240px] flex items-center justify-center text-[72px] relative overflow-hidden"
                   style={{ background: `linear-gradient(135deg, ${featured.gradientFrom}, ${featured.gradientTo})` }}>
                {featured.emoji}
                <span className="absolute top-4 right-4 text-[11px] font-semibold tracking-[0.06em]
                                 px-3 py-1 rounded-full bg-violet/20 text-violet-soft border border-violet/25">
                  Shipped
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-2">{featured.type}</div>
                <div className="font-display font-semibold text-[20px] mb-3">{featured.name}</div>
                <p className="text-[13px] text-muted leading-[1.65] flex-1 mb-5">{featured.desc}</p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <StackPills items={featured.stack.slice(0, 4)} />
                  <Link href="/works" className="text-[13px] font-medium text-violet-soft hover:text-ink transition-colors">
                    Case study →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Rest */}
        {rest.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <div className="card h-full flex flex-col">
              <div className="h-[180px] flex items-center justify-center text-[52px]"
                   style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}>
                {p.emoji}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-2">{p.type}</div>
                <div className="font-display font-semibold text-[16px] mb-2">{p.name}</div>
                <p className="text-[13px] text-muted leading-[1.65] flex-1 mb-4">{p.desc}</p>
                <StackPills items={p.stack.slice(0, 3)} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="text-center mt-12">
        <Reveal>
          <Link href="/works" className="btn-ghost">View all projects →</Link>
        </Reveal>
      </div>
    </section>
  )
}
