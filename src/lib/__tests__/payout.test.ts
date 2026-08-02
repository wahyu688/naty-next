import { describe, it, expect } from 'vitest'
import { computePayouts, sumPayoutLines, type ScopeItemInput } from '@/lib/payout'

const FINDER_JUSTINE = 99
const FRONTEND_DEV = 1
const DESIGNER = 2
const BACKEND_DEV = 3
const PM_QA_DEV = 4

function amountFor(lines: ReturnType<typeof computePayouts>, memberId: number | null, type?: string) {
  return lines.find(l => l.memberId === memberId && (!type || l.type === type))?.amount
}

describe('computePayouts — mandated case study (CLAUDE.md §12)', () => {
  const scopeItems: ScopeItemInput[] = [
    { discipline: 'FRONTEND', level: 4, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] },
    { discipline: 'DESIGN', level: 3, assignments: [{ memberId: DESIGNER, sharePercent: 100 }] },
    { discipline: 'BACKEND', level: 2, assignments: [{ memberId: BACKEND_DEV, sharePercent: 100 }] },
    { discipline: 'PM_QA', level: 2, assignments: [{ memberId: PM_QA_DEV, sharePercent: 100 }] },
  ]

  const lines = computePayouts({ engagementValue: 8_000_000, finderId: FINDER_JUSTINE, scopeItems })

  it('matches every line from the SOP table exactly', () => {
    expect(amountFor(lines, FRONTEND_DEV, 'WORK_SHARE')).toBe(3_360_000)
    expect(amountFor(lines, DESIGNER, 'WORK_SHARE')).toBe(1_920_000)
    expect(amountFor(lines, BACKEND_DEV, 'WORK_SHARE')).toBe(960_000)
    expect(amountFor(lines, PM_QA_DEV, 'WORK_SHARE')).toBe(960_000)
    expect(amountFor(lines, FINDER_JUSTINE, 'FINDER_FEE')).toBe(800_000)
  })

  it('sums to exactly the engagement value', () => {
    expect(sumPayoutLines(lines)).toBe(8_000_000)
  })
})

describe('computePayouts — derived rules', () => {
  it('sends the 10% finder fee to kas when the client came without a finder', () => {
    const lines = computePayouts({
      engagementValue: 5_000_000,
      finderId: null,
      scopeItems: [{ discipline: 'FRONTEND', level: 2, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] }],
    })
    const kas = lines.find(l => l.type === 'KAS')
    expect(kas?.amount).toBe(500_000)
    expect(sumPayoutLines(lines)).toBe(5_000_000)
  })

  it('gives the finder both the fee and a work share when they also worked', () => {
    const lines = computePayouts({
      engagementValue: 8_000_000,
      finderId: FRONTEND_DEV, // finder participates as the frontend dev
      scopeItems: [
        { discipline: 'FRONTEND', level: 4, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] },
        { discipline: 'DESIGN', level: 3, assignments: [{ memberId: DESIGNER, sharePercent: 100 }] },
        { discipline: 'BACKEND', level: 2, assignments: [{ memberId: BACKEND_DEV, sharePercent: 100 }] },
        { discipline: 'PM_QA', level: 2, assignments: [{ memberId: PM_QA_DEV, sharePercent: 100 }] },
      ],
    })
    expect(amountFor(lines, FRONTEND_DEV, 'FINDER_FEE')).toBe(800_000)
    expect(amountFor(lines, FRONTEND_DEV, 'WORK_SHARE')).toBe(3_360_000)
    expect(sumPayoutLines(lines)).toBe(8_000_000)
  })

  it('sums points when one person covers two disciplines', () => {
    const lines = computePayouts({
      engagementValue: 8_000_000,
      finderId: FINDER_JUSTINE,
      scopeItems: [
        { discipline: 'FRONTEND', level: 4, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] },
        { discipline: 'BACKEND', level: 2, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] }, // same person
        { discipline: 'DESIGN', level: 3, assignments: [{ memberId: DESIGNER, sharePercent: 100 }] },
        { discipline: 'PM_QA', level: 2, assignments: [{ memberId: PM_QA_DEV, sharePercent: 100 }] },
      ],
    })
    // frontend dev now holds FRONTEND(7) + BACKEND(2) = 9 of 15 points
    expect(amountFor(lines, FRONTEND_DEV, 'WORK_SHARE')).toBe(Math.floor((9 / 15) * 7_200_000))
    expect(sumPayoutLines(lines)).toBe(8_000_000)
  })

  it('splits one discipline 60/40 between two people', () => {
    const lines = computePayouts({
      engagementValue: 8_000_000,
      finderId: FINDER_JUSTINE,
      scopeItems: [
        { discipline: 'FRONTEND', level: 4, assignments: [
          { memberId: FRONTEND_DEV, sharePercent: 60 },
          { memberId: DESIGNER, sharePercent: 40 },
        ] },
        { discipline: 'BACKEND', level: 2, assignments: [{ memberId: BACKEND_DEV, sharePercent: 100 }] },
      ],
    })
    // total points = 7 + 2 = 9. Frontend's 7 points split 60/40 => 4.2 / 2.8 (scaled x100 stays integer: 700*60/100=420, 700*40/100=280)
    const pool = 7_200_000
    expect(amountFor(lines, FRONTEND_DEV, 'WORK_SHARE')).toBe(Math.floor((420 / 900) * pool))
    expect(amountFor(lines, DESIGNER, 'WORK_SHARE')).toBe(Math.floor((280 / 900) * pool))
    expect(sumPayoutLines(lines)).toBe(8_000_000)
  })

  it('applies a 20% PM penalty to a discipline\'s points', () => {
    const lines = computePayouts({
      engagementValue: 8_000_000,
      finderId: FINDER_JUSTINE,
      scopeItems: [
        { discipline: 'FRONTEND', level: 4, penaltyPercent: 20, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] },
        { discipline: 'BACKEND', level: 2, assignments: [{ memberId: BACKEND_DEV, sharePercent: 100 }] },
      ],
    })
    // frontend effective points = 7 * 0.8 = 5.6 (scaled: 700*80/100=560), backend = 200. total scaled = 760
    const pool = 7_200_000
    expect(amountFor(lines, FRONTEND_DEV, 'WORK_SHARE')).toBe(Math.floor((560 / 760) * pool))
    expect(sumPayoutLines(lines)).toBe(8_000_000)
  })

  it('sends any rounding remainder to kas and still sums exactly to the engagement value', () => {
    const lines = computePayouts({
      engagementValue: 1_000_001,
      finderId: FINDER_JUSTINE,
      scopeItems: [
        { discipline: 'FRONTEND', level: 1, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 100 }] },
        { discipline: 'DESIGN', level: 1, assignments: [{ memberId: DESIGNER, sharePercent: 100 }] },
        { discipline: 'BACKEND', level: 1, assignments: [{ memberId: BACKEND_DEV, sharePercent: 100 }] },
      ],
    })
    const kas = lines.find(l => l.type === 'KAS')
    expect(kas).toBeDefined()
    expect(kas!.amount).toBeGreaterThan(0)
    expect(sumPayoutLines(lines)).toBe(1_000_001)
  })

  it('rejects a scope item whose share_percent does not sum to 100', () => {
    expect(() => computePayouts({
      engagementValue: 1_000_000,
      finderId: null,
      scopeItems: [{ discipline: 'FRONTEND', level: 2, assignments: [{ memberId: FRONTEND_DEV, sharePercent: 60 }] }],
    })).toThrow()
  })

  it('rejects a scope item with points but no assignments', () => {
    expect(() => computePayouts({
      engagementValue: 1_000_000,
      finderId: null,
      scopeItems: [{ discipline: 'FRONTEND', level: 2, assignments: [] }],
    })).toThrow()
  })
})
