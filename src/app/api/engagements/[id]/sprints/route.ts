export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('sprints').select('*').eq('engagement_id', params.id).order('number')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'input_scoping')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN/PM' }, { status: 403 })
  }

  const { startDate, endDate, goal } = await req.json()
  const sb = getServiceSupabase()

  const { count } = await sb
    .from('sprints')
    .select('id', { count: 'exact', head: true })
    .eq('engagement_id', params.id)

  const { data, error } = await sb
    .from('sprints')
    .insert({ engagement_id: params.id, number: (count ?? 0) + 1, start_date: startDate ?? null, end_date: endDate ?? null, goal: goal ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
