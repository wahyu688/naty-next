import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getServiceSupabase } from '@/lib/supabase'
import type { AccessRole, MemberStatus } from '@/lib/permissions'

export type SessionMember = {
  id: number
  name: string
  short_name: string
  email: string
  access_role: AccessRole
  status: MemberStatus
}

// Server Component helper: resolves the current session to an AKTIF
// member row, or null if there's no session / the account isn't linked
// to an active member. Rejects anything outside @natynext.com even if
// a stray session cookie somehow carries one.
export async function getSessionMember(): Promise<SessionMember | null> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email?.endsWith('@natynext.com')) return null

  const sb = getServiceSupabase()
  const { data: member } = await sb
    .from('members')
    .select('id, name, short_name, email, access_role, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!member || member.status !== 'AKTIF') return null
  return member as SessionMember
}
