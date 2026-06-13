import type { Metadata } from 'next'
import HomeIntro from '@/components/sections/HomeIntro'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import PricingSection from '@/components/sections/PricingSection'
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
      <HomeIntro />
      <HeroSection />
      <Marquee items={MARQUEE_ITEMS} />
      <AboutSection />
      <PricingSection />
      <ProjectsSection />
      <TeamSection />
      <SkillsSection />
      <ContactCTA />
    </>
  )
}
