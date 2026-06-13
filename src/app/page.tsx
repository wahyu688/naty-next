import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import TeamSection from '@/components/sections/TeamSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import SkillsSection from '@/components/sections/SkillsSection'
import ContactCTA from '@/components/sections/ContactCTA'
import { Marquee } from '@/components/ui'

export const metadata: Metadata = {
  title: 'NATY — CS Portfolio',
}

const MARQUEE_ITEMS = [
  'UI/UX Design', 'Frontend Development', 'AR/XR',
  'Mobile Apps', 'Machine Learning', 'Data Engineering',
  'Video Production', 'Graphic Design',
]

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Marquee items={MARQUEE_ITEMS} />
      <AboutSection />
      <ProjectsSection />
      <TeamSection />
      <SkillsSection />
      <ContactCTA />
    </>
  )
}
