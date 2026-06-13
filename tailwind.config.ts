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
        bg:           '#08090d',
        surface:      '#0f111a',
        surface2:     '#161927',
        violet:       '#7c5cfc',
        'violet-soft':'#9b7dfd',
        amber:        '#f5a623',
        teal:         '#5dcaa5',
        red:          '#e24b4a',
        blue:         '#378add',
        ink:          '#f0eeff',
        muted:        '#8b8aad',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
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
