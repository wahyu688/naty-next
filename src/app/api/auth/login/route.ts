export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/route'
import { getServiceSupabase } from '@/lib/supabase'

// POST /api/auth/login — email+password sign-in, restricted to
// @natynext.com accounts linked to an AKTIF member row.
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
  }
  if (!email.trim().toLowerCase().endsWith('@natynext.com')) {
    return NextResponse.json({ error: 'Email harus menggunakan domain @natynext.com' }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  const supabase = createRouteSupabaseClient(req, res)

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.user) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  const sb = getServiceSupabase()
  const { data: member } = await sb
    .from('members')
    .select('id, name, short_name, access_role, status')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!member || member.status !== 'AKTIF') {
    await supabase.auth.signOut()
    return NextResponse.json(
      { error: 'Akun tidak aktif atau belum terhubung ke anggota NATY. Hubungi admin.' },
      { status: 403 }
    )
  }

  const final = NextResponse.json({ success: true, member })
  res.cookies.getAll().forEach(c => final.cookies.set(c))
  return final
}
