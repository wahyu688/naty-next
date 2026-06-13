'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/',          label: 'Home'     },
  { href: '/timeline',  label: 'Timeline' },
  { href: '/works',     label: 'Works'    },
  { href: '/contact',   label: 'Contact'  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      // Progress bar
      const bar = document.getElementById('progress-bar')
      if (bar) {
        const max = document.body.scrollHeight - window.innerHeight
        bar.style.width = (window.scrollY / max * 100) + '%'
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={clsx(
      'fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-10 py-5',
      'backdrop-blur-xl border-b border-white/[0.05]',
      'transition-[background] duration-300',
      scrolled && 'bg-bg/80',
    )}>
      <Link href="/" className="font-display font-bold text-[22px] tracking-[-0.03em] text-ink no-underline">
        NAT<span className="text-violet">Y</span>
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
