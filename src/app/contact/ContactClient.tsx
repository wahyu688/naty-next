'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHero, Reveal } from '@/components/ui'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

// Pricing plans (mirror PricingSection) → prefill the form when ?plan= is passed
const PLAN_PREFILL: Record<string, { name: string; price: string; service: string; budget: string }> = {
  basic:       { name: 'Basic Website',             price: 'Rp 1 – 2,5 jt', service: 'Web Development',  budget: 'Under Rp 5.000.000' },
  interactive: { name: 'Interactive User Website',  price: 'Rp 3,5 – 7 jt', service: 'Web Development',  budget: 'Rp 5 – 15 juta'     },
  scale:       { name: 'Big Users Website',         price: 'Rp 10 jt',      service: 'Full-stack Product', budget: 'Rp 5 – 15 juta'  },
  custom:      { name: 'Custom',                    price: 'Rp 3 – 20 jt',  service: 'Full-stack Product', budget: ''                 },
}

const CHANNELS = [
  { icon: '📧', label: 'Email',    value: 'hello@naty.dev',              href: 'mailto:hello@naty.dev',                  bg: 'rgba(255,255,255,0.1)'  },
  { icon: '📸', label: 'Instagram',value: '@naty.dev',                   href: 'https://instagram.com/naty.dev',          bg: 'rgba(255,255,255,0.08)' },
  { icon: '💼', label: 'LinkedIn', value: 'NATY — Binus University',     href: 'https://linkedin.com/company/naty-dev',   bg: 'rgba(255,255,255,0.06)' },
  { icon: '💻', label: 'GitHub',   value: 'github.com/naty-dev',         href: 'https://github.com/naty-dev',             bg: 'rgba(255,255,255,0.05)' },
]

const SERVICES = [
  { icon: '🎨', label: 'UI/UX Design'    },
  { icon: '⚡', label: 'Web Development' },
  { icon: '📱', label: 'Android Apps'    },
  { icon: '🥽', label: 'AR/XR'           },
  { icon: '🤖', label: 'ML / Data'       },
  { icon: '🎬', label: 'Video Production'},
]

export default function ContactClient() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [service, setService] = useState('')
  const [budget, setBudget] = useState('')
  const [company, setCompany] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Prefill from a pricing card click (?plan=basic|interactive|scale|custom)
  const searchParams = useSearchParams()
  useEffect(() => {
    const plan = searchParams.get('plan')
    if (!plan) return
    const p = PLAN_PREFILL[plan]
    if (!p) return
    setService(p.service)
    setBudget(p.budget)
    setMessage(prev =>
      prev ? prev : `Hi NATY! I'm interested in the "${p.name}" plan (${p.price}). Here's a bit about my project:\n\n`,
    )
  }, [searchParams])

  const handleSubmit = () => {
    const errs: string[] = []
    if (!name.trim()) errs.push('name')
    if (!email.trim()) errs.push('email')
    if (!message.trim()) errs.push('message')
    setErrors(errs)
    if (errs.length) return
    setLoading(true)
    setTimeout(() => { setSent(true); setLoading(false) }, 1200)
  }

  const inputClass = (field: string) =>
    `w-full bg-surface border rounded-sm text-ink font-sans text-[14px] px-4 py-3.5 outline-none transition-all duration-200
     ${errors.includes(field)
      ? 'border-red/60 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]'
      : 'border-white/[0.09] focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'}`

  return (
    <>
      <PageHero
        label="Get in touch"
        title={<>Let&#39;s build<br /><span className="outline-text">together.</span></>}
        sub="Open to freelance, internship, and collaboration. Tell us what you're building."
      />

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-40 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

        {/* FORM */}
        <Reveal>
          <h2 className="font-display font-bold text-[22px] tracking-[-0.03em] mb-2">Send us a message</h2>
          <p className="text-[14px] text-muted mb-8">Fill in the form and we&#39;ll get back to you within 24 hours.</p>

          {!sent ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">Your name</label>
                  <input className={inputClass('name')} placeholder="Budi Santoso" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">Email</label>
                  <input type="email" className={inputClass('email')} placeholder="budi@co.id" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">Company / Organization</label>
                <input className={inputClass('company')} placeholder="Startup / University / Personal" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">What do you need?</label>
                <select className={inputClass('service')} value={service} onChange={e => setService(e.target.value)}>
                  <option value="">Select a service...</option>
                  <option>UI/UX Design</option><option>Web Development</option>
                  <option>Mobile App (Android)</option><option>AR/XR Development</option>
                  <option>Data / ML</option><option>Video Production</option>
                  <option>Full-stack Product</option><option>Internship / Collaboration</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">Budget (optional)</label>
                <select className={inputClass('budget')} value={budget} onChange={e => setBudget(e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option>Under Rp 5.000.000</option><option>Rp 5 – 15 juta</option>
                  <option>Rp 15 – 50 juta</option><option>Rp 50 juta+</option>
                  <option>Internship / Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">About the project</label>
                <textarea className={`${inputClass('message')} resize-y min-h-[140px] leading-[1.65]`}
                  placeholder="What are you building? What's the deadline? What matters most to you?"
                  value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              <LiquidButton onClick={handleSubmit} disabled={loading} size="xl"
                className="w-full rounded-full text-white border border-white/20 font-semibold text-[16px] py-4">
                {loading ? 'Sending...' : 'Send message →'}
              </LiquidButton>
            </div>
          ) : (
            <div className="text-center py-12 px-8 bg-surface border border-teal/20 rounded-card">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-display font-semibold text-[20px] mb-2">Message sent!</h3>
              <p className="text-[14px] text-muted mb-6">We&#39;ll get back to you within 24 hours.</p>
              <Link href="/works">
                <LiquidButton size="lg" className="text-white border border-white/20 font-medium text-[14px]">View our work →</LiquidButton>
              </Link>
            </div>
          )}
        </Reveal>

        {/* INFO */}
        <Reveal delay={0.15}>
          {/* Availability */}
          <div className="p-5 bg-surface border border-white/[0.05] rounded-card mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" style={{ animation: 'pulse2 2.5s infinite' }} />
              <span className="font-display font-semibold text-[14px]">Available for new projects</span>
            </div>
            <p className="text-[13px] text-muted leading-[1.6]">
              Open to freelance and part-time collaboration alongside our studies. Response time: under 24 hours.
            </p>
          </div>

          <h3 className="font-display font-bold text-[22px] tracking-[-0.03em] mb-5">Reach us directly</h3>
          <div className="flex flex-col gap-3 mb-8">
            {CHANNELS.map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-4 px-5 py-4 bg-surface border border-white/[0.05] rounded-card
                            no-underline text-ink transition-all duration-200 hover:border-violet/25 hover:translate-x-1">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                     style={{ background: c.bg }}>{c.icon}</div>
                <div>
                  <div className="text-[12px] text-muted">{c.label}</div>
                  <div className="font-display font-medium text-[14px]">{c.value}</div>
                </div>
                <span className="ml-auto text-muted text-[16px]">→</span>
              </a>
            ))}
          </div>

          <span className="section-label">We can help with</span>
          <div className="grid grid-cols-2 gap-2.5">
            {SERVICES.map(s => (
              <div key={s.label}
                   className="px-4 py-3.5 bg-surface border border-white/[0.05] rounded-sm
                              text-[13px] font-medium text-muted
                              hover:border-violet/25 hover:text-ink transition-all duration-200 cursor-default">
                <span className="block text-[16px] mb-1">{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </>
  )
}
