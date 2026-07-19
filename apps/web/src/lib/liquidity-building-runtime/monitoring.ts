import type { TxMonitorStatus } from './types'

export type MonitoredSubmission = {
  submissionId: string
  transactionHash: string | null
  program: string
  executionId: string | null
  epochId: string
  blockNumber: number | null
  gasUsed: string | null
  revertReason: string | null
  status: TxMonitorStatus
  updatedAt: string
}

/**
 * In-memory monitor store for LB009. Production worker should persist externally.
 * Success requires Program ExecutionCompleted + Treasury settlement + LP evidence
 * (enforced by reconciliation layer, not by tx receipt alone).
 */
export class SubmissionMonitor {
  private readonly byId = new Map<string, MonitoredSubmission>()

  upsert(record: MonitoredSubmission): MonitoredSubmission {
    this.byId.set(record.submissionId, record)
    return record
  }

  get(submissionId: string): MonitoredSubmission | null {
    return this.byId.get(submissionId) || null
  }

  transition(submissionId: string, status: TxMonitorStatus, patch: Partial<MonitoredSubmission> = {}): MonitoredSubmission {
    const cur = this.byId.get(submissionId)
    if (!cur) throw new Error('UNKNOWN_SUBMISSION')
    const next = {
      ...cur,
      ...patch,
      status,
      updatedAt: new Date().toISOString(),
    }
    this.byId.set(submissionId, next)
    return next
  }
}

export function isEconomicallySuccessful(args: {
  txStatus: TxMonitorStatus
  executionCompleted: boolean
  treasurySettled: boolean
  lpDelivered: boolean
}): boolean {
  return (
    args.txStatus === 'CONFIRMED' &&
    args.executionCompleted &&
    args.treasurySettled &&
    args.lpDelivered
  )
}
