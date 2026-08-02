import { getServiceSupabase } from '@/lib/supabase'
import type { Phase } from '@/lib/engagementPhase'

// The ONLY shape allowed to reach the /track/[slug] page or any
// client component in that tree (§9). Deliberately excludes: value,
// DP/payoff dates, finder/member identities, scope points, payouts,
// tasks/standups, and every other engagement's data.
export type PublicEngagementView = {
  clientName: string
  code: string
  phase: Phase
  progressPercent: number
  targetDate: string | null
  publicNote: string | null
}

// Explicit column list — never `select('*')` on this path (§9). This
// is the actual anti-leak guarantee: forbidden fields never leave
// Postgres, so there's nothing to accidentally forward even if this
// function's mapping code below had a bug.
export async function getPublicEngagementView(slug: string): Promise<PublicEngagementView | null> {
  const sb = getServiceSupabase()
  const { data, error } = await sb
    .from('engagements')
    .select('client_name, code, phase, progress_percent, target_date, public_note')
    .eq('public_slug', slug)
    .single()

  // Unknown slug and query error are indistinguishable on purpose —
  // callers must not be able to tell "wrong slug" from "server error".
  if (error || !data) return null

  return {
    clientName: data.client_name,
    code: data.code,
    phase: data.phase,
    progressPercent: data.progress_percent,
    targetDate: data.target_date,
    publicNote: data.public_note,
  }
}
