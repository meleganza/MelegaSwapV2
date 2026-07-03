import type {
  ExecutionAdapter,
  ExecutionDomain,
  ExecutionError,
  ExecutionReport,
  ExecutionStatus,
  InstructionSchemaVersion,
  InstructionSource,
  ReceiptReference,
} from '../execution-contract'

export type TrackerEventType =
  | 'instruction_received'
  | 'dry_run_validated'
  | 'execution_suppressed'
  | 'dry_run_completed'
  | 'wallet_submission_started'
  | 'transaction_submitted'
  | 'transaction_hash_captured'
  | 'receipt_pending'
  | 'receipt_confirmed'
  | 'receipt_failed'
  | 'execution_report_finalized'

export interface TrackerEvent {
  type: TrackerEventType
  at: string
  status: ExecutionStatus
  txHash?: string
  error?: ExecutionError
  receiptReference?: ReceiptReference
}

export interface ExecutionTrackerRecord {
  executionId: string
  instructionId: string
  correlationId: string
  instructionVersion: InstructionSchemaVersion
  instructionSource: InstructionSource
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  adapterIdentity: string
  chainId?: number
  status: ExecutionStatus
  txHash?: string
  receiptReference?: ReceiptReference
  error?: ExecutionError
  events: TrackerEvent[]
  createdAt: string
  updatedAt: string
  finalizedAt?: string
  report?: ExecutionReport
}

export interface ExecutionTrackerSnapshot {
  scopeKey: string
  records: ExecutionTrackerRecord[]
  updatedAt: string
}
