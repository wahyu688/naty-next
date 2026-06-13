import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Grayscale modern palette ──
        bg:           '#0a0a0a',
        surface:      '#151515',
        surface2:     '#202020',
        // accent tokens kept (names unchanged) but remapped to neutral grays
        violet:       '#ededed',   // primary accent → near-white
        'violet-soft':'#9e9e9e',   // dimmer accent → mid gray (labels)
        amber:        '#cacaca',
        teal:         '#b5b5b5',
        red:          '#e0e0e0',
        blue:         '#9a9a9a',
        ink:          '#f5f5f5',
        muted:        '#8e8e8e',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-bricolage)', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.05)',
        strong:  'rgba(255,255,255,0.09)',
      },
      borderRadius: {
        card: '16px',
        sm:   '8px',
      },
      animation: {
        marquee:  'marquee 22s linear infinite',
        pulse2:   'pulse2 2s ease-in-out infinite',
        floathint:'floathint 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulse2: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.5', transform: 'scale(0.7)' },
        },
        floathint: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
