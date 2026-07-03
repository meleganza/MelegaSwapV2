import { EXECUTION_CONTRACT_VERSION, SETTLEMENT_FORBIDDEN_FIELDS } from './constants'
import type { ExecutionEvidence, ExecutionReport } from './types'

/**
 * Builds an internal execution report from observed evidence.
 * Reports describe submission lifecycle only — never settlement outcomes.
 */
export function buildExecutionReport(evidence: ExecutionEvidence): ExecutionReport {
  const report: ExecutionReport = {
    reportVersion: EXECUTION_CONTRACT_VERSION,
    instructionId: evidence.instructionId,
    executionId: evidence.executionId,
    correlationId: evidence.correlationId,
    domain: evidence.domain,
    adapter: evidence.adapter,
    adapterIdentity: evidence.adapterIdentity,
    status: evidence.status,
    chainId: evidence.chainId,
    txHash: evidence.txHash,
    blockNumber: evidence.blockNumber,
    submittedAt: evidence.submittedAt,
    finalizedAt: evidence.finalizedAt,
    error: evidence.error,
    receiptReference: evidence.receiptReference,
  }

  assertReportDoesNotImplySettlement(report)
  return report
}

export function assertReportDoesNotImplySettlement(report: ExecutionReport): void {
  for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
    if (field in (report as Record<string, unknown>)) {
      throw new Error(`Execution report must not imply settlement: ${field}`)
    }
  }

  if ('receipt' in (report as Record<string, unknown>)) {
    throw new Error('Execution report must not embed raw receipt — use receiptReference only')
  }
}
