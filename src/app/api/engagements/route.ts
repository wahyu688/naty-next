export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { formatEngagementCode, generatePublicSlug } from '@/lib/engagementPhase'

// GET /api/engagements — list all (dashboard)
export async function GET(req: NextRequest) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('engagements').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/engagements — "Jadikan engagement": converts a contact
// submission into a trackable client engagement. Generates the
// sequential NTY-YYYY-NNN code and a random public_slug (§6.4).
export async function POST(req: NextRequest) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId, value, revisionQuota, targetDate } = await req.json()
  if (!submissionId || !value) {
    return NextResponse.json({ error: 'submissionId dan value wajib diisi' }, { status: 400 })
  }
  if (!Number.isInteger(value) || value <= 0) {
    return NextResponse.json({ error: 'value harus bilangan bulat rupiah > 0' }, { status: 400 })
  }

  const sb = getServiceSupabase()
  const { data: submission } = await sb
    .from('contact_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (!submission) return NextResponse.json({ error: 'Lead tidak ditemukan' }, { status: 404 })
  if (submission.status === 'JADI_ENGAGEMENT') {
    return NextResponse.json({ error: 'Lead ini sudah jadi engagement' }, { status: 409 })
  }

  const year = new Date().getFullYear()
  const { count } = await sb
    .from('engagements')
    .select('id', { count: 'exact', head: true })
    .like('code', `NTY-${year}-%`)

  let created = null
  let lastError = null
  // Retry a few times in case of a rare code/slug collision under concurrency.
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const code = formatEngagementCode(year, (count ?? 0) + 1 + attempt)
    const publicSlug = generatePublicSlug()

    const { data, error } = await sb
      .from('engagements')
      .insert({
        code,
        public_slug: publicSlug,
        client_name: submission.name,
        client_contact: submission.email,
        submission_id: submissionId,
        finder_id: submission.finder_id,
        value,
        revision_quota: revisionQuota ?? 0,
        target_date: targetDate ?? null,
        phase: 'LEAD_MASUK',
      })
      .select()
      .single()

    if (!error) { created = data } else { lastError = error }
  }

  if (!created) {
    return NextResponse.json({ error: lastError?.message ?? 'Gagal membuat engagement' }, { status: 500 })
  }

  await sb.from('contact_submissions').update({ status: 'JADI_ENGAGEMENT' }).eq('id', submissionId)

  await sb.from('activity_logs').insert({
    engagement_id: created.id,
    submission_id: submissionId,
    actor_id: auth.via === 'session' ? auth.member.id : null,
    action: 'ENGAGEMENT_CREATED',
    metadata: { code: created.code, value },
  })

  return NextResponse.json(created)
}
