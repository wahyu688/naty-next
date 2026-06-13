import Link from 'next/link'

const LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/timeline', label: 'Timeline' },
  { href: '/works',    label: 'Works'    },
  { href: '/contact',  label: 'Contact'  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted">
      <img src="/logo.svg" alt="NATY" className="h-7 w-auto" />
      <nav className="flex gap-6">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} className="text-muted hover:text-ink transition-colors duration-200 no-underline">
            {l.label}
          </Link>
        ))}
      </nav>
      <span>© 2025 NATY · Binus University · Jakarta</span>
    </footer>
  )
}
