import type { Metadata } from 'next'
import { Suspense } from 'react'
import ContactClient from './ContactClient'
export const metadata: Metadata = { title: 'Contact' }
export default function ContactPage() {
  return (
    <Suspense>
      <ContactClient />
    </Suspense>
  )
}
