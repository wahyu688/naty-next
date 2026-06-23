'use client'

import Link from 'next/link'

const NAV = [
  { href: '/',         label: 'Home'     },
  { href: '/timeline', label: 'Timeline' },
  { href: '/works',    label: 'Works'    },
  { href: '/contact',  label: 'Contact'  },
]

const SERVICES = [
  { href: '/contact?plan=basic',       label: 'Basic Website'   },
  { href: '/contact?plan=interactive', label: 'Interactive Web' },
  { href: '/contact?plan=scale',       label: 'Scalable Web'    },
  { href: '/contact?plan=custom',      label: 'Custom Build'    },
]

const SOCIAL = [
  { label: 'Email',     value: 'hello@naty.dev',  href: 'mailto:hello@naty.dev' },
  { label: 'Instagram', value: '@naty.dev',       href: 'https://instagram.com/naty.dev' },
  { label: 'LinkedIn',  value: 'NATY',            href: 'https://linkedin.com/company/naty-dev' },
  { label: 'GitHub',    value: 'naty-dev',        href: 'https://github.com/naty-dev' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-surface border-t border-white/[0.05] overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-20 pb-10">

        {/* ── Top: brand + link columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-12 lg:gap-10 mb-16">

          {/* Brand */}
          <div>
            <img src="/logo.svg" alt="NATY" className="h-10 w-auto mb-5" />
            <p className="text-[14px] font-light text-muted leading-[1.7] max-w-[34ch] mb-6">
              A six-person software house run by CS students at Binus University, Jakarta.
              We design, develop, and ship real products.
            </p>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-bg border border-white/[0.06] rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" style={{ animation: 'pulse2 2.5s infinite' }} />
              <span className="text-[12.5px] font-medium text-ink">Available for new projects</span>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <span className="section-label">Navigate</span>
            <ul className="flex flex-col gap-3 list-none">
              {NAV.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-muted hover:text-ink transition-colors duration-200 no-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <span className="section-label">Services</span>
            <ul className="flex flex-col gap-3 list-none">
              {SERVICES.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-muted hover:text-ink transition-colors duration-200 no-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <span className="section-label">Connect</span>
            <ul className="flex flex-col gap-3 list-none">
              {SOCIAL.map(s => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 text-[14px] no-underline"
                  >
                    <span className="text-muted group-hover:text-ink transition-colors duration-200">{s.label}</span>
                    <span className="text-[12.5px] text-muted/60 group-hover:text-muted transition-colors duration-200">{s.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <span className="text-[12.5px] text-muted">
            © {year} NATY · Binus University · Jakarta
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 text-[12.5px] text-muted hover:text-ink transition-colors duration-200"
          >
            Back to top
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/[0.1] group-hover:border-white/25 group-hover:-translate-y-0.5 transition-all duration-200">
              ↑
            </span>
          </button>
        </div>
      </div>

      {/* ── Oversized brand wordmark ── */}
      <div
        aria-hidden
        className="select-none pointer-events-none font-display font-bold tracking-[-0.05em] leading-[0.8]
                   text-center whitespace-nowrap outline-text
                   text-[clamp(5rem,22vw,18rem)] -mb-[0.12em]"
      >
        NATY
      </div>
    </footer>
  )
}
