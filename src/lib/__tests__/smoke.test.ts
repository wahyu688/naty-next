import { describe, it, expect } from 'vitest'

// Proves the Vitest runner + @/ path alias work end to end.
// Real payout-logic tests land in M5 (src/lib/payout.ts).
describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
