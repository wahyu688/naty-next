export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('standups').select('*').eq('sprint_id', params.id).order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — a member writes their own standup for today. member_id
// always comes from the session (§5.5/§10), never the request body —
// same rule as lead-claim's finder_id. Requires a real per-member
// session; the legacy shared password has no individual identity.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via !== 'session') {
    return NextResponse.json({ error: 'Login dengan akun pribadi untuk isi standup' }, { status: 403 })
  }

  const { yesterday, today, blocker, date } = await req.json()
  const sb = getServiceSupabase()

  const { data, error } = await sb
    .from('standups')
    .upsert(
      {
        sprint_id: params.id,
        member_id: auth.member.id,
        date: date ?? new Date().toISOString().slice(0, 10),
        yesterday: yesterday ?? null,
        today: today ?? null,
        blocker: blocker ?? null,
      },
      { onConflict: 'sprint_id,member_id,date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
