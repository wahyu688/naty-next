export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, getServiceSupabase } from '@/lib/supabase'

// POST /api/contact — save contact form submission (public, no password)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, message, service = '', budget = '', company = '' } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Use anon client — the policy allows insert without auth
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name: name.trim(), email: email.trim(), message: message.trim(), service, budget, company })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// GET /api/contact — fetch all submissions (dashboard only)
export async function GET(req: NextRequest) {
  const pwd = req.headers.get('x-dashboard-password')
  if (pwd !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/contact — mark as read/unread
export async function PATCH(req: NextRequest) {
  const pwd = req.headers.get('x-dashboard-password')
  if (pwd !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, is_read } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('contact_submissions')
    .update({ is_read })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/contact — delete a submission
export async function DELETE(req: NextRequest) {
  const pwd = req.headers.get('x-dashboard-password')
  if (pwd !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const sb = getServiceSupabase()
  const { error } = await sb.from('contact_submissions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
