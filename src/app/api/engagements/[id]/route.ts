export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'
import { canTransitionPhase, type Phase } from '@/lib/engagementPhase'

// GET /api/engagements/[id] — detail (dashboard)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('engagements').select('*').eq('id', params.id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

// PATCH /api/engagements/[id] — phase transitions (gated, §6.5) and
// general field edits. Every phase change and DP/payoff marker is
// logged to activity_logs.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'change_engagement_phase')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN/PM' }, { status: 403 })
  }

  const body = await req.json()
  const sb = getServiceSupabase()

  const { data: current, error: fetchErr } = await sb
    .from('engagements')
    .select('*')
    .eq('id', params.id)
    .single()
  if (fetchErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const logs: { action: string; metadata: Record<string, unknown> }[] = []

  if (body.markDpReceived) {
    updates.dp_received_at = new Date().toISOString()
    logs.push({ action: 'DP_RECEIVED', metadata: {} })
  }
  if (body.markPaidOff) {
    updates.paid_off_at = new Date().toISOString()
    logs.push({ action: 'PAID_OFF', metadata: {} })
  }
  if (typeof body.public_note === 'string') updates.public_note = body.public_note
  if (typeof body.progress_percent === 'number') updates.progress_percent = body.progress_percent
  if (typeof body.target_date === 'string' || body.target_date === null) updates.target_date = body.target_date
  if (typeof body.client_contact === 'string') updates.client_contact = body.client_contact

  if (body.phase) {
    const result = canTransitionPhase(current.phase as Phase, body.phase as Phase, {
      dpReceivedAt: (updates.dp_received_at as string | undefined) ?? current.dp_received_at,
      paidOffAt: (updates.paid_off_at as string | undefined) ?? current.paid_off_at,
    })
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 })
    updates.phase = body.phase
    logs.push({ action: 'PHASE_CHANGE', metadata: { from: current.phase, to: body.phase } })
  }

  const { data: updated, error } = await sb
    .from('engagements')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (logs.length) {
    await sb.from('activity_logs').insert(
      logs.map(l => ({
        engagement_id: params.id,
        actor_id: auth.via === 'session' ? auth.member.id : null,
        action: l.action,
        metadata: l.metadata,
      }))
    )
  }

  return NextResponse.json(updated)
}
