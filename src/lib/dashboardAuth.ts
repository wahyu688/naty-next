import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getServiceSupabase } from '@/lib/supabase'
import type { AccessRole, MemberStatus } from '@/lib/permissions'

export type DashboardAuth =
  | { via: 'legacy' }
  | { via: 'session'; member: { id: number; name: string; access_role: AccessRole; status: MemberStatus } }

// Dual auth for API routes, per CLAUDE.md §5.3 step 2: accept either the
// old `x-dashboard-password` header OR a Supabase session belonging to an
// AKTIF @natynext.com member. Remove the legacy branch only when told to
// (§5.3 step 3) — not implicitly, and not as part of this milestone.
export async function authorizeDashboardRequest(req: NextRequest): Promise<DashboardAuth | null> {
  const pwd = req.headers.get('x-dashboard-password')
  if (pwd && process.env.DASHBOARD_PASSWORD && pwd === process.env.DASHBOARD_PASSWORD) {
    return { via: 'legacy' }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email?.endsWith('@natynext.com')) return null

  const sb = getServiceSupabase()
  const { data: member } = await sb
    .from('members')
    .select('id, name, access_role, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!member || member.status !== 'AKTIF') return null
  return { via: 'session', member: member as { id: number; name: string; access_role: AccessRole; status: MemberStatus } }
}
