export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { authorizeDashboardRequest } from '@/lib/dashboardAuth'
import { can } from '@/lib/permissions'

// access_role/status/email/auth_user_id are access-control fields —
// only ADMIN may change them (§5.5). A legacy shared-password caller
// is treated as ADMIN-equivalent for backward compatibility (that's
// the trust level the single password already implied).
const RESTRICTED_FIELDS = ['access_role', 'status', 'email', 'auth_user_id']

// GET /api/members — fetch all members
export async function GET(req: NextRequest) {
  if (!(await authorizeDashboardRequest(req))) {
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
  const auth = await authorizeDashboardRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...fields } = body

  if (id === undefined) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const touchesRestricted = RESTRICTED_FIELDS.some(f => f in fields)
  if (touchesRestricted && auth.via === 'session' && !can(auth.member.access_role, 'manage_members')) {
    return NextResponse.json({ error: 'Forbidden — hanya ADMIN yang boleh ubah akses akun' }, { status: 403 })
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
