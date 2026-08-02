export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

// POST /api/leads/claim — a member claims an unclaimed lead. finder_id
// always comes from the session, never the request body (§8). Requires
// a real per-member session — the legacy shared password has no
// individual identity to attribute the claim to.
export async function POST(req: NextRequest) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via !== 'session') {
    return NextResponse.json({ error: 'Login dengan akun pribadi untuk klaim lead' }, { status: 403 })
  }

  const { submissionId } = await req.json()
  if (!submissionId) return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: submission } = await sb
    .from('contact_submissions')
    .select('id, finder_id')
    .eq('id', submissionId)
    .single()

  if (!submission) return NextResponse.json({ error: 'Lead tidak ditemukan' }, { status: 404 })
  if (submission.finder_id !== null) {
    return NextResponse.json({ error: 'Lead ini sudah diklaim' }, { status: 409 })
  }

  const { data: updated, error } = await sb
    .from('contact_submissions')
    .update({ finder_id: auth.member.id })
    .eq('id', submissionId)
    .is('finder_id', null) // race-condition guard: only succeeds if still unclaimed
    .select()
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: 'Lead ini sudah diklaim orang lain' }, { status: 409 })
  }

  await sb.from('activity_logs').insert({
    submission_id: submissionId,
    actor_id: auth.member.id,
    action: 'LEAD_CLAIMED',
    metadata: { finder_id: auth.member.id },
  })

  return NextResponse.json(updated)
}

// PATCH /api/leads/claim — ADMIN overrides an already-claimed (or
// unclaimed) lead's finder_id. Always logged (§8).
export async function PATCH(req: NextRequest) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'manage_members')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN' }, { status: 403 })
  }

  const { submissionId, finderId } = await req.json()
  if (!submissionId) return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data: updated, error } = await sb
    .from('contact_submissions')
    .update({ finder_id: finderId ?? null })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('activity_logs').insert({
    submission_id: submissionId,
    actor_id: auth.via === 'session' ? auth.member.id : null,
    action: 'LEAD_FINDER_OVERRIDDEN',
    metadata: { finder_id: finderId ?? null },
  })

  return NextResponse.json(updated)
}
