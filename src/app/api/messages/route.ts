import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  return req.headers.get('x-dashboard-password') === process.env.DASHBOARD_PASSWORD
}

// POST /api/messages — public, no auth (contact form submission)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, company, service, budget, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('contact_messages')
    .insert({ name, email, company: company || null, service: service || null, budget: budget || null, message })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// GET /api/messages — dashboard only
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/messages — mark as read
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, read } = await req.json()
  if (id === undefined) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('contact_messages')
    .update({ read })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
