import { melegaOperational as tokens } from 'ui/tokens'

export type HumanStatus = 'Ready' | 'Waiting' | 'Planned' | 'Blocked' | 'Legacy' | 'Not indexed'

const STATUS_MAP: Record<string, HumanStatus> = {
  ready: 'Ready',
  valid: 'Ready',
  approved: 'Ready',
  success: 'Ready',
  live: 'Ready',
  observation_only: 'Ready',
  waiting: 'Waiting',
  pending: 'Waiting',
  queued: 'Waiting',
  under_review: 'Waiting',
  submitted: 'Waiting',
  partial: 'Waiting',
  deferred: 'Waiting',
  planned: 'Planned',
  draft: 'Planned',
  future_execution: 'Planned',
  schema_example: 'Planned',
  blocked: 'Blocked',
  rejected: 'Blocked',
  invalid: 'Blocked',
  unsafe: 'Blocked',
  halted: 'Blocked',
  not_indexed: 'Not indexed',
  unknown: 'Not indexed',
  retired: 'Legacy',
  legacy: 'Legacy',
  deprecated: 'Legacy',
}

export const toHumanStatus = (raw: string): HumanStatus =>
  STATUS_MAP[raw.toLowerCase().replace(/\s+/g, '_')] ?? 'Not indexed'

export const statusTone = (status: HumanStatus): string => {
  switch (status) {
    case 'Ready':
      return tokens.success
    case 'Waiting':
    case 'Planned':
      return tokens.gold
    case 'Blocked':
      return '#f87171'
    case 'Legacy':
      return tokens.textSecondary
    default:
      return tokens.textSecondary
  }
}
