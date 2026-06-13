import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'NATY — CS Portfolio', template: '%s — NATY' },
  description: 'Five CS students from Binus University building real digital products across design, development, and everything in between.',
  keywords: ['NATY', 'portfolio', 'CS', 'Binus University', 'UI/UX', 'frontend', 'AR', 'Jakarta'],
  openGraph: {
    title: 'NATY — CS Portfolio',
    description: 'Five CS students from Binus University shaping ideas into digital products.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bg text-ink overflow-x-hidden">
        <div id="progress-bar" className="fixed top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet to-amber z-[1000] transition-[width_0.1s_linear]" />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
