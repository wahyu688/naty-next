import type { Metadata } from 'next'
import TimelineClient from './TimelineClient'
import { supabase } from '@/lib/supabase'
import { TEAM_COLORS, type TimelineType } from '@/lib/data'
import type { TimelineRow } from '@/lib/supabase'

export const metadata: Metadata = { title: 'Timeline — NATY' }
export const revalidate = 60

export default async function TimelinePage() {
  const [timelineRes, membersRes] = await Promise.allSettled([
    supabase.from('timeline').select('*').order('sort_order'),
    supabase.from('members').select('*').order('id'),
  ])

  const timeline = timelineRes.status === 'fulfilled' && timelineRes.value.data?.length
    ? timelineRes.value.data.map((row: TimelineRow) => ({
        id: row.id,
        year: row.year,
        month: row.month,
        type: row.type as TimelineType,
        title: row.title,
        desc: row.description,
        member: row.member_id,
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

  return <TimelineClient timeline={timeline} members={members} />
}
