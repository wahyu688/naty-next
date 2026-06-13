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

/** Custom dropdown with a smooth framer-motion open/close + staggered options. */
export function Select({ value, onChange, options, placeholder = 'Select…', error }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
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
              role="listbox"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.028, delayChildren: 0.03 } } }}
              className="max-h-[244px] overflow-y-auto py-1.5"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
