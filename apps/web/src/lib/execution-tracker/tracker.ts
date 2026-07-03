import type { TransactionDetails } from 'state/transactions/reducer'

import {
  assertEvidenceIntegrity,
  buildDryRunExecutionEvidence,
  buildExecutionReport,
  classifyExecutionError,
  createExecutionId,
  isValidStatusTransition,
  mapTransactionToExecutionEvidence,
  TERMINAL_EXECUTION_STATUSES,
} from '../execution-contract'
import type { InstructionForEvidence } from '../execution-contract/evidence'
import type { ExecutionError, ExecutionReport, ExecutionStatus } from '../execution-contract/types'
import { loadTrackerSnapshot, saveTrackerSnapshot, trackerScopeKey } from './storage'
import type { ExecutionTrackerRecord, TrackerEvent, TrackerEventType } from './types'
import { TRACKER_FORBIDDEN_SETTLEMENT_FIELDS } from './ownership'

const trackers = new Map<string, ExecutionTracker>()

export class ExecutionTracker {
  private records = new Map<string, ExecutionTrackerRecord>()

  private constructor(private readonly scopeKey: string) {
    for (const record of loadTrackerSnapshot(scopeKey)) {
      this.records.set(record.executionId, record)
    }
  }

  static forScope(account: string | undefined, chainId: number | undefined): ExecutionTracker {
    const scopeKey = trackerScopeKey(account, chainId)
    const existing = trackers.get(scopeKey)
    if (existing) {
      return existing
    }
    const tracker = new ExecutionTracker(scopeKey)
    trackers.set(scopeKey, tracker)
    return tracker
  }

  static resetForTests(): void {
    trackers.clear()
  }

  getRecord(executionId: string): ExecutionTrackerRecord | undefined {
    return this.records.get(executionId)
  }

  getByInstructionId(instructionId: string): ExecutionTrackerRecord | undefined {
    const matches = [...this.records.values()].filter((record) => record.instructionId === instructionId)
    return matches.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  }

  getByTxHash(txHash: string): ExecutionTrackerRecord | undefined {
    return [...this.records.values()].find((record) => record.txHash?.toLowerCase() === txHash.toLowerCase())
  }

  listRecords(): ExecutionTrackerRecord[] {
    return [...this.records.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  registerInstruction(instruction: InstructionForEvidence, executionId = createExecutionId(instruction.id)): string {
    const now = new Date().toISOString()
    const record: ExecutionTrackerRecord = {
      executionId,
      instructionId: instruction.id,
      correlationId: instruction.correlationId,
      instructionVersion: instruction.version,
      instructionSource: instruction.source,
      domain: instruction.domain,
      adapter: instruction.adapter,
      adapterIdentity: instruction.adapter,
      chainId: instruction.chainId,
      status: 'ready',
      events: [],
      createdAt: now,
      updatedAt: now,
    }

    this.appendEvent(record, 'instruction_received', 'ready')
    this.records.set(executionId, record)
    this.persist()
    return executionId
  }

  markWalletSubmissionStarted(executionId: string): void {
    const record = this.requireRecord(executionId)
    this.appendEvent(record, 'wallet_submission_started', record.status)
    record.updatedAt = new Date().toISOString()
    this.persist()
  }

  /**
   * Records dry-run lifecycle without wallet submission or adapter dispatch.
   * Terminal state: dry_run_completed.
   */
  completeDryRun(
    executionId: string,
    instruction: InstructionForEvidence,
    chainId?: number,
  ): ExecutionReport {
    const record = this.requireRecord(executionId)

    if (isValidStatusTransition(record.status, 'simulating')) {
      this.setStatus(record, 'simulating')
      this.appendEvent(record, 'dry_run_validated', 'simulating')
    }

    if (!isValidStatusTransition(record.status, 'dry_run_completed')) {
      throw new Error(`Invalid dry-run transition: ${record.status} -> dry_run_completed`)
    }

    this.setStatus(record, 'dry_run_completed')
    this.appendEvent(record, 'execution_suppressed', 'dry_run_completed')
    this.appendEvent(record, 'dry_run_completed', 'dry_run_completed')

    const evidence = buildDryRunExecutionEvidence(instruction, executionId, chainId ?? record.chainId)
    assertEvidenceIntegrity(evidence)
    const report = buildExecutionReport(evidence)

    for (const field of TRACKER_FORBIDDEN_SETTLEMENT_FIELDS) {
      if (field in (report as Record<string, unknown>)) {
        throw new Error(`Execution tracker report must not include settlement field: ${field}`)
      }
    }

    record.report = report
    record.finalizedAt = evidence.finalizedAt
    this.appendEvent(record, 'execution_report_finalized', 'dry_run_completed')
    this.persist()
    return report
  }

  markTransactionSubmitted(executionId: string): void {
    const record = this.requireRecord(executionId)
    if (isValidStatusTransition(record.status, 'submitted')) {
      this.setStatus(record, 'submitted')
    }
    this.appendEvent(record, 'transaction_submitted', record.status)
    this.persist()
  }

  captureTransactionHash(executionId: string, txHash: string, chainId?: number): void {
    if (!txHash) {
      throw new Error('Execution tracker cannot capture an empty transaction hash')
    }

    const record = this.requireRecord(executionId)
    record.txHash = txHash
    if (chainId !== undefined) {
      record.chainId = chainId
    }

    if (record.status !== 'submitted' && isValidStatusTransition(record.status, 'submitted')) {
      this.setStatus(record, 'submitted')
      this.appendEvent(record, 'transaction_submitted', 'submitted', { txHash })
    }

    if (record.status !== 'pending' && isValidStatusTransition(record.status, 'pending')) {
      this.setStatus(record, 'pending')
      this.appendEvent(record, 'transaction_hash_captured', 'pending', { txHash })
      this.appendEvent(record, 'receipt_pending', 'pending', { txHash })
    }

    this.persist()
  }

  markExecutionFailed(executionId: string, error: ExecutionError): void {
    const record = this.requireRecord(executionId)
    record.error = error
    this.appendEvent(record, 'receipt_failed', 'failed', { error })
    this.setStatus(record, 'failed')
    this.finalizeIfTerminal(record)
    this.persist()
  }

  syncReceiptFromTransaction(
    executionId: string,
    instruction: InstructionForEvidence,
    tx: TransactionDetails,
    chainId?: number,
  ): ExecutionTrackerRecord | undefined {
    const record = this.records.get(executionId)
    if (!record || TERMINAL_EXECUTION_STATUSES.includes(record.status)) {
      return record
    }

    if (!tx.hash) {
      return record
    }

    if (record.txHash && record.txHash.toLowerCase() !== tx.hash.toLowerCase()) {
      return record
    }

    const evidence = mapTransactionToExecutionEvidence(instruction, tx, executionId, chainId ?? record.chainId)
    assertEvidenceIntegrity(evidence)

    if (!isValidStatusTransition(record.status, evidence.status)) {
      return record
    }

    record.txHash = evidence.txHash
    record.chainId = evidence.chainId ?? record.chainId
    record.status = evidence.status
    record.error = evidence.error
    record.receiptReference = evidence.receiptReference
    record.updatedAt = new Date().toISOString()

    if (tx.receipt) {
      const eventType: TrackerEventType =
        evidence.status === 'confirmed' ? 'receipt_confirmed' : 'receipt_failed'
      this.appendEvent(record, eventType, evidence.status, {
        txHash: evidence.txHash,
        receiptReference: evidence.receiptReference,
        error: evidence.error,
      })
    } else if (tx.hash) {
      this.appendEvent(record, 'receipt_pending', evidence.status, { txHash: tx.hash })
    }

    this.finalizeIfTerminal(record)
    this.persist()
    return record
  }

  syncPendingReceipts(
    instruction: InstructionForEvidence,
    transactions: Record<string, TransactionDetails>,
    chainId?: number,
  ): void {
    for (const record of this.records.values()) {
      if (!record.txHash || TERMINAL_EXECUTION_STATUSES.includes(record.status)) {
        continue
      }
      const tx = transactions[record.txHash]
      if (!tx) {
        continue
      }
      this.syncReceiptFromTransaction(record.executionId, instruction, tx, chainId)
    }
  }

  getExecutionReport(executionId: string): ExecutionReport | undefined {
    return this.records.get(executionId)?.report
  }

  private setStatus(record: ExecutionTrackerRecord, status: ExecutionStatus): void {
    if (!isValidStatusTransition(record.status, status)) {
      throw new Error(`Invalid execution tracker transition: ${record.status} -> ${status}`)
    }
    record.status = status
    record.updatedAt = new Date().toISOString()
  }

  private appendEvent(
    record: ExecutionTrackerRecord,
    type: TrackerEventType,
    status: ExecutionStatus,
    extras: Pick<TrackerEvent, 'txHash' | 'error' | 'receiptReference'> = {},
  ): void {
    record.events.push({
      type,
      at: new Date().toISOString(),
      status,
      ...extras,
    })
  }

  private finalizeIfTerminal(record: ExecutionTrackerRecord): void {
    if (!TERMINAL_EXECUTION_STATUSES.includes(record.status) || record.report) {
      return
    }

    const evidence = {
      instructionId: record.instructionId,
      executionId: record.executionId,
      correlationId: record.correlationId,
      instructionVersion: record.instructionVersion,
      instructionSource: record.instructionSource,
      domain: record.domain,
      adapter: record.adapter,
      adapterIdentity: record.adapterIdentity,
      status: record.status,
      chainId: record.chainId,
      txHash: record.txHash,
      blockNumber: record.receiptReference?.blockNumber,
      submittedAt: record.events.find((event) => event.type === 'transaction_hash_captured')?.at,
      finalizedAt: new Date().toISOString(),
      error: record.error,
      receiptReference: record.receiptReference,
    }

    assertEvidenceIntegrity(evidence)
    const report = buildExecutionReport(evidence)

    for (const field of TRACKER_FORBIDDEN_SETTLEMENT_FIELDS) {
      if (field in (report as Record<string, unknown>)) {
        throw new Error(`Execution tracker report must not include settlement field: ${field}`)
      }
    }

    record.report = report
    record.finalizedAt = report.finalizedAt
    this.appendEvent(record, 'execution_report_finalized', record.status, {
      txHash: record.txHash,
      receiptReference: record.receiptReference,
      error: record.error,
    })
  }

  private requireRecord(executionId: string): ExecutionTrackerRecord {
    const record = this.records.get(executionId)
    if (!record) {
      throw new Error(`Unknown execution id: ${executionId}`)
    }
    return record
  }

  private persist(): void {
    saveTrackerSnapshot(this.scopeKey, [...this.records.values()])
  }
}

export function getExecutionTracker(account?: string, chainId?: number): ExecutionTracker {
  return ExecutionTracker.forScope(account, chainId)
}

export function extractTransactionHash(result: unknown): string | undefined {
  if (typeof result === 'string' && result.startsWith('0x')) {
    return result
  }
  if (result && typeof result === 'object' && 'hash' in result) {
    const hash = (result as { hash?: string }).hash
    return typeof hash === 'string' ? hash : undefined
  }
  return undefined
}

export function toExecutionError(error: unknown): ExecutionError {
  if (error instanceof Error) {
    return classifyExecutionError(error.message, 'failed') ?? {
      code: 'EXEC_UNKNOWN',
      category: 'unknown',
      message: error.message,
    }
  }
  return classifyExecutionError(String(error), 'failed') ?? {
    code: 'EXEC_UNKNOWN',
    category: 'unknown',
    message: String(error),
  }
}
