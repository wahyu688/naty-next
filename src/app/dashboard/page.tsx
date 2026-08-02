import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'
import { getSessionMember } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Dashboard — NATY',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const sessionMember = await getSessionMember()
  return <DashboardClient initialSessionMember={sessionMember} />
}
