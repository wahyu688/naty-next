'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: 1,
        },
      })

      // Subtle drift on the left column while pinned
      tl.fromTo(leftRef.current, { y: 40 }, { y: -24, ease: 'none' }, 0)

      // Skill bars fill, tied to scroll progress (staggered)
      const bars = barsRef.current?.querySelectorAll('[data-bar]')
      if (bars?.length) {
        tl.fromTo(
          bars,
          { width: '0%' },
          { width: (_i: number, el: Element) => `${(el as HTMLElement).dataset.pct}%`, stagger: 0.12, ease: 'none' },
          0,
        )
      }

      // Tech tags stagger in
      const tags = tagsRef.current?.querySelectorAll('[data-tag]')
      if (tags?.length) {
        tl.fromTo(tags, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.04, ease: 'none' }, 0.15)
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="min-h-screen flex items-center px-6 bg-surface border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-20 items-start w-full">
        <div ref={leftRef}>
          <span className="section-label">Capabilities</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-6">
            Broad stack,<br />deep craft.
          </h2>
          <div ref={barsRef} className="flex flex-col gap-2.5">
            {SKILLS.map(s => (
              <div key={s.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-ink">{s.name}</span>
                  <span className="text-muted">{s.pct}%</span>
                </div>
                <div className="h-[3px] bg-surface2 rounded-full overflow-hidden">
                  <div
                    data-bar
                    data-pct={s.pct}
                    className={s.amber ? 'skill-bar-fill-amber' : 'skill-bar-fill'}
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="section-label">Technologies</span>
          <p className="text-[16px] font-light text-muted leading-[1.75] mb-6">
            Tools we&#39;ve shipped production code with — not just tutorials we&#39;ve watched.
          </p>
          <div ref={tagsRef} className="flex flex-wrap gap-2.5">
            {TECHS.map(t => (
              <span
                key={t.label}
                data-tag
                className={`font-display text-[13px] font-medium px-4 py-2 rounded-full border cursor-default
                           transition-all duration-200 hover:-translate-y-0.5 ${
                  t.hot
                    ? 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.14)] text-ink'
                    : 'bg-bg border-white/[0.05] text-muted hover:text-ink hover:border-white/20'
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
