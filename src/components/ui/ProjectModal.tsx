'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import clsx from 'clsx'
import { MEMBERS, type Project, type Member } from '@/lib/data'
import { StackPills } from '@/components/ui'

const STATUS_STYLES: Record<string, string> = {
  live:      'bg-[rgba(255,255,255,0.14)] text-ink border border-white/25',
  shipped:   'bg-[rgba(255,255,255,0.1)] text-violet-soft border border-white/20',
  wip:       'bg-[rgba(255,255,255,0.07)] text-violet-soft border border-white/15',
  portfolio: 'bg-surface2 text-muted border border-white/[0.05]',
}

interface ProjectModalProps {
  project: Project
  onClose: () => void
  members?: Member[]
}

// Shared case-study detail — used by the Works page grid and the Home projects carousel.
// Rendered through a portal so it escapes the GSAP-pinned (transformed) section that
// would otherwise clip a `position: fixed` element and break the backdrop blur / scroll.
export function ProjectModal({ project, onClose, members = MEMBERS }: ProjectModalProps) {
  const lenis = useLenis()
  const getMember = (id: number) => members.find(m => m.id === id) ?? members[0]

  // Collect every image we have for this project (header preview + extra gallery shots).
  const images = [project.preview_url, ...(project.gallery ?? [])].filter(Boolean) as string[]
  const [active, setActive] = useState(0)

  // Portal target only exists on the client.
  const [mounted, setMounted] = useState(false)
  // Drives the enter/exit animation; closing plays the exit before unmounting.
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    setMounted(true)
    setOpen(true)
  }, [])

  // Lock background scroll (incl. Lenis) and wire up Escape-to-close while open.
  useEffect(() => {
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lenis])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-10 bg-bg/80"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            data-lenis-prevent
            className="bg-surface border border-white/[0.09] rounded-[20px] w-full max-w-[720px]
                       max-h-[85vh] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Image banner — main shot + thumbnail strip, or gradient fallback */}
            <div className="relative">
              <div className="relative h-[260px] md:h-[320px] overflow-hidden rounded-t-[20px]"
                   style={images.length ? undefined : { background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})` }}>
                {images.length ? (
                  <img src={images[active]} alt={project.name}
                       className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[80px]">{project.emoji}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                <span className={clsx('absolute top-4 left-4 text-[11px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full', STATUS_STYLES[project.status])}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <button onClick={handleClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface2/90 backdrop-blur border border-white/[0.08]
                             text-muted text-lg flex items-center justify-center
                             hover:text-ink hover:bg-white/[0.12] transition-colors duration-200">
                  ×
                </button>
              </div>

              {/* Thumbnails — only when there is more than one image */}
              {images.length > 1 && (
                <div className="flex gap-2 px-8 -mt-8 relative">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setActive(i)}
                      aria-label={`View image ${i + 1}`}
                      className={clsx(
                        'h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0',
                        i === active ? 'border-ink' : 'border-white/15 opacity-60 hover:opacity-100',
                      )}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 px-8 pt-7">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-amber mb-1">{project.type}</div>
                <h3 className="font-display font-bold text-[26px] tracking-[-0.03em]">{project.name}</h3>
              </div>
            </div>

            <div className="p-8 pt-6 space-y-6">
              {/* Contributors */}
              {project.members.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {project.members.map(mi => {
                    const m = getMember(mi)
                    return (
                      <span key={mi} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                            style={{ background: `rgba(${m.color.tint.join(',')},0.15)`, color: m.color.glow }}>
                        {m.shortName}
                      </span>
                    )
                  })}
                </div>
              )}
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Overview</div>
                <p className="text-[14px] text-muted leading-[1.75]">{project.overview}</p>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">The challenge</div>
                <p className="text-[14px] text-muted leading-[1.75]">{project.challenge}</p>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">The solution</div>
                <p className="text-[14px] text-muted leading-[1.75]">{project.solution}</p>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div className="flex flex-wrap gap-8">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Stack</div>
                  <StackPills items={project.stack} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Role</div>
                  <p className="text-[14px] text-muted">{project.role}</p>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-soft mb-2">Year</div>
                  <p className="text-[14px] text-muted">{project.year}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
