'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { ChevronDownIcon, CheckIcon } from './icons'

export interface SelectOption { value: string; label: string }

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: boolean
}

export function Select({ value, onChange, options, placeholder = 'Select…', error }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const selected = options.find(o => o.value === value && value !== '')

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Check if list is scrollable after open
  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return
    const check = () => {
      const scrollable = el.scrollHeight > el.clientHeight
      setIsScrollable(scrollable)
      setIsAtBottom(!scrollable || el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
    }
    // Wait for animation to settle
    const t = setTimeout(check, 60)
    el.addEventListener('scroll', check)
    return () => { clearTimeout(t); el.removeEventListener('scroll', check) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'w-full flex items-center justify-between gap-3 bg-surface border rounded-sm',
          'text-[14px] px-4 py-3.5 outline-none transition-all duration-200 text-left',
          error
            ? 'border-red/60 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]'
            : open
              ? 'border-violet/50 shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'
              : 'border-white/[0.09] hover:border-white/20',
        )}
      >
        <span className={clsx('truncate', selected ? 'text-ink' : 'text-muted')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={clsx('w-4 h-4 text-muted shrink-0 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full mt-2 z-30 origin-top
                       bg-surface2 border border-white/[0.1] rounded-[10px] overflow-hidden
                       shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
          >
            <motion.ul
              ref={listRef}
              role="listbox"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.028, delayChildren: 0.03 } } }}
              data-lenis-prevent
              className="max-h-[244px] overflow-y-auto overscroll-contain py-1.5 [scrollbar-width:none]"
            >
              {options.map(o => {
                const active = o.value === value
                return (
                  <motion.li
                    key={o.value || o.label}
                    role="option"
                    aria-selected={active}
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                  >
                    <button
                      type="button"
                      onClick={() => { onChange(o.value); setOpen(false) }}
                      className={clsx(
                        'w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px]',
                        'transition-colors duration-150',
                        active ? 'text-ink bg-white/[0.05]' : 'text-muted hover:text-ink hover:bg-white/[0.04]',
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {active && <CheckIcon className="w-4 h-4 shrink-0 text-ink" />}
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>

            {/* Scroll indicator — fade + chevron, hides when at bottom */}
            <AnimatePresence>
              {isScrollable && !isAtBottom && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-14
                             bg-gradient-to-t from-surface2 to-transparent
                             flex items-end justify-center pb-2"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-muted/60">scroll</span>
                    <svg className="w-3.5 h-3.5 text-muted/50 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
