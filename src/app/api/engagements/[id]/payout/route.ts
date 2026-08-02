export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'
import { computePayouts, type ScopeItemInput, type Discipline } from '@/lib/payout'

// GET /api/engagements/[id]/payout — view payouts. ADMIN/PM see all,
// MEMBER sees only their own rows (§5.5 "Lihat payout ... hanya miliknya").
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  let query = sb.from('payouts').select('*').eq('engagement_id', params.id)

  if (auth.via === 'session' && !can(auth.member.access_role, 'view_all_payouts')) {
    query = query.eq('member_id', auth.member.id)
  }

  const { data, error } = await query.order('calculated_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/engagements/[id]/payout — execute payout. ADMIN only,
// requires paid_off_at set, and only runs once per engagement (a
// snapshot — re-editing scope after this does NOT recompute it).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'execute_payout')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN yang boleh eksekusi payout' }, { status: 403 })
  }

  const sb = getServiceSupabase()

  const { data: engagement, error: engErr } = await sb
    .from('engagements')
    .select('*')
    .eq('id', params.id)
    .single()
  if (engErr || !engagement) return NextResponse.json({ error: 'Engagement tidak ditemukan' }, { status: 404 })

  if (!engagement.paid_off_at) {
    return NextResponse.json({ error: 'Payout hanya bisa dieksekusi setelah pelunasan diterima' }, { status: 400 })
  }

  const { count: existingCount } = await sb
    .from('payouts')
    .select('id', { count: 'exact', head: true })
    .eq('engagement_id', params.id)
  if ((existingCount ?? 0) > 0) {
    return NextResponse.json({ error: 'Payout untuk engagement ini sudah pernah dieksekusi' }, { status: 409 })
  }

  const { data: scopeItems, error: scopeErr } = await sb
    .from('scope_items')
    .select('discipline, level, penalty_percent, assignments(member_id, share_percent)')
    .eq('engagement_id', params.id)
  if (scopeErr) return NextResponse.json({ error: scopeErr.message }, { status: 500 })
  if (!scopeItems || scopeItems.length === 0) {
    return NextResponse.json({ error: 'Belum ada scope item untuk engagement ini' }, { status: 400 })
  }

  const input: ScopeItemInput[] = scopeItems.map(s => ({
    discipline: s.discipline as Discipline,
    level: s.level,
    penaltyPercent: s.penalty_percent,
    assignments: (s.assignments as { member_id: number; share_percent: number }[]).map(a => ({
      memberId: a.member_id,
      sharePercent: a.share_percent,
    })),
  }))

  let lines
  try {
    lines = computePayouts({ engagementValue: engagement.value, finderId: engagement.finder_id, scopeItems: input })
  } catch (err: any) {
    return NextResponse.json({ error: `Perhitungan payout gagal: ${err.message}` }, { status: 400 })
  }

  const { data: inserted, error: insertErr } = await sb
    .from('payouts')
    .insert(lines.map(l => ({ engagement_id: params.id, member_id: l.memberId, type: l.type, amount: l.amount })))
    .select()
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  await sb.from('activity_logs').insert({
    engagement_id: params.id,
    actor_id: auth.via === 'session' ? auth.member.id : null,
    action: 'PAYOUT_EXECUTED',
    metadata: { lineCount: inserted?.length ?? 0, total: lines.reduce((s, l) => s + l.amount, 0) },
  })

  return NextResponse.json(inserted)
}
