import Link from 'next/link'
import { Reveal } from '@/components/ui'

export default function ContactCTA() {
  return (
    <section id="contact-cta" className="py-[160px] px-6 text-center">
      <div className="max-w-[640px] mx-auto">
        <Reveal><span className="section-label">Get in touch</span></Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.04em] leading-[1.1] mb-5 text-balance">
            Let&#39;s build something real.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[16px] text-muted leading-[1.7] mb-12">
            Open to freelance, internship, and collaboration opportunities.
            Tell us what you&#39;re building.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link href="/contact" className="btn-primary">Start a conversation →</Link>
        </Reveal>
      </div>
    </section>
  )
}
