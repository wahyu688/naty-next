// Phase state machine for `engagements`, per CLAUDE.md §6.5. Pure, no
// I/O — safe to unit test. Used by both the dashboard (technical
// labels) and the public /track/[slug] portal (friendly labels), so
// the 8-phase order only needs to be defined once.

export const PHASES = [
  'LEAD_MASUK',
  'KUALIFIKASI',
  'SCOPING',
  'PENAWARAN_KONTRAK',
  'KICKOFF',
  'EKSEKUSI',
  'QA_REVISI',
  'SERAH_TERIMA',
] as const

export type Phase = (typeof PHASES)[number]

export const PHASE_LABELS_INTERNAL: Record<Phase, string> = {
  LEAD_MASUK: 'Lead Masuk',
  KUALIFIKASI: 'Kualifikasi',
  SCOPING: 'Scoping',
  PENAWARAN_KONTRAK: 'Penawaran & Kontrak',
  KICKOFF: 'Kickoff',
  EKSEKUSI: 'Eksekusi',
  QA_REVISI: 'QA & Revisi',
  SERAH_TERIMA: 'Serah Terima',
}

// Client-safe labels — never mention money, internal jargon, or gates.
export const PHASE_LABELS_PUBLIC: Record<Phase, string> = {
  LEAD_MASUK: 'Permintaan Diterima',
  KUALIFIKASI: 'Kualifikasi',
  SCOPING: 'Perencanaan',
  PENAWARAN_KONTRAK: 'Penawaran & Kontrak',
  KICKOFF: 'Persiapan',
  EKSEKUSI: 'Sedang Dikerjakan',
  QA_REVISI: 'QA & Revisi',
  SERAH_TERIMA: 'Serah Terima',
}

export type PhaseGateContext = {
  dpReceivedAt: string | null
  paidOffAt: string | null
}

export type PhaseTransitionResult = { ok: true } | { ok: false; reason: string }

// Rules from §6.5:
//  - forward moves only one step at a time (no skipping)
//  - backward moves are always allowed (but must be logged by the caller)
//  - KICKOFF requires dp_received_at
//  - closing out of SERAH_TERIMA requires paid_off_at
export function canTransitionPhase(
  current: Phase,
  next: Phase,
  ctx: PhaseGateContext
): PhaseTransitionResult {
  if (current === next) return { ok: false, reason: 'Sudah berada di fase ini' }

  const curIdx = PHASES.indexOf(current)
  const nextIdx = PHASES.indexOf(next)

  if (nextIdx < curIdx) return { ok: true } // mundur selalu boleh

  if (nextIdx > curIdx + 1) {
    return { ok: false, reason: 'Fase tidak boleh dilompati maju' }
  }

  if (next === 'KICKOFF' && !ctx.dpReceivedAt) {
    return { ok: false, reason: 'Tidak bisa masuk KICKOFF sebelum DP diterima' }
  }

  if (next === 'SERAH_TERIMA' && !ctx.paidOffAt) {
    return { ok: false, reason: 'Tidak bisa menutup di SERAH_TERIMA sebelum pelunasan diterima' }
  }

  return { ok: true }
}

export function formatEngagementCode(year: number, seq: number): string {
  return `NTY-${year}-${String(seq).padStart(3, '0')}`
}

const SLUG_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

export function generatePublicSlug(length = 12): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)]
  }
  return out
}
