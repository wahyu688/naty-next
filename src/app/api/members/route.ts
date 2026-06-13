import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Verify dashboard password from request header
function isAuthorized(req: NextRequest) {
  const pwd = req.headers.get('x-dashboard-password')
  return pwd === process.env.DASHBOARD_PASSWORD
}

// GET /api/members — fetch all members
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('members')
    .select('*')
    .order('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/members — update a member
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...fields } = body

  if (id === undefined) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('members')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
