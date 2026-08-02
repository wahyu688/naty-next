export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceSupabase()
  const { data, error } = await sb.from('change_requests').select('*').eq('engagement_id', params.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'description wajib diisi' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('change_requests')
    .insert({ engagement_id: params.id, description: description.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH — ADMIN/PM decide the request: GRATIS / BERBAYAR / FASE_2,
// with an optional extra_charge for BERBAYAR.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'input_scoping')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN/PM' }, { status: 403 })
  }

  const { id, decision, extraCharge } = await req.json()
  if (!id || !decision) return NextResponse.json({ error: 'id dan decision wajib diisi' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('change_requests')
    .update({
      decision,
      extra_charge: extraCharge ?? 0,
      decided_by: auth.via === 'session' ? auth.member.id : null,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('engagement_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
