import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SmoothScroll from '@/components/providers/SmoothScroll'
import BackToTop from '@/components/ui/BackToTop'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
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
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="bg-bg text-ink overflow-x-hidden">
        <SmoothScroll>
          <div id="progress-bar" className="fixed top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-muted to-ink z-[1000] transition-[width_0.1s_linear]" />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BackToTop />
        </SmoothScroll>
      </body>
    </html>
  )
}
