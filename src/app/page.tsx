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
import { supabase } from '@/lib/supabase'
import { TEAM_COLORS, PROJECTS, type Project, type ProjectCategory, type ProjectStatus } from '@/lib/data'
import type { ProjectRow } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'NATY — CS Portfolio',
}

// Revalidate every 60 seconds so dashboard changes appear within 1 minute
export const revalidate = 60

const MARQUEE_ITEMS = [
  'UI/UX Design', 'Frontend Development', 'AR/XR',
  'Mobile Apps', 'Machine Learning', 'Data Engineering',
  'Video Production', 'Graphic Design',
]

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    categories: row.categories as ProjectCategory[],
    status: row.status as ProjectStatus,
    emoji: row.emoji,
    gradientFrom: row.gradient_from,
    gradientTo: row.gradient_to,
    featured: row.featured,
    members: row.members,
    desc: row.description,
    stack: row.stack,
    overview: row.overview,
    challenge: row.challenge,
    solution: row.solution,
    year: row.year,
    role: row.role,
    link: row.link ?? undefined,
    preview_url: row.preview_url ?? null,
  }
}

export default async function HomePage() {
  const [membersRes, projectsRes, pricingRes] = await Promise.allSettled([
    supabase.from('members').select('*').order('id'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('pricing').select('*').order('sort_order'),
  ])

  // Map Supabase member rows → Member display format (with color + initials)
  const members = membersRes.status === 'fulfilled' && membersRes.value.data?.length
    ? membersRes.value.data.map((row, i) => ({
        id: row.id as number,
        initials: (row.name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join(''),
        name: row.name as string,
        shortName: row.short_name as string,
        role: row.role as string,
        bio: row.bio as string,
        tags: row.tags as string[],
        github: row.github as string,
        linkedin: row.linkedin as string,
        cv_url: (row.cv_url as string | null) ?? null,
        portfolio_url: (row.portfolio_url as string | null) ?? null,
        photo_url: row.photo_url as string | null,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
      }))
    : null

  // Map Supabase project rows → Project type (camelCase fields)
  const projects = projectsRes.status === 'fulfilled' && projectsRes.value.data?.length
    ? projectsRes.value.data.map(row => rowToProject(row as ProjectRow))
    : null

  const pricing = pricingRes.status === 'fulfilled' && pricingRes.value.data?.length
    ? pricingRes.value.data
    : null

  return (
    <>
      <HomeIntro />
      <HeroSection />
      <Marquee items={MARQUEE_ITEMS} />
      <AboutSection />
      <PricingSection plans={pricing} />
      <ProjectsSection projects={projects} />
      <TeamSection members={members} />
      <SkillsSection />
      <ContactCTA />
    </>
  )
}
