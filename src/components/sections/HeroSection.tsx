'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-6 pt-[120px] pb-20">
      <div className="max-w-[820px]">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase
                     text-violet-soft bg-[rgba(124,92,252,0.13)] border border-[rgba(124,92,252,0.18)]
                     rounded-full px-4 py-1.5 mb-9"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-soft animate-pulse2 inline-block" />
          Computer Science · Binus University
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[1.05] tracking-[-0.04em]
                     text-[clamp(2.8rem,8vw,5.5rem)] mb-7 text-balance"
        >
          We build things
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px #9b7dfd' }}>
            worth remembering.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(1rem,2.5vw,1.2rem)] font-light text-muted leading-[1.7]
                     max-w-[560px] mx-auto mb-12"
        >
          Five CS students from Binus University, shaping ideas into digital products —
          across design, development, and everything in between.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/works" className="btn-primary">View our work</Link>
          <Link href="/#team" className="btn-ghost">Meet the team</Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 flex flex-col items-center gap-2 text-muted text-[12px]
                     tracking-[0.1em] uppercase animate-floathint"
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
