// AboutSection.tsx
'use client'
import { Reveal } from '@/components/ui'

export default function AboutSection() {
  return (
    <section id="about" className="py-[140px] px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <Reveal><span className="section-label">Who we are</span></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-6 text-balance">
              A team forged in late-night commits.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[16px] font-light text-muted leading-[1.75] max-w-[60ch]">
              <strong className="text-ink font-medium">NATY</strong> (derived from{' '}
              <em>Nusantara</em>) is a five-person software house run by CS students at Binus
              University, Jakarta. We design, develop, and deliver — from prototypes to production.
              <br /><br />
              We&#39;re not just students finishing assignments. We ship real products, take on real
              clients, and hold each other accountable for craft that works in the wild.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 gap-0.5 rounded-card overflow-hidden border border-white/[0.05]">
            {[
              { num: '5+', label: 'Team members' },
              { num: '12+', label: 'Projects shipped' },
              { num: '3rd', label: 'Year of study' },
              { num: '∞', label: 'Cups of coffee' },
            ].map(s => (
              <div key={s.label}
                className="bg-surface hover:bg-surface2 transition-colors duration-200 p-9">
                <div className="font-display font-bold text-[2.8rem] tracking-[-0.04em] leading-[1]">
                  {s.num.replace(/[+rd]/, '')}<span className="text-violet">{s.num.match(/[+rd]/)?.[0]}</span>
                </div>
                <div className="text-[13px] text-muted mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
