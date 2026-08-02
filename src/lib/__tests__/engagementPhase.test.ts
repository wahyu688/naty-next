import { describe, it, expect } from 'vitest'
import { canTransitionPhase, formatEngagementCode } from '@/lib/engagementPhase'

describe('canTransitionPhase', () => {
  const noGates = { dpReceivedAt: null, paidOffAt: null }

  it('allows moving one step forward', () => {
    expect(canTransitionPhase('LEAD_MASUK', 'KUALIFIKASI', noGates)).toEqual({ ok: true })
  })

  it('blocks skipping phases forward', () => {
    const r = canTransitionPhase('LEAD_MASUK', 'SCOPING', noGates)
    expect(r.ok).toBe(false)
  })

  it('allows moving backward any number of steps', () => {
    expect(canTransitionPhase('SERAH_TERIMA', 'SCOPING', noGates)).toEqual({ ok: true })
  })

  it('blocks entering KICKOFF without dp_received_at', () => {
    const r = canTransitionPhase('PENAWARAN_KONTRAK', 'KICKOFF', noGates)
    expect(r.ok).toBe(false)
  })

  it('allows entering KICKOFF once dp_received_at is set', () => {
    const r = canTransitionPhase('PENAWARAN_KONTRAK', 'KICKOFF', { dpReceivedAt: '2026-01-01', paidOffAt: null })
    expect(r).toEqual({ ok: true })
  })

  it('blocks entering SERAH_TERIMA without paid_off_at', () => {
    const r = canTransitionPhase('QA_REVISI', 'SERAH_TERIMA', { dpReceivedAt: '2026-01-01', paidOffAt: null })
    expect(r.ok).toBe(false)
  })

  it('allows entering SERAH_TERIMA once paid_off_at is set', () => {
    const r = canTransitionPhase('QA_REVISI', 'SERAH_TERIMA', { dpReceivedAt: '2026-01-01', paidOffAt: '2026-02-01' })
    expect(r).toEqual({ ok: true })
  })

  it('rejects a no-op transition', () => {
    expect(canTransitionPhase('EKSEKUSI', 'EKSEKUSI', noGates).ok).toBe(false)
  })
})

describe('formatEngagementCode', () => {
  it('formats with zero-padded sequence', () => {
    expect(formatEngagementCode(2026, 14)).toBe('NTY-2026-014')
  })

  it('pads single digits', () => {
    expect(formatEngagementCode(2026, 1)).toBe('NTY-2026-001')
  })
})
