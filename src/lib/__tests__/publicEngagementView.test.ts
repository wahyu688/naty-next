import { describe, it, expect, vi } from 'vitest'

// Forbidden per CLAUDE.md §9 — must never appear in the public
// engagement view payload, under any key name.
const FORBIDDEN_KEYS = [
  'value', 'dp_received_at', 'paid_off_at', 'finder_id', 'submission_id',
  'client_contact', 'assignments', 'points', 'amount', 'member_id',
]

// Simulates a leaky underlying row (as if a future regression changed
// the query to `select('*')`) to prove getPublicEngagementView() only
// ever forwards the whitelisted fields regardless of what the row
// actually contains.
vi.mock('@/lib/supabase', () => ({
  getServiceSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              client_name: 'PT Contoh Klien',
              code: 'NTY-2026-001',
              phase: 'EKSEKUSI',
              progress_percent: 40,
              target_date: '2026-03-01',
              public_note: 'Sedang finalisasi desain',
              value: 8_000_000,
              dp_received_at: '2026-01-01',
              paid_off_at: null,
              finder_id: 3,
              submission_id: 'abc-123',
              client_contact: 'client@example.com',
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

const { getPublicEngagementView } = await import('@/lib/publicEngagementView')

describe('getPublicEngagementView — anti-leak guarantee (§9)', () => {
  it('never exposes forbidden fields even if the underlying row contains them', async () => {
    const view = await getPublicEngagementView('someslug')
    expect(view).not.toBeNull()
    const keys = Object.keys(view!)
    for (const forbidden of FORBIDDEN_KEYS) {
      expect(keys).not.toContain(forbidden)
    }
  })

  it('exposes exactly the whitelisted public fields, nothing more', async () => {
    const view = await getPublicEngagementView('someslug')
    expect(Object.keys(view!).sort()).toEqual(
      ['clientName', 'code', 'phase', 'progressPercent', 'publicNote', 'targetDate'].sort()
    )
  })
})
