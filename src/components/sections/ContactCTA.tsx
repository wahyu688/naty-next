'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ContactCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=80%',
          pin: true,
          scrub: 1,
        },
      })
      const items = innerRef.current?.querySelectorAll('[data-cta]')
      if (items?.length) {
        tl.fromTo(items, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, stagger: 0.15, ease: 'none' }, 0)
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact-cta"
      className="min-h-screen flex items-center px-6 text-center overflow-hidden"
    >
      <div ref={innerRef} className="max-w-[640px] mx-auto w-full">
        <span data-cta className="section-label">Get in touch</span>
        <h2 data-cta className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.04em] leading-[1.1] mb-5 text-balance">
          Let&#39;s build something real.
        </h2>
        <p data-cta className="text-[16px] text-muted leading-[1.7] mb-12">
          Open to freelance, internship, and collaboration opportunities.
          Tell us what you&#39;re building.
        </p>
        <div data-cta>
          <Link href="/contact">
            <LiquidButton size="xl" className="text-white border border-white/20 font-semibold text-[15px]">
              Start a conversation →
            </LiquidButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
