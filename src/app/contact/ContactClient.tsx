'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHero, Reveal } from '@/components/ui'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { Select, type SelectOption } from '@/components/ui/Select'
import {
  MailIcon, InstagramIcon, LinkedInIcon, GithubIcon, ArrowRightIcon, CheckIcon,
  PaletteIcon, CodeIcon, DeviceIcon, CubeIcon, ChipIcon, PlayIcon,
} from '@/components/ui/icons'
import type { SVGProps } from 'react'

type IconType = (p: SVGProps<SVGSVGElement>) => JSX.Element

// Pricing plans (mirror PricingSection) → prefill the form when ?plan= is passed
const PLAN_PREFILL: Record<string, { name: string; price: string; service: string; budget: string }> = {
  basic:       { name: 'Basic Website',             price: 'Rp 1 – 2,5 jt', service: 'Web Development',  budget: 'Under Rp 5.000.000' },
  interactive: { name: 'Interactive User Website',  price: 'Rp 3,5 – 7 jt', service: 'Web Development',  budget: 'Rp 5 – 15 juta'     },
  scale:       { name: 'Big Users Website',         price: 'Rp 10 jt',      service: 'Full-stack Product', budget: 'Rp 5 – 15 juta'  },
  custom:      { name: 'Custom',                    price: 'Rp 3 – 20 jt',  service: 'Full-stack Product', budget: ''                 },
}

const CHANNELS: { Icon: IconType; label: string; value: string; href: string; bg: string }[] = [
  { Icon: MailIcon,      label: 'Email',    value: 'hello@naty.dev',          href: 'mailto:hello@naty.dev',                 bg: 'rgba(255,255,255,0.1)'  },
  { Icon: InstagramIcon, label: 'Instagram',value: '@naty.dev',               href: 'https://instagram.com/naty.dev',         bg: 'rgba(255,255,255,0.08)' },
  { Icon: LinkedInIcon,  label: 'LinkedIn', value: 'NATY — Binus University', href: 'https://linkedin.com/company/naty-dev',  bg: 'rgba(255,255,255,0.06)' },
  { Icon: GithubIcon,    label: 'GitHub',   value: 'github.com/naty-dev',     href: 'https://github.com/naty-dev',            bg: 'rgba(255,255,255,0.05)' },
]

const SERVICES: { Icon: IconType; label: string }[] = [
  { Icon: PaletteIcon, label: 'UI/UX Design'     },
  { Icon: CodeIcon,    label: 'Web Development'   },
  { Icon: DeviceIcon,  label: 'Android Apps'      },
  { Icon: CubeIcon,    label: 'AR/XR'             },
  { Icon: ChipIcon,    label: 'ML / Data'         },
  { Icon: PlayIcon,    label: 'Video Production'  },
]

const SERVICE_OPTIONS: SelectOption[] = [
  'UI/UX Design', 'Web Development', 'Mobile App (Android)', 'AR/XR Development',
  'Data / ML', 'Video Production', 'Full-stack Product', 'Internship / Collaboration', 'Something else',
].map(v => ({ value: v, label: v }))

const BUDGET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Prefer not to say' },
  ...['Under Rp 5.000.000', 'Rp 5 – 15 juta', 'Rp 15 – 50 juta', 'Rp 50 juta+', 'Internship / Volunteer']
    .map(v => ({ value: v, label: v })),
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

  const handleSubmit = async () => {
    const errs: string[] = []
    if (!name.trim()) errs.push('name')
    if (!email.trim()) errs.push('email')
    if (!message.trim()) errs.push('message')
    setErrors(errs)
    if (errs.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, service, budget, message }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSent(true)
    } catch {
      setErrors(['submit'])
    } finally {
      setLoading(false)
    }
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
                <Select
                  value={service}
                  onChange={setService}
                  options={SERVICE_OPTIONS}
                  placeholder="Select a service…"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium tracking-[0.06em] uppercase text-muted mb-2">Budget (optional)</label>
                <Select
                  value={budget}
                  onChange={setBudget}
                  options={BUDGET_OPTIONS}
                  placeholder="Prefer not to say"
                />
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
              {errors.includes('submit') && (
                <p className="text-[13px] text-red text-center">Something went wrong — please try again.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 px-8 bg-surface border border-teal/20 rounded-card">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[rgba(255,255,255,0.06)] border border-white/[0.12] flex items-center justify-center">
                <CheckIcon className="w-7 h-7 text-ink" />
              </div>
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
                 className="group flex items-center gap-4 px-5 py-4 bg-surface border border-white/[0.05] rounded-card
                            no-underline text-ink transition-all duration-200 hover:border-violet/25 hover:translate-x-1">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-ink"
                     style={{ background: c.bg }}>
                  <c.Icon className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <div className="text-[12px] text-muted">{c.label}</div>
                  <div className="font-display font-medium text-[14px]">{c.value}</div>
                </div>
                <ArrowRightIcon className="ml-auto w-4 h-4 text-muted transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            ))}
          </div>

          <span className="section-label">We can help with</span>
          <div className="grid grid-cols-2 gap-2.5">
            {SERVICES.map(s => (
              <div key={s.label}
                   className="group px-4 py-3.5 bg-surface border border-white/[0.05] rounded-sm
                              text-[13px] font-medium text-muted
                              hover:border-violet/25 hover:text-ink transition-all duration-200 cursor-default">
                <s.Icon className="w-[18px] h-[18px] mb-2 text-muted transition-colors duration-200 group-hover:text-ink" />
                {s.label}
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </>
  )
}
