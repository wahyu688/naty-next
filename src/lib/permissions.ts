// Access matrix from CLAUDE.md §5.5. Pure, no I/O — safe to unit test.

export type AccessRole = 'ADMIN' | 'PM' | 'MEMBER'
export type MemberStatus = 'AKTIF' | 'CUTI' | 'TIDAK_AKTIF'

export type Action =
  | 'manage_members'
  | 'manage_content'
  | 'view_inquiries'
  | 'change_engagement_phase'
  | 'input_scoping'
  | 'apply_penalty'
  | 'execute_payout'
  | 'view_all_payouts'
  | 'update_own_tasks'

const MATRIX: Record<Action, AccessRole[]> = {
  manage_members: ['ADMIN'],
  manage_content: ['ADMIN', 'PM'],
  view_inquiries: ['ADMIN', 'PM'],
  change_engagement_phase: ['ADMIN', 'PM'],
  input_scoping: ['ADMIN', 'PM'],
  apply_penalty: ['ADMIN', 'PM'],
  execute_payout: ['ADMIN'],
  view_all_payouts: ['ADMIN', 'PM'],
  update_own_tasks: ['ADMIN', 'PM', 'MEMBER'],
}

export function can(role: AccessRole, action: Action): boolean {
  return MATRIX[action].includes(role)
}
