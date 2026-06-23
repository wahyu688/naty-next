'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useInView } from 'framer-motion'
import Link from 'next/link'
import clsx from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { MEMBERS, type Member } from '@/lib/data'
import { SectionHeader } from '@/components/ui'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

// ── Single member card (portrait tile in the horizontal track) ──
interface MemberCardProps {
  member: Member
  index: number
  total: number
}

function MemberCard({ member, index, total }: MemberCardProps) {
  const slideRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(slideRef, { amount: 0.2 })
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const rafRef = useRef<number>(0)
  const scanYRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const cacheRef = useRef<ImageData | null>(null)
  // Hover reveal — cursor position (canvas px), eased strength + position, lens buffer
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const posRef = useRef({ x: 0, y: 0 })
  const strengthRef = useRef(0)
  const lensRef = useRef<HTMLCanvasElement | null>(null)

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

      // Hover reveal — de-pixelate a feathered disc around the cursor (photos only)
      const m = mouseRef.current
      const targetS = m.active ? 1 : 0
      strengthRef.current += (targetS - strengthRef.current) * 0.12
      // Snap the lens to the cursor as it starts revealing, then trail it
      if (strengthRef.current < 0.02 && m.active) { posRef.current.x = m.x; posRef.current.y = m.y }
      posRef.current.x += (m.x - posRef.current.x) * 0.25
      posRef.current.y += (m.y - posRef.current.y) * 0.25
      const s = strengthRef.current
      if (s > 0.01 && hasPhoto && img) {
        let lens = lensRef.current
        if (!lens) { lens = document.createElement('canvas'); lensRef.current = lens }
        if (lens.width !== W || lens.height !== H) { lens.width = W; lens.height = H }
        const lc = lens.getContext('2d')!
        lc.clearRect(0, 0, W, H)
        // Crisp photo, cover-fit aligned to the same framing as the pixel grid
        const cols = Math.ceil(W / PX), rows = Math.ceil(H / PX)
        const cover = Math.max(cols / img.width, rows / img.height)
        const dw = img.width * cover * PX, dh = img.height * cover * PX
        lc.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
        // Feathered circular mask centred on the (trailing) cursor
        const R = Math.max(80, Math.min(W, H) * 0.22)
        lc.globalCompositeOperation = 'destination-in'
        const mask = lc.createRadialGradient(posRef.current.x, posRef.current.y, 0, posRef.current.x, posRef.current.y, R)
        mask.addColorStop(0, 'rgba(0,0,0,1)')
        mask.addColorStop(0.65, 'rgba(0,0,0,1)')
        mask.addColorStop(1, 'rgba(0,0,0,0)')
        lc.fillStyle = mask
        lc.fillRect(0, 0, W, H)
        lc.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = s
        ctx.drawImage(lens, 0, 0)
        ctx.globalAlpha = 1
      }

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

  return (
    <div
      ref={slideRef}
      onPointerMove={(e) => {
        const c = canvasRef.current
        if (!c) return
        const rect = c.getBoundingClientRect()
        // Map screen px → canvas px (corrects for emphasis scale + parallax drift)
        mouseRef.current = {
          x: (e.clientX - rect.left) * (c.width / rect.width),
          y: (e.clientY - rect.top) * (c.height / rect.height),
          active: true,
        }
      }}
      onPointerLeave={() => { mouseRef.current.active = false }}
      className="relative w-full h-full overflow-hidden rounded-[22px] border border-white/[0.08] flex items-end"
    >
      {/* Pixel-portrait canvas — wrapper drifts for subtle parallax */}
      <div data-canvas-wrap className="absolute -inset-[6%] will-change-transform">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to top, rgba(5,5,10,0.96) 0%, rgba(5,5,10,0.74) 32%, rgba(5,5,10,0.18) 62%, rgba(5,5,10,0.34) 100%), linear-gradient(to right, rgba(5,5,10,0.5) 0%, transparent 55%)' }}
      />

      {/* Corner number */}
      <div className="absolute top-7 right-7 z-[2] text-right select-none">
        <div className="font-display font-bold leading-[1] tracking-[-0.06em]
                        text-[clamp(3.5rem,10vw,7rem)]"
             style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.08)' }}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[2] px-8 pb-9 w-full">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-violet-soft/80 mb-3">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} — The Team
        </div>
        <h2 className="font-display font-bold leading-[0.95] tracking-[-0.04em] uppercase
                       text-[clamp(2rem,4.5vw,3.2rem)] mb-3">
          {member.name.split(' ').slice(0, -1).join(' ')}<br />
          {member.name.split(' ').slice(-1)[0]}
        </h2>
        <div className="text-[13px] text-amber tracking-[0.04em] mb-4">{member.role}</div>
        <p className="text-[13.5px] font-light leading-[1.7] text-ink/60 mb-5 max-w-[46ch]">
          {member.bio}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {member.tags.map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
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
          {member.cv && (
            <Link href={member.cv} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">CV →</LiquidButton>
            </Link>
          )}
          {member.portfolio && (
            <Link href={member.portfolio} target="_blank" rel="noopener noreferrer">
              <LiquidButton size="sm" className="text-white border border-white/20 font-medium">Portfolio →</LiquidButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Team — scroll-driven horizontal carousel ────────────────
export default function TeamSection({ members: membersProp }: { members?: Member[] | null }) {
  const members = membersProp ?? MEMBERS
  const lenis = useLenis()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const stRef = useRef<ScrollTrigger | null>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const track = trackRef.current
    if (!section || !stage || !track) return

    const ctx = gsap.context(() => {
      const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[]
      const emph = slots.map(s => s.querySelector<HTMLElement>('[data-emph]'))
      const canvasWrap = slots.map(s => s.querySelector<HTMLElement>('[data-canvas-wrap]'))
      const firstEntry = slots[0]?.querySelector<HTMLElement>('[data-entry]') ?? null

      // Exact translate needed to center the LAST card (layout-based, transform-proof)
      const getMaxX = () => {
        const last = slots[slots.length - 1]
        return last.offsetLeft + last.offsetWidth / 2 - track.clientWidth / 2
      }

      // Continuous emphasis + horizontal parallax driven by each card's live
      // distance from the viewport center.
      const render = () => {
        const viewCenter = window.innerWidth / 2
        let best = 0
        let bestDist = Infinity
        slots.forEach((slot, i) => {
          const r = slot.getBoundingClientRect()
          const dist = r.left + r.width / 2 - viewCenter
          const ad = Math.abs(dist)
          if (ad < bestDist) { bestDist = ad; best = i }
          const norm = Math.min(ad / (r.width * 0.9), 1)
          // center card pops, neighbors shrink/dim toward the edges
          gsap.set(emph[i], { scale: 1.02 - norm * 0.18, autoAlpha: 1 - norm * 0.55 })
          // pixel-portrait drifts opposite the card travel for depth
          gsap.set(canvasWrap[i], { x: dist * 0.04 })
        })
        if (best !== activeRef.current) { activeRef.current = best; setActive(best) }
      }

      // Pin the stage and translate the track horizontally with vertical scroll.
      // Scroll down → progress↑ → track moves left → next member enters from the right.
      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => '+=' + getMaxX(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefresh: render,
        onUpdate: (self) => {
          gsap.set(track, { x: -self.progress * getMaxX() })
          render()
        },
      })
      stRef.current = st

      // First card: parallax entrance as you scroll in from the previous section.
      if (firstEntry) {
        gsap.fromTo(
          firstEntry,
          { xPercent: 26, autoAlpha: 0.3, filter: 'blur(14px)' },
          {
            xPercent: 0, autoAlpha: 1, filter: 'blur(0px)', ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              onUpdate: render,
            },
          },
        )
      }

      render()
    }, section)

    return () => ctx.revert()
  }, [])

  // Dots jump to a card by scrolling the page to where that card is centered.
  const scrollToIndex = (i: number) => {
    const st = stRef.current
    const track = trackRef.current
    const slot = slotRefs.current[i]
    if (!st || !track || !slot) return
    const offset = slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2
    const target = st.start + offset
    if (lenis) lenis.scrollTo(target, { duration: 1 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="team" className="py-[140px] overflow-hidden">
      <SectionHeader
        label="Who we are"
        title="The people behind NATY."
        sub="Scroll to move through the team — each member slides in as you go."
      />

      {/* Pinned horizontal stage */}
      <div ref={stageRef} className="relative h-screen flex flex-col justify-center overflow-hidden">
        <div
          ref={trackRef}
          className="relative flex gap-6 items-center will-change-transform px-[calc((100vw-min(520px,84vw))/2)]"
        >
          {members.map((member, i) => (
            <div
              key={member.id}
              ref={(el) => { slotRefs.current[i] = el }}
              data-slot
              className="shrink-0 w-[min(520px,84vw)] h-[78vh]"
            >
              <div data-emph className="h-full" style={{ opacity: i === 0 ? 1 : 0.4 }}>
                <div data-entry className="h-full">
                  <MemberCard member={member} index={i} total={members.length} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots — progress + jump */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${m.shortName}`}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === active ? 22 : 6,
                height: 6,
                background: i === active ? m.color.accent : 'rgba(139,138,173,0.45)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
