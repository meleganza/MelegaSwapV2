import type { SerializableTransactionReceipt } from 'state/transactions/reducer'

import type {
  EXECUTION_CONTRACT_VERSION,
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  INSTRUCTION_SOURCE_MANUAL,
} from './constants'

export type ExecutionDomain = 'swap' | 'bridge' | 'liquidity' | 'wrap'

export type ExecutionAdapter =
  | 'smart-router'
  | 'v2-router'
  | 'stable-swap'
  | 'kronoswap-bridge'
  | 'weth-wrap'

/**
 * Client-side execution lifecycle — not settlement state.
 * Unknown on-chain outcomes remain unknown until a receipt is observed.
 */
export type ExecutionStatus =
  | 'invalid'
  | 'loading'
  | 'awaiting_wallet'
  | 'awaiting_approval'
  | 'simulating'
  | 'ready'
  | 'dry_run_completed'
  | 'submitted'
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'reverted'

export type InstructionSource =
  | typeof INSTRUCTION_SOURCE_DEX_ROUTING
  | typeof INSTRUCTION_SOURCE_KERL_PREVIEW
  | typeof INSTRUCTION_SOURCE_MANUAL

export type InstructionSchemaVersion = typeof EXECUTION_INSTRUCTION_SCHEMA_VERSION

export type ExecutionContractVersion = typeof EXECUTION_CONTRACT_VERSION

/**
 * Stable instruction identity — produced outside the execution layer.
 */
export interface InstructionIdentity {
  /** Content-derived or routing-derived stable id */
  id: string
  /** Correlates routing decision with execution attempts and evidence */
  correlationId: string
  /** Instruction schema version for forward compatibility */
  version: InstructionSchemaVersion
  /** Provenance — who produced the instruction */
  source: InstructionSource
}

export type ExecutionErrorCategory =
  | 'wallet_rejected'
  | 'simulation_failed'
  | 'submission_failed'
  | 'reverted'
  | 'timeout'
  | 'adapter_error'
  | 'unknown'

/**
 * Structured execution error — not settlement failure.
 */
export interface ExecutionError {
  code: string
  category: ExecutionErrorCategory
  message: string
  revertReason?: string
}

/**
 * Receipt reference only — observed on-chain data.
 * Must not be fabricated when no receipt exists.
 */
export interface ReceiptReference {
  txHash: string
  blockNumber?: number
  status?: 0 | 1
}

export interface ExecutionInstructionBase extends InstructionIdentity {
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  createdAt: string
  /** Chain context when known; unknown remains undefined */
  chainId?: number
}

/**
 * Execution evidence — DEX-owned raw submission surface.
 * Not settlement. Not treasury-normalized. Unknown remains unknown.
 */
export interface ExecutionEvidence {
  instructionId: string
  executionId: string
  correlationId: string
  instructionVersion: InstructionSchemaVersion
  instructionSource: InstructionSource
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  adapterIdentity: string
  status: ExecutionStatus
  chainId?: number
  txHash?: string
  blockNumber?: number
  submittedAt?: string
  finalizedAt?: string
  error?: ExecutionError
  receiptReference?: ReceiptReference
  summary?: string
  /** Raw EVM receipt when actually observed — never fabricated */
  receipt?: SerializableTransactionReceipt
}

/**
 * Execution report — lifecycle summary for internal consumers.
 * Must not imply settlement, treasury submission, or mission outcomes.
 */
export interface ExecutionReport {
  reportVersion: ExecutionContractVersion
  instructionId: string
  executionId: string
  correlationId: string
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  adapterIdentity: string
  status: ExecutionStatus
  chainId?: number
  txHash?: string
  blockNumber?: number
  submittedAt?: string
  finalizedAt?: string
  error?: ExecutionError
  receiptReference?: ReceiptReference
}
