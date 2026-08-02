export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

// PATCH — a MEMBER may only move their own assigned task (§5.5
// "Update task & standup sendiri"); ADMIN/PM may edit any task.
export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: task } = await sb.from('tasks').select('assignee_id').eq('id', params.taskId).single()
  if (!task) return NextResponse.json({ error: 'Task tidak ditemukan' }, { status: 404 })

  if (auth.via === 'session') {
    const isManager = can(auth.member.access_role, 'manage_content')
    const isOwner = task.assignee_id === auth.member.id
    if (!isManager && !isOwner) {
      return NextResponse.json({ error: 'Kamu hanya bisa ubah task milikmu sendiri' }, { status: 403 })
    }
  }

  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status) updates.status = body.status
  if ('assigneeId' in body) updates.assignee_id = body.assigneeId
  if ('sprintId' in body) updates.sprint_id = body.sprintId
  if (typeof body.title === 'string') updates.title = body.title
  if (typeof body.description === 'string') updates.description = body.description
  if (typeof body.sortOrder === 'number') updates.sort_order = body.sortOrder

  const { data, error } = await sb.from('tasks').update(updates).eq('id', params.taskId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'manage_content')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sb = getServiceSupabase()
  const { error } = await sb.from('tasks').delete().eq('id', params.taskId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
