'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLenis } from 'lenis/react'
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
  const [open, setOpen] = useState(false)
  const lenis = useLenis()

  // Close the mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock background scroll (incl. Lenis) while the mobile menu is open
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

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
        'fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 sm:px-8 md:px-10 py-2',
      'backdrop-blur-xl border-b border-white/[0.05]',
      'transition-[background] duration-300',
      scrolled && 'bg-bg/80',
    )}>
      <Link href="/" className="no-underline">
        <img src="/logo.svg" alt="NATY" className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto" />
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

      <Link href="/contact" className="nav-cta hidden md:inline-flex">Hire Us</Link>

      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="md:hidden relative z-[110] -mr-1.5 flex h-10 w-10 items-center justify-center"
      >
        <span className="flex h-4 w-5 flex-col justify-between">
          <motion.span
            className="block h-px w-5 bg-ink origin-center"
            animate={open ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            className="block h-px w-5 bg-ink"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-px w-5 bg-ink origin-center"
            animate={open ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
      </button>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-full left-0 right-0 overflow-hidden bg-bg border-b border-white/[0.05]"
          >
            <ul className="flex flex-col px-5 sm:px-8 pt-2 list-none">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href} className="border-b border-white/[0.05] last:border-none">
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        'block py-3.5 text-[15px] no-underline transition-colors duration-200',
                        isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="px-5 sm:px-8 py-5">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="nav-cta w-full justify-center"
              >
                Hire Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
