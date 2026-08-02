export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'
import { LEVEL_POINTS, type ScopeLevel } from '@/lib/payout'

// GET /api/engagements/[id]/scope — scope_items + their assignments
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data: items, error } = await sb
    .from('scope_items')
    .select('*, assignments(*)')
    .eq('engagement_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(items)
}

// POST /api/engagements/[id]/scope — upsert one discipline's scope
// item + its assignments (§7 scope_items/assignments). ADMIN/PM only
// (§5.5 input_scoping / apply_penalty).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'input_scoping')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN/PM' }, { status: 403 })
  }

  const { discipline, level, penaltyPercent = 0, penaltyReason, assignments } = await req.json()

  if (!discipline || level === undefined || !(level in LEVEL_POINTS)) {
    return NextResponse.json({ error: 'discipline dan level (0-5) wajib diisi' }, { status: 400 })
  }
  if (penaltyPercent < 0 || penaltyPercent > 20) {
    return NextResponse.json({ error: 'penaltyPercent harus 0-20' }, { status: 400 })
  }
  if (penaltyPercent > 0 && !penaltyReason?.trim()) {
    return NextResponse.json({ error: 'Penalti wajib disertai alasan tertulis' }, { status: 400 })
  }
  const points = LEVEL_POINTS[level as ScopeLevel]
  if (points > 0) {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: 'Wajib ada minimal satu assignment untuk lini dengan poin > 0' }, { status: 400 })
    }
    const totalShare = assignments.reduce((s: number, a: { sharePercent: number }) => s + a.sharePercent, 0)
    if (totalShare !== 100) {
      return NextResponse.json({ error: `Total share_percent harus 100, sekarang ${totalShare}` }, { status: 400 })
    }
  }

  const sb = getServiceSupabase()

  const { data: scopeItem, error: upsertErr } = await sb
    .from('scope_items')
    .upsert(
      {
        engagement_id: params.id,
        discipline,
        level,
        points,
        penalty_percent: penaltyPercent,
        penalty_reason: penaltyPercent > 0 ? penaltyReason.trim() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'engagement_id,discipline' }
    )
    .select()
    .single()

  if (upsertErr || !scopeItem) {
    return NextResponse.json({ error: upsertErr?.message ?? 'Gagal simpan scope item' }, { status: 500 })
  }

  await sb.from('assignments').delete().eq('scope_item_id', scopeItem.id)

  if (Array.isArray(assignments) && assignments.length > 0) {
    const { error: assignErr } = await sb.from('assignments').insert(
      assignments.map((a: { memberId: number; sharePercent: number }) => ({
        scope_item_id: scopeItem.id,
        member_id: a.memberId,
        share_percent: a.sharePercent,
      }))
    )
    if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 })
  }

  if (penaltyPercent > 0) {
    await sb.from('activity_logs').insert({
      engagement_id: params.id,
      actor_id: auth.via === 'session' ? auth.member.id : null,
      action: 'SCOPE_PENALTY_APPLIED',
      metadata: { discipline, penaltyPercent, penaltyReason },
    })
  }

  const { data: withAssignments } = await sb
    .from('scope_items')
    .select('*, assignments(*)')
    .eq('id', scopeItem.id)
    .single()

  return NextResponse.json(withAssignments)
}
