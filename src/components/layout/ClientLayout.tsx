'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from '@/components/ui/BackToTop'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <BackToTop />}
    </>
  )
}
