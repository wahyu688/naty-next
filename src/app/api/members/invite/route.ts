export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

// POST /api/members/invite — ADMIN creates a Supabase Auth account for
// an existing member row and links it via auth_user_id. This is the
// only way accounts get created (§5.1: "public signup dimatikan") —
// there is no self-serve sign-up route anywhere in this app.
export async function POST(req: NextRequest) {
  const auth = await authorizeDashboardRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.via === 'session' && !can(auth.member.access_role, 'manage_members')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN' }, { status: 403 })
  }

  const { memberId, email, password } = await req.json()
  if (!memberId || !email?.trim() || !password) {
    return NextResponse.json({ error: 'memberId, email, dan password wajib diisi' }, { status: 400 })
  }
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail.endsWith('@natynext.com')) {
    return NextResponse.json({ error: 'Email harus menggunakan domain @natynext.com' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
  }

  const sb = getServiceSupabase()

  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
  })
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? 'Gagal membuat akun' }, { status: 500 })
  }

  const { data: updated, error: updateErr } = await sb
    .from('members')
    .update({ auth_user_id: created.user.id, email: cleanEmail, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .select()
    .single()

  if (updateErr) {
    // Roll back the orphaned auth user so retrying doesn't hit a duplicate-email error.
    await sb.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
