"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">

      {/* WebGL shader fullscreen background */}
      <WebGLShader />

      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/30 to-bg/80 z-[1]" />

      {/* Subtle center glow */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)"
        }}
      />

      {/* Content */}
      <div className="relative z-[2] max-w-[820px] px-6 pt-[120px] pb-20">

        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[12px] font-medium tracking-[0.22em] uppercase text-muted mb-9"
        >
          Computer Science · Binus University
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[1.05] tracking-[-0.04em]
                     text-[clamp(2.8rem,8vw,5.5rem)] mb-7 text-balance text-ink"
        >
          We build things
          <br />
          <span
            className="font-normal"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.35)",
            }}
          >
            worth remembering.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(1rem,2.5vw,1.15rem)] font-light text-ink/60 leading-[1.7]
                     max-w-[540px] mx-auto mb-3"
        >
          Five CS students from Binus University, shaping ideas into digital products —
          across design, development, and everything in between.
        </motion.p>

        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-1.5 mb-10"
        >
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <p className="text-[12px] text-ink/70 font-medium">Available for New Projects</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/works">
            <LiquidButton size="xl" className="text-white border border-white/20 font-semibold text-[15px]">
              View our work
            </LiquidButton>
          </Link>

          <Link href="#team"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-muted
                       border border-white/[0.09] rounded-full px-8 py-3
                       hover:text-ink hover:border-white/20 transition-all duration-200">
            Meet the team
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-20 flex flex-col items-center gap-2 text-ink/30
                     text-[12px] tracking-[0.1em] uppercase animate-floathint"
        >
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="7" r="2" fill="currentColor">
              <animateTransform attributeName="transform" type="translate"
                values="0,0;0,8;0,0" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
          scroll
        </motion.div>
      </div>
    </section>
  )
}
