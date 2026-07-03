import type { ExecutionEvidence, ExecutionReport } from '../execution-contract/types'
import type { ExecutionInstruction } from '../execution-layer/types'

export interface SettlementEventCandidate {
  schema: 'melega.settlement-event-candidate.v1'
  generatedAt: string
  candidateId: string
  status: 'candidate_only'
  chainId: number
  instructionId: string
  correlationId: string
  executionId: string
  txHash: string | null
  blockNumber: number | null
  gasUsed: string | null
  receiptTimestamp: string | null
  domain: string
  adapter: string
  treasuryIngestion: false
  treasuryMutation: false
  notes: string
  evidenceRef: {
    instructionId: string
    executionId: string
    status: string
  }
  warnings: string[]
}

/**
 * Produces exactly one normalized Settlement Event candidate.
 * Does not mutate Treasury or ingest balances.
 */
export function buildSettlementEventCandidate(input: {
  instruction: ExecutionInstruction
  executionId: string
  evidence?: ExecutionEvidence
  report?: ExecutionReport
  txHash?: string | null
  blockNumber?: number | null
  gasUsed?: string | null
  receiptTimestamp?: string | null
  warnings?: string[]
}): SettlementEventCandidate {
  const chainId = input.evidence?.chainId ?? input.instruction.chainId ?? 97
  const txHash = input.txHash ?? input.evidence?.txHash ?? null

  return {
    schema: 'melega.settlement-event-candidate.v1',
    generatedAt: new Date().toISOString(),
    candidateId: `settlement-candidate:${input.instruction.id}:${input.executionId}`,
    status: 'candidate_only',
    chainId,
    instructionId: input.instruction.id,
    correlationId: input.instruction.correlationId,
    executionId: input.executionId,
    txHash,
    blockNumber: input.blockNumber ?? input.evidence?.blockNumber ?? null,
    gasUsed: input.gasUsed ?? null,
    receiptTimestamp: input.receiptTimestamp ?? input.evidence?.finalizedAt ?? null,
    domain: input.instruction.domain,
    adapter: input.instruction.adapter,
    treasuryIngestion: false,
    treasuryMutation: false,
    notes: 'Candidate only — Treasury ingestion explicitly not performed in T2 mission',
    evidenceRef: {
      instructionId: input.instruction.id,
      executionId: input.executionId,
      status: input.evidence?.status ?? input.report?.status ?? 'unknown',
    },
    warnings: input.warnings ?? [],
  }
}
