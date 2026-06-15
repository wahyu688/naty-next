export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  return req.headers.get('x-dashboard-password') === process.env.DASHBOARD_PASSWORD
}

// GET /api/projects — fetch all projects
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sb = getServiceSupabase()
  const { data, error } = await sb.from('projects').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/projects — create new project
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  if (!body.id || !body.name) {
    return NextResponse.json({ error: 'Missing id or name' }, { status: 400 })
  }
  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('projects')
    .insert({ ...body, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/projects — update a project
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('projects')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/projects — delete a project
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = getServiceSupabase()
  const { error } = await sb.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
