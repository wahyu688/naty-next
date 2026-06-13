// Clean line-icon set — grayscale, currentColor, matches the NATY design concept.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Line(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      {...props}
    />
  )
}

// ── UI / arrows ───────────────────────────────────────
export const ChevronDownIcon = (p: IconProps) => (
  <Line {...p}><path d="m6 9 6 6 6-6" /></Line>
)
export const ArrowRightIcon = (p: IconProps) => (
  <Line {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Line>
)
export const CheckIcon = (p: IconProps) => (
  <Line {...p}><path d="m5 12.5 4.5 4.5L19 6.5" /></Line>
)

// ── Contact channels ──────────────────────────────────
export const MailIcon = (p: IconProps) => (
  <Line {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7.5 8.5 6 8.5-6" /></Line>
)
export const InstagramIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </Line>
)
export const LinkedInIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.2 9h3.6v11.5H3.2zM9.3 9h3.45v1.57h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.3 2.4 4.3 5.5v6.28h-3.6v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94v5.65H9.3z" />
  </svg>
)
export const GithubIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
)

// ── Services ──────────────────────────────────────────
export const PaletteIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.49-2.01 4-4.5 4H14a2 2 0 0 0-1.5 3.32A1.5 1.5 0 0 1 12 21z" />
    <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="11" r="1" fill="currentColor" stroke="none" />
  </Line>
)
export const CodeIcon = (p: IconProps) => (
  <Line {...p}><path d="m9 8-4 4 4 4" /><path d="m15 8 4 4-4 4" /></Line>
)
export const DeviceIcon = (p: IconProps) => (
  <Line {...p}><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M10.5 18h3" /></Line>
)
export const CubeIcon = (p: IconProps) => (
  <Line {...p}><path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7z" /><path d="M3.7 7.2 12 12l8.3-4.8" /><path d="M12 12v9.5" /></Line>
)
export const ChipIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
    <path d="M9.5 2.5v2M14.5 2.5v2M9.5 19.5v2M14.5 19.5v2M2.5 9.5h2M2.5 14.5h2M19.5 9.5h2M19.5 14.5h2" />
  </Line>
)
export const PlayIcon = (p: IconProps) => (
  <Line {...p}><rect x="3" y="4.5" width="18" height="15" rx="3" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></Line>
)
