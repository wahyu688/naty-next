// PricingSection.tsx — pinned section, cards animate by scroll progress (mirrors AboutSection)
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Website',
    price: 'Rp 1 – 2,5 jt',
    tagline: 'Landing pages & company profiles',
    features: ['1–4 static pages', 'Fully responsive', 'Basic SEO setup', 'Contact form'],
  },
  {
    id: 'interactive',
    name: 'Interactive User Website',
    price: 'Rp 3,5 – 7 jt',
    tagline: 'Dynamic sites built around your users',
    features: ['Auth & user accounts', 'CMS / dashboard', 'Database integration', 'Motion & micro-interactions'],
    featured: true,
  },
  {
    id: 'scale',
    name: 'Big Users Website',
    price: 'Rp 10 jt',
    tagline: 'Engineered to scale for high traffic',
    features: ['Scalable architecture', 'Roles & permissions', 'Payment / API integrations', 'Performance tuning'],
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 'Rp 3 – 20 jt',
    tagline: 'Tailored to your exact scope',
    features: ['Scope on request', 'AR/XR, ML, mobile', 'Full-stack product', 'Dedicated support'],
  },
]

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=90%',   // pin distance — keep it short so it stays subtle
          pin: true,
          scrub: 1,
        },
      })
      // Subtle drift on the header while pinned
      tl.fromTo(headRef.current, { y: 40 }, { y: -40, ease: 'none' }, 0)
      // Cards stagger in, tied to scroll progress
      const cards = cardsRef.current?.querySelectorAll('[data-card]')
      if (cards?.length) {
        tl.fromTo(
          cards,
          { autoAlpha: 0, y: 64 },
          { autoAlpha: 1, y: 0, stagger: 0.14, ease: 'none' },
          0.1,
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="min-h-screen flex items-center px-6 bg-surface border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto w-full">
        <div ref={headRef} className="max-w-[600px] mb-14">
          <span className="section-label">Pricing</span>
          <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-6 text-balance">
            Pick the build<br />that fits your stage.
          </h2>
          <p className="text-[16px] font-light text-muted leading-[1.75] max-w-[52ch]">
            Transparent starting ranges — pick a plan and tell us about your project. Final quotes
            are scoped together, no surprises.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(p => (
            <Link
              key={p.id}
              href={`/contact?plan=${p.id}`}
              data-card
              className={`group relative flex flex-col rounded-card p-6 no-underline
                          transition-all duration-300 hover:-translate-y-1.5
                          ${p.featured
                            ? 'bg-surface2 border border-white/[0.14] hover:border-white/25'
                            : 'bg-bg border border-white/[0.06] hover:border-white/[0.18]'}`}
            >
              {p.featured && (
                <span className="absolute top-5 right-5 text-[10px] font-semibold tracking-[0.08em] uppercase
                                 px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.1)] border border-white/[0.12] text-ink">
                  Popular
                </span>
              )}

              <h3 className="font-display font-semibold text-[17px] tracking-[-0.02em] mb-1 pr-16">{p.name}</h3>
              <p className="text-[12.5px] text-muted leading-[1.5] mb-5 min-h-[34px]">{p.tagline}</p>

              <div className="font-display font-bold text-[1.9rem] tracking-[-0.04em] leading-[1] mb-6">
                {p.price}
              </div>

              <ul className="flex flex-col gap-2.5 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-muted leading-[1.45]">
                    <span className="mt-[2px] text-ink flex-shrink-0">✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              <span className="mt-auto inline-flex items-center gap-1.5 font-display font-medium text-[13px] text-ink
                               transition-transform duration-200 group-hover:gap-2.5">
                Get started
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
