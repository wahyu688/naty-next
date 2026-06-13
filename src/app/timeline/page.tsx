import type { Metadata } from 'next'
import TimelineClient from './TimelineClient'

export const metadata: Metadata = { title: 'Timeline' }

export default function TimelinePage() {
  return <TimelineClient />
}
