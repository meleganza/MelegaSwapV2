import type { TransactionDetails } from 'state/transactions/reducer'

import { SETTLEMENT_FORBIDDEN_FIELDS } from './constants'
import { classifyExecutionError } from './errors'
import { createExecutionId } from './identity'
import type {
  ExecutionEvidence,
  ExecutionInstructionBase,
  ExecutionStatus,
  ReceiptReference,
} from './types'

export interface InstructionForEvidence extends ExecutionInstructionBase {}

export function mapTransactionToExecutionEvidence(
  instruction: InstructionForEvidence,
  tx: TransactionDetails,
  executionId: string,
  chainId?: number,
): ExecutionEvidence {
  const status = deriveStatusFromTransaction(tx)
  const receiptReference = buildReceiptReference(tx)
  const error = classifyExecutionError(
    tx.receipt?.status === 0 ? 'reverted' : undefined,
    status,
  )

  return {
    instructionId: instruction.id,
    executionId,
    correlationId: instruction.correlationId,
    instructionVersion: instruction.version,
    instructionSource: instruction.source,
    domain: instruction.domain,
    adapter: instruction.adapter,
    adapterIdentity: instruction.adapter,
    status,
    txHash: tx.hash,
    chainId,
    blockNumber: tx.receipt?.blockNumber,
    receiptReference,
    receipt: tx.receipt,
    summary: tx.summary,
    error,
    submittedAt: tx.addedTime ? new Date(tx.addedTime).toISOString() : undefined,
    finalizedAt: tx.confirmedTime ? new Date(tx.confirmedTime).toISOString() : undefined,
  }
}

function deriveStatusFromTransaction(tx: TransactionDetails): ExecutionStatus {
  if (tx.receipt) {
    return tx.receipt.status === 1 ? 'confirmed' : 'reverted'
  }
  if (tx.hash) {
    return 'pending'
  }
  return 'submitted'
}

function buildReceiptReference(tx: TransactionDetails): ReceiptReference | undefined {
  if (!tx.hash) {
    return undefined
  }
  if (!tx.receipt) {
    return { txHash: tx.hash }
  }
  return {
    txHash: tx.hash,
    blockNumber: tx.receipt.blockNumber,
    status: tx.receipt.status === 0 || tx.receipt.status === 1 ? tx.receipt.status : undefined,
  }
}

/**
 * Evidence must not fabricate receipts or imply settlement.
 */
export function buildDryRunExecutionEvidence(
  instruction: InstructionForEvidence,
  executionId: string,
  chainId?: number,
  finalizedAt?: string,
): ExecutionEvidence {
  const evidence: ExecutionEvidence = {
    instructionId: instruction.id,
    executionId,
    correlationId: instruction.correlationId,
    instructionVersion: instruction.version,
    instructionSource: instruction.source,
    domain: instruction.domain,
    adapter: instruction.adapter,
    adapterIdentity: instruction.adapter,
    status: 'dry_run_completed',
    chainId: chainId ?? instruction.chainId,
    summary: 'Execution intentionally suppressed — DRY_RUN_ONLY mode',
    finalizedAt: finalizedAt ?? instruction.createdAt,
  }

  assertEvidenceIntegrity(evidence)
  return evidence
}

export function assertEvidenceIntegrity(evidence: ExecutionEvidence): void {
  if (evidence.receipt && !evidence.txHash) {
    throw new Error('Execution evidence cannot include a receipt without transaction hash')
  }
  if (evidence.receiptReference && !evidence.receiptReference.txHash) {
    throw new Error('Execution evidence receipt reference requires txHash')
  }
  if (evidence.receipt && !evidence.receiptReference) {
    throw new Error('Execution evidence with receipt must include receiptReference')
  }

  for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
    if (field in (evidence as Record<string, unknown>)) {
      throw new Error(`Execution evidence must not include settlement field: ${field}`)
    }
  }
}

export { createExecutionId }
