/**
 * Receipt lifecycle preparation — documentation surface only.
 * No receipt polling, settlement events, or treasury mutations in this mission.
 */

export const RECEIPT_PIPELINE_STAGES = [
  /** Adapter submit returns tx hash via trackExecutionSubmission. */
  'transaction_submitted',
  /** Redux transaction store / wagmi observes pending tx — existing DEX infra. */
  'receipt_observation_begins',
  /** useExecutionTrackerReceiptSync reads transactions — read-only sync hook. */
  'tracker_receipt_sync',
  /** ExecutionTracker.syncReceiptFromTransaction maps tx → evidence. */
  'evidence_evolution',
  /** ExecutionTracker.finalizeIfTerminal produces ExecutionReport. */
  'execution_report_finalized',
  /** FUTURE — Settlement Events; forbidden in TESTNET preparation phase. */
  'settlement_event_production',
] as const

export type ReceiptPipelineStage = (typeof RECEIPT_PIPELINE_STAGES)[number]

export interface ReceiptPipelineStageDescriptor {
  stage: ReceiptPipelineStage
  module: string
  implemented: boolean
  notes: string
}

export const RECEIPT_PIPELINE_MAP: readonly ReceiptPipelineStageDescriptor[] = [
  {
    stage: 'transaction_submitted',
    module: 'lib/execution-tracker/trackExecution.ts',
    implemented: true,
    notes: 'markTransactionSubmitted + captureTransactionHash after adapter submit',
  },
  {
    stage: 'receipt_observation_begins',
    module: 'state/transactions/ + wagmi',
    implemented: true,
    notes: 'Existing DEX receipt polling — not invoked from KERL path in this mission',
  },
  {
    stage: 'tracker_receipt_sync',
    module: 'lib/execution-tracker/useExecutionTrackerReceiptSync.ts',
    implemented: true,
    notes: 'Read-only sync from Redux; no KERL UI wiring',
  },
  {
    stage: 'evidence_evolution',
    module: 'lib/execution-tracker/tracker.ts → mapTransactionToExecutionEvidence',
    implemented: true,
    notes: 'Evidence evolves on receipt_confirmed / receipt_failed events',
  },
  {
    stage: 'execution_report_finalized',
    module: 'lib/execution-contract/report.ts',
    implemented: true,
    notes: 'Terminal report without settlement fields',
  },
  {
    stage: 'settlement_event_production',
    module: 'FUTURE — Treasury boundary',
    implemented: false,
    notes: 'Explicitly out of scope; assertReportDoesNotImplySettlement guards contract',
  },
]

export function isSettlementStage(stage: ReceiptPipelineStage): boolean {
  return stage === 'settlement_event_production'
}
