import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard — NATY',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <DashboardClient />
}
