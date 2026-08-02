// Payout engine — pure function, no I/O. Implements CLAUDE.md §6
// exactly: complexity levels, finder fee / pool split, per-discipline
// point shares, one-person-two-disciplines summing, two-people-one-
// discipline share_percent splits, PM penalty (max 20%), and integer-
// rupiah rounding where the remainder always goes to kas.
//
// All money math is done in BigInt so there is zero floating-point
// risk regardless of engagement size (§6.3 — "dilarang float").

export type Discipline = 'BACKEND' | 'FRONTEND' | 'DESIGN' | 'PM_QA'
export type ScopeLevel = 0 | 1 | 2 | 3 | 4 | 5

export const LEVEL_POINTS: Record<ScopeLevel, number> = {
  0: 0, 1: 1, 2: 2, 3: 4, 4: 7, 5: 10,
}

export interface ScopeAssignmentInput {
  memberId: number
  sharePercent: number // must sum to 100 across all assignments of the same scope item
}

export interface ScopeItemInput {
  discipline: Discipline
  level: ScopeLevel
  penaltyPercent?: number // 0-20, PM cut, default 0
  assignments: ScopeAssignmentInput[]
}

export interface PayoutInput {
  engagementValue: number // integer rupiah
  finderId: number | null // null = client came on their own, 10% goes to kas
  scopeItems: ScopeItemInput[]
}

export type PayoutLine =
  | { type: 'FINDER_FEE'; memberId: number; amount: number }
  | { type: 'WORK_SHARE'; memberId: number; amount: number }
  | { type: 'KAS'; memberId: null; amount: number }

export function computePayouts(input: PayoutInput): PayoutLine[] {
  const { engagementValue, finderId, scopeItems } = input

  if (!Number.isInteger(engagementValue) || engagementValue <= 0) {
    throw new Error('engagementValue must be a positive integer rupiah amount')
  }

  const value = BigInt(engagementValue)
  const finderFee = (value * 10n) / 100n
  const poolTim = value - finderFee // subtraction (not a second % calc) guarantees exact sum with value

  const lines: PayoutLine[] = []

  if (finderId !== null) {
    lines.push({ type: 'FINDER_FEE', memberId: finderId, amount: Number(finderFee) })
  } else {
    lines.push({ type: 'KAS', memberId: null, amount: Number(finderFee) })
  }

  // scaledPoints = effective points * 100, kept as an integer so the
  // 0-20% penalty never needs a fractional "points" value.
  const scaledByMember = new Map<number, bigint>()

  for (const item of scopeItems) {
    const basePoints = LEVEL_POINTS[item.level]
    const penalty = item.penaltyPercent ?? 0
    if (penalty < 0 || penalty > 20) {
      throw new Error(`penaltyPercent for ${item.discipline} must be 0-20, got ${penalty}`)
    }
    if (basePoints === 0) continue // level 0 — lini tidak ada di proyek

    if (item.assignments.length === 0) {
      throw new Error(`${item.discipline} has points but no assignments`)
    }
    const totalShare = item.assignments.reduce((s, a) => s + a.sharePercent, 0)
    if (totalShare !== 100) {
      throw new Error(`share_percent for ${item.discipline} must sum to 100, got ${totalShare}`)
    }

    const effectiveScaled = BigInt(basePoints) * BigInt(100 - penalty) // points * 100, minus penalty

    for (const a of item.assignments) {
      const memberScaled = (effectiveScaled * BigInt(a.sharePercent)) / 100n
      scaledByMember.set(a.memberId, (scaledByMember.get(a.memberId) ?? 0n) + memberScaled)
    }
  }

  const totalScaledPoints = [...scaledByMember.values()].reduce((s, v) => s + v, 0n)

  if (totalScaledPoints === 0n) {
    // No scoped work at all — the whole pool falls back to kas rather
    // than silently vanishing or dividing by zero.
    lines.push({ type: 'KAS', memberId: null, amount: Number(poolTim) })
    return lines
  }

  let distributed = 0n
  for (const [memberId, scaled] of scaledByMember) {
    const amount = (scaled * poolTim) / totalScaledPoints // floors — BigInt division truncates toward zero
    distributed += amount
    lines.push({ type: 'WORK_SHARE', memberId, amount: Number(amount) })
  }

  const remainder = poolTim - distributed
  if (remainder > 0n) {
    lines.push({ type: 'KAS', memberId: null, amount: Number(remainder) })
  }

  return lines
}

export function sumPayoutLines(lines: PayoutLine[]): number {
  return lines.reduce((s, l) => s + l.amount, 0)
}
