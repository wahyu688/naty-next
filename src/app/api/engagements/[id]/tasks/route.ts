export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'

// GET/POST here; PATCH/DELETE for a single task live at
// /api/engagements/[id]/tasks/[taskId] (§10 — MEMBER can update own
// tasks, so that route checks assignee_id against the session, not
// just role).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('tasks').select('*').eq('engagement_id', params.id).order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, sprintId, assigneeId, discipline } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'title wajib diisi' }, { status: 400 })

  const sb = getServiceSupabase()
  const { count } = await sb.from('tasks').select('id', { count: 'exact', head: true }).eq('engagement_id', params.id)

  const { data, error } = await sb
    .from('tasks')
    .insert({
      engagement_id: params.id,
      sprint_id: sprintId ?? null,
      title: title.trim(),
      description: description ?? null,
      assignee_id: assigneeId ?? null,
      discipline: discipline ?? null,
      sort_order: count ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
