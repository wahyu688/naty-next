'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/',          label: 'Home'     },
  { href: '/timeline',  label: 'Timeline' },
  { href: '/works',     label: 'Works'    },
  { href: '/contact',   label: 'Contact'  },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const nav = navRef.current

    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      // Progress bar
      const bar = document.getElementById('progress-bar')
      if (bar) {
        const max = document.body.scrollHeight - window.innerHeight
        bar.style.width = (y / max * 100) + '%'
      }
      // On the homepage the navbar is hidden under the splash, then reveals
      // gradually as you scroll through the intro (last ~45% of the first screen).
      if (nav) {
        if (isHome) {
          const vh = window.innerHeight
          const p = Math.max(0, Math.min(1, (y - vh * 0.55) / (vh * 0.4)))
          nav.style.opacity = String(p)
          nav.style.transform = `translateY(${(1 - p) * -18}px)`
          nav.style.pointerEvents = p > 0.05 ? 'auto' : 'none'
        } else {
          nav.style.opacity = '1'
          nav.style.transform = 'none'
          nav.style.pointerEvents = 'auto'
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  return (
    <nav
      ref={navRef}
      style={{ opacity: isHome ? 0 : 1 }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-10 py-2',
      'backdrop-blur-xl border-b border-white/[0.05]',
      'transition-[background] duration-300',
      scrolled && 'bg-bg/80',
    )}>
      <Link href="/" className="no-underline">
        <img src="/logo.svg" alt="NATY" className="h-24 w-auto" />
      </Link>

      <ul className="hidden md:flex gap-9 list-none">
        {NAV_LINKS.map(link => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  'text-[14px] no-underline transition-colors duration-200 relative',
                  'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-px after:bg-violet',
                  'after:transition-opacity after:duration-200',
                  isActive
                    ? 'text-ink after:opacity-100'
                    : 'text-muted hover:text-ink after:opacity-0',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <Link href="/contact" className="nav-cta">Hire Us</Link>
    </nav>
  )
}
