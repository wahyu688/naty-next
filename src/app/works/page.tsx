import type { Metadata } from 'next'
import WorksClient from './WorksClient'
import { supabase } from '@/lib/supabase'
import { TEAM_COLORS, type ProjectCategory, type ProjectStatus } from '@/lib/data'
import type { ProjectRow } from '@/lib/supabase'

export const metadata: Metadata = { title: 'Works — NATY' }
export const revalidate = 60

export default async function WorksPage() {
  const [projectsRes, membersRes] = await Promise.allSettled([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('members').select('*').order('id'),
  ])

  const projects = projectsRes.status === 'fulfilled' && projectsRes.value.data?.length
    ? projectsRes.value.data.map((row: ProjectRow) => ({
        id: row.id, name: row.name, type: row.type,
        categories: row.categories as ProjectCategory[],
        status: row.status as ProjectStatus,
        emoji: row.emoji, gradientFrom: row.gradient_from, gradientTo: row.gradient_to,
        featured: row.featured, members: row.members, desc: row.description,
        stack: row.stack, overview: row.overview, challenge: row.challenge,
        solution: row.solution, year: row.year, role: row.role,
        link: row.link ?? undefined,
        preview_url: row.preview_url ?? null,
      }))
    : null

  const members = membersRes.status === 'fulfilled' && membersRes.value.data?.length
    ? membersRes.value.data.map((row: any, i: number) => ({
        id: row.id as number,
        initials: (row.name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join(''),
        name: row.name as string, shortName: row.short_name as string,
        role: row.role as string, bio: row.bio as string,
        tags: row.tags as string[], github: row.github as string,
        linkedin: row.linkedin as string, photo_url: row.photo_url as string | null,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
      }))
    : null

  return <WorksClient projects={projects} members={members} />
}
