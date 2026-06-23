'use client'

import { useRef, useEffect, useState } from 'react'
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
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const tA = 0.25
        const pr = Math.min(255, Math.round(((lum * (1 - tA) + tr * tA * (lum / 128)) - 128) * 1.3 + 128))
        const pg = Math.min(255, Math.round(((lum * (1 - tA) + tg * tA * (lum / 128)) - 128) * 1.3 + 128))
        const pb = Math.min(255, Math.round(((lum * (1 - tA) + tb * tA * (lum / 128)) - 128) * 1.3 + 128))
        ctx.fillStyle = `rgb(${pr},${pg},${pb})`
        ctx.fillRect(col * PX, row * PX, PX - 1, PX - 1)
      }
    }
  } catch {
    drawPlaceholder(ctx, W, H, tint)
  }
}

// ── Canvas renderer ─────────────────────────────────────────
function MemberCanvas({ member }: { member: Member }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const scanYRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const cacheRef = useRef<ImageData | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const hasPhotoRef = useRef(false)
  const memberIdRef = useRef(member.id)

  useEffect(() => {
    cacheRef.current = null
    imgRef.current = null
    hasPhotoRef.current = false
    memberIdRef.current = member.id
    if (!member.photo_url) return
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (memberIdRef.current !== member.id) return
      imgRef.current = image
      hasPhotoRef.current = true
      cacheRef.current = null
    }
    image.onerror = () => {}
    image.src = member.photo_url
  }, [member.id, member.photo_url])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particlesRef.current = makeParticles(canvas.width, canvas.height, member.color.glow)
      cacheRef.current = null
    }
    resize()
    window.addEventListener('resize', resize)
    const ctx = canvas.getContext('2d')!
    const frame = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      if (canvas.width !== W || canvas.height !== H) resize()
      ctx.clearRect(0, 0, W, H)
      if (hasPhotoRef.current && imgRef.current) {
        if (!cacheRef.current) {
          drawPixelPhoto(ctx, imgRef.current, W, H, member.color.tint)
          cacheRef.current = ctx.getImageData(0, 0, W, H)
        } else { ctx.putImageData(cacheRef.current, 0, 0) }
      } else { drawPlaceholder(ctx, W, H, member.color.tint) }
      const sy = Math.round(scanYRef.current)
      ctx.fillStyle = 'rgba(255,255,255,0.055)'; ctx.fillRect(0, sy, W, 2)
      scanYRef.current = (scanYRef.current + 1.2) % H
      ctx.fillStyle = 'rgba(0,0,0,0.07)'
      for (let y = 0; y < H; y += PX * 2) ctx.fillRect(0, y, W, 1)
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
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85)
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(5,5,10,0.5)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [member])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}

// ── Member card ─────────────────────────────────────────────
function MemberCard({
  member, index, total, isActive, renderCanvas,
}: {
  member: Member
  index: number
  total: number
  isActive: boolean
  renderCanvas: boolean
}) {
  return (
    <div
      className="relative flex-shrink-0 flex flex-col overflow-hidden rounded-[20px] border"
      style={{
        width: '68vw',
        height: '100%',
        borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
        opacity: isActive ? 1 : 0.45,
        transform: isActive ? 'scale(1)' : 'scale(0.97)',
        transformOrigin: 'center left',
        transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.4s ease',
        background: '#0d0d0f',
      }}
    >
      {/* ── Photo area (top 60%) ── */}
      <div className="relative overflow-hidden" style={{ flex: '0 0 60%' }}>
        {renderCanvas
          ? <MemberCanvas member={member} />
          : <div className="absolute inset-0"
               style={{ background: `rgba(${member.color.tint.join(',')},0.06)` }} />
        }

        {/* Gradient: darken bottom of photo for name readability */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(to top, rgba(8,8,12,0.97) 0%, rgba(8,8,12,0.5) 35%, rgba(8,8,12,0.1) 65%, rgba(8,8,12,0.25) 100%)',
        }} />

        {/* Ghost index — top right */}
        <div className="absolute top-5 right-5 z-[2] select-none">
          <span
            className="font-display font-bold leading-[1] tracking-[-0.06em]"
            style={{
              fontSize: 'clamp(4rem,9vw,7.5rem)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.07)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Name — bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 z-[2] px-7 pb-6">
          <h2
            className="font-display font-bold leading-[0.92] tracking-[-0.04em] uppercase"
            style={{ fontSize: 'clamp(1.7rem,3.4vw,3rem)' }}
          >
            {member.name}
          </h2>
        </div>
      </div>

      {/* ── Info area (bottom 40%) ── */}
      <div
        className="flex flex-col justify-between px-7 py-5"
        style={{ flex: '0 0 40%', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#111114' }}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold tracking-[0.04em] text-amber/80">{member.role}</span>
            <span className="text-[10px] font-mono text-muted/40 tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <p className="text-[12.5px] font-light leading-[1.75] text-ink/50 line-clamp-3 mb-4">
            {member.bio}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {member.tags.map(t => <span key={t} className="tag text-[10.5px]">{t}</span>)}
          </div>
        </div>

        {/* Social links */}
        <div className="flex flex-wrap gap-2">
          {member.github && (
            <Link href={member.github} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">GitHub →</LiquidButton>
            </Link>
          )}
          {member.linkedin && (
            <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">LinkedIn →</LiquidButton>
            </Link>
          )}
          {member.cv_url && (
            <Link href={member.cv_url} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">CV →</LiquidButton>
            </Link>
          )}
          {member.portfolio_url && (
            <Link href={member.portfolio_url} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">Portfolio →</LiquidButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Team section ────────────────────────────────────────────
export default function TeamSection({ members: membersProp }: { members?: Member[] | null }) {
  const members = membersProp ?? MEMBERS
  const total = members.length
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Touchpad horizontal swipe via wheel event (deltaX)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    // Refs so the handler never has stale closures
    const accRef = { value: 0 }
    const cooldownRef = { value: false }
    const THRESHOLD = 60 // px of accumulated horizontal scroll

    const onWheel = (e: WheelEvent) => {
      // Ignore when vertical component dominates (user scrolling the page)
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return

      e.preventDefault() // stop the page from scrolling horizontally

      if (cooldownRef.value) return

      accRef.value += e.deltaX

      if (accRef.value > THRESHOLD) {
        cooldownRef.value = true
        accRef.value = 0
        setActiveIdx(i => Math.min(i + 1, total - 1))
        setTimeout(() => { cooldownRef.value = false }, 650)
      } else if (accRef.value < -THRESHOLD) {
        cooldownRef.value = true
        accRef.value = 0
        setActiveIdx(i => Math.max(i - 1, 0))
        setTimeout(() => { cooldownRef.value = false }, 650)
      }
    }

    // passive: false is required to be able to call preventDefault()
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [total])

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveIdx(i => Math.min(i + 1, total - 1))
      if (e.key === 'ArrowLeft')  setActiveIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  const member = members[activeIdx]

  return (
    <section ref={sectionRef} id="team" className="relative h-screen overflow-hidden bg-bg select-none">

      {/* Label */}
      <div className="absolute top-[88px] left-8 z-[10]">
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted/50">
          The Team
        </span>
      </div>

      {/* Cards strip */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute flex gap-[2vw]"
          style={{
            top: '80px',
            bottom: '4rem',
            left: 0,
            alignItems: 'stretch',
            transform: `translateX(calc(5vw - ${activeIdx} * 70vw))`,
            transition: 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              index={i}
              total={total}
              isActive={i === activeIdx}
              renderCanvas={Math.abs(i - activeIdx) <= 1}
            />
          ))}
        </div>
      </div>

      {/* Bottom dots — pill style */}
      <div className="absolute bottom-5 left-0 right-0 z-[10] flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          {total <= 9
            ? members.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? '22px' : '6px',
                    height: '6px',
                    background: i === activeIdx
                      ? member.color.accent
                      : 'rgba(255,255,255,0.18)',
                  }}
                  aria-label={members[i].shortName}
                />
              ))
            : (
              <>
                {[-2, -1, 0, 1, 2].map(offset => {
                  const idx = activeIdx + offset
                  if (idx < 0 || idx >= total) return null
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIdx(idx)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: idx === activeIdx ? '22px' : '6px',
                        height: '6px',
                        background: idx === activeIdx
                          ? member.color.accent
                          : `rgba(255,255,255,${Math.abs(offset) === 1 ? 0.3 : 0.12})`,
                      }}
                      aria-label={members[idx].shortName}
                    />
                  )
                })}
                <span className="text-[10px] font-mono text-muted/40 ml-1 tabular-nums">
                  {activeIdx + 1}/{total}
                </span>
              </>
            )
          }
        </div>
      </div>
    </section>
  )
}
