'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useInView } from 'framer-motion'
import Link from 'next/link'
import { MEMBERS, type Member } from '@/lib/data'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

// ── Pixel renderer ──────────────────────────────────────────
const PX = 8

interface Particle {
  x: number; y: number; size: number
  vx: number; vy: number; alpha: number
  life: number; decay: number; color: string
}

function makeParticles(W: number, H: number, color: string): Particle[] {
  return Array.from({ length: 80 }, () => ({
    x: Math.random() * W, y: H + Math.random() * 60,
    size: (Math.floor(Math.random() * 3) + 1) * PX * 0.4,
    vx: (Math.random() - 0.5) * 0.6, vy: -(Math.random() * 0.9 + 0.3),
    alpha: Math.random() * 0.5 + 0.1, life: Math.random(),
    decay: 0.0015 + Math.random() * 0.002, color,
  }))
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, W: number, H: number, tint: number[]) {
  const [r, g, b] = tint
  ctx.fillStyle = '#08090d'
  ctx.fillRect(0, 0, W, H)
  const grad = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.6)
  grad.addColorStop(0, `rgba(${r},${g},${b},0.12)`)
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  const cols = Math.ceil(W / PX), rows = Math.ceil(H / PX)
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const nx = gx / cols - 0.5, ny = gy / rows - 0.42
      const faceDist = Math.sqrt(nx * nx * 3 + (ny + 0.02) * (ny + 0.02) * 4)
      const bodyDist = Math.sqrt(nx * nx * 1.2 + (ny - 0.18) * (ny - 0.18) * 0.8)
      const dist = Math.sqrt(nx * nx * 1.8 + ny * ny)
      let alpha = 0
      if (faceDist < 0.18) alpha = (1 - faceDist / 0.18) * 0.6 + Math.random() * 0.15
      else if (bodyDist < 0.35 && ny > 0.1) alpha = (1 - bodyDist / 0.35) * 0.4 + Math.random() * 0.1
      else if (dist < 0.55) alpha = (1 - dist / 0.55) * 0.08 * Math.random()
      if (alpha > 0.02) {
        const t = Math.random()
        const pr = Math.round(faceDist < 0.18 ? 40 + t * r * 0.5 + Math.random() * 20 : r * 0.3 + Math.random() * 20)
        const pg = Math.round(faceDist < 0.18 ? 30 + t * g * 0.4 + Math.random() * 15 : g * 0.2 + Math.random() * 15)
        const pb = Math.round(faceDist < 0.18 ? 35 + t * b * 0.3 + Math.random() * 15 : b * 0.4 + Math.random() * 20)
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`
        ctx.fillRect(gx * PX, gy * PX, PX - 1, PX - 1)
      }
    }
  }
}

function drawPixelPhoto(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, tint: number[]) {
  const [tr, tg, tb] = tint
  const cols = Math.ceil(W / PX), rows = Math.ceil(H / PX)
  const off = document.createElement('canvas'); off.width = cols; off.height = rows
  const oc = off.getContext('2d')!
  const scale = Math.max(cols / img.width, rows / img.height)
  const sw = img.width * scale, sh = img.height * scale
  oc.drawImage(img, (cols - sw) / 2, (rows - sh) / 2, sw, sh)
  try {
    const data = oc.getImageData(0, 0, cols, rows).data
    ctx.fillStyle = '#08090d'; ctx.fillRect(0, 0, W, H)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = (row * cols + col) * 4
        const a = data[i + 3] / 255; if (a < 0.05) continue
        const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
        const tA = 0.25
        const pr = Math.min(255, Math.round(((lum * (1-tA) + tr * tA * (lum/128)) - 128) * 1.3 + 128))
        const pg = Math.min(255, Math.round(((lum * (1-tA) + tg * tA * (lum/128)) - 128) * 1.3 + 128))
        const pb = Math.min(255, Math.round(((lum * (1-tA) + tb * tA * (lum/128)) - 128) * 1.3 + 128))
        ctx.fillStyle = `rgb(${pr},${pg},${pb})`
        ctx.fillRect(col * PX, row * PX, PX - 1, PX - 1)
      }
    }
  } catch {
    // CORS or tainted canvas — fall back to placeholder
    drawPlaceholder(ctx, W, H, tint)
  }
}

// ── Single member slide ─────────────────────────────────────
interface MemberSlideProps {
  member: Member
  index: number
  isLast: boolean
}

function MemberSlide({ member, index, isLast }: MemberSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(slideRef, { amount: 0.3 })
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const rafRef = useRef<number>(0)
  const scanYRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const cacheRef = useRef<ImageData | null>(null)

  // Load photo from Supabase Storage URL when available
  useEffect(() => {
    if (!member.photo_url) return
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setImg(image)
      setHasPhoto(true)
      cacheRef.current = null
    }
    image.onerror = () => {} // fall back to pixel placeholder silently
    image.src = member.photo_url
  }, [member.photo_url])

  const startRender = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particlesRef.current = makeParticles(canvas.width, canvas.height, member.color.glow)
      cacheRef.current = null
    }
    resize()

    const frame = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      if (canvas.width !== W || canvas.height !== H) { resize() }
      ctx.clearRect(0, 0, W, H)

      if (hasPhoto && img) {
        if (!cacheRef.current) {
          drawPixelPhoto(ctx, img, W, H, member.color.tint)
          cacheRef.current = ctx.getImageData(0, 0, W, H)
        } else { ctx.putImageData(cacheRef.current, 0, 0) }
      } else { drawPlaceholder(ctx, W, H, member.color.tint) }

      // Scanline
      const sy = Math.round(scanYRef.current)
      ctx.fillStyle = 'rgba(255,255,255,0.055)'; ctx.fillRect(0, sy, W, 2)
      scanYRef.current = (scanYRef.current + 1.2) % H

      // CRT lines
      ctx.fillStyle = 'rgba(0,0,0,0.07)'
      for (let y = 0; y < H; y += PX * 2) ctx.fillRect(0, y, W, 1)

      // Particles
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay
        if (p.life <= 0 || p.y < -20) {
          p.x = Math.random() * W; p.y = H + 10
          p.life = 0.8 + Math.random() * 0.2
          p.alpha = Math.random() * 0.4 + 0.1
          p.vy = -(Math.random() * 0.9 + 0.3)
        }
        ctx.globalAlpha = p.life * p.alpha
        ctx.fillStyle = p.color
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }
      ctx.globalAlpha = 1

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.85)
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(5,5,10,0.5)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      rafRef.current = requestAnimationFrame(frame)
    }
    frame()
  }, [hasPhoto, img, member])

  useEffect(() => {
    if (inView) startRender()
    else { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
    return () => cancelAnimationFrame(rafRef.current)
  }, [inView, startRender])

  // Badge style per member
  const badgeBg = `rgba(${member.color.tint.join(',')},0.15)`
  const badgeColor = member.color.glow

  return (
    <div ref={slideRef} className="relative w-full h-screen overflow-hidden flex items-end">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to top, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.72) 30%, rgba(5,5,10,0.18) 60%, rgba(5,5,10,0.35) 100%), linear-gradient(to right, rgba(5,5,10,0.58) 0%, transparent 50%)' }}
      />

      {/* Corner number */}
      <div className="absolute top-[90px] right-[8vw] z-[2] text-right select-none">
        <div className="font-display font-bold leading-[1] tracking-[-0.06em]
                        text-[clamp(5rem,15vw,12rem)]"
             style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.07)' }}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[2] px-[8vw] pb-16 max-w-[680px]">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-violet-soft/80 mb-3">
          {String(index + 1).padStart(2, '0')} / 05 — The Team
        </div>
        <h2 className="font-display font-bold leading-[0.95] tracking-[-0.04em] uppercase
                       text-[clamp(2.8rem,6vw,5rem)] mb-3">
          {member.name.split(' ').slice(0, -1).join(' ')}<br />
          {member.name.split(' ').slice(-1)[0]}
        </h2>
        <div className="text-[14px] text-amber tracking-[0.04em] mb-5">{member.role}</div>
        <p className="text-[14px] font-light leading-[1.7] text-ink/60 mb-6 max-w-[52ch]">
          {member.bio}
        </p>
        <div className="flex flex-wrap gap-2 mb-7">
          {member.tags.map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="flex gap-3">
          <Link href={member.github}>
            <LiquidButton size="sm" className="text-white border border-white/20 font-medium">GitHub →</LiquidButton>
          </Link>
          <Link href={member.linkedin}>
            <LiquidButton size="sm" className="text-white border border-white/20 font-medium">LinkedIn →</LiquidButton>
          </Link>
        </div>
      </div>

      {!isLast && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3]
                        flex flex-col items-center gap-1.5 text-muted/50
                        text-[11px] tracking-[0.08em] uppercase">
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path d="M7 1v18M1 13l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          next
        </div>
      )}
    </div>
  )
}

// ── Team section ────────────────────────────────────────────
export default function TeamSection({ members: membersProp }: { members?: Member[] | null }) {
  const members = membersProp ?? MEMBERS
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const handler = () => {
      const slides = document.querySelectorAll('[data-slide]')
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
          setActiveIdx(i)
        }
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <section id="team">
      {members.map((member, i) => (
        <div key={member.id} data-slide={i}>
          <MemberSlide member={member} index={i} isLast={i === members.length - 1} />
        </div>
      ))}

      {/* Side dots */}
      <div className="fixed right-7 top-1/2 -translate-y-1/2 z-[200] flex flex-col gap-2.5">
        {members.map((m, i) => (
          <button
            key={i}
            onClick={() => document.querySelector(`[data-slide="${i}"]`)?.scrollIntoView({ behavior: 'smooth' })}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === activeIdx ? m.color.accent : 'rgba(139,138,173,0.5)',
              transform: i === activeIdx ? 'scale(1.8)' : 'scale(1)',
            }}
            aria-label={m.shortName}
          />
        ))}
      </div>
    </section>
  )
}
