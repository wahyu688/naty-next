import type { Metadata } from 'next'
import WorksClient from './WorksClient'
export const metadata: Metadata = { title: 'Works' }
export default function WorksPage() { return <WorksClient /> }
