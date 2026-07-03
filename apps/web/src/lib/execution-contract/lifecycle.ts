import type { ExecutionStatus } from './types'

/**
 * Valid client-side status transitions.
 * Terminal states do not transition further without a new execution attempt.
 */
export const EXECUTION_STATUS_TRANSITIONS: Readonly<Partial<Record<ExecutionStatus, readonly ExecutionStatus[]>>> =
  {
    invalid: ['loading'],
    loading: ['awaiting_wallet', 'awaiting_approval', 'simulating', 'ready', 'failed'],
    awaiting_wallet: ['awaiting_approval', 'simulating', 'ready', 'failed'],
    awaiting_approval: ['simulating', 'ready', 'failed'],
    simulating: ['ready', 'failed', 'dry_run_completed'],
    ready: ['submitted', 'failed', 'simulating', 'dry_run_completed'],
    submitted: ['pending', 'confirmed', 'reverted', 'failed'],
    pending: ['confirmed', 'reverted', 'failed'],
    confirmed: [],
    reverted: [],
    failed: [],
  }

export function isValidStatusTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
  if (from === to) {
    return true
  }
  const allowed = EXECUTION_STATUS_TRANSITIONS[from]
  return allowed?.includes(to) ?? false
}

export const TERMINAL_EXECUTION_STATUSES: readonly ExecutionStatus[] = [
  'confirmed',
  'reverted',
  'failed',
  'dry_run_completed',
]
