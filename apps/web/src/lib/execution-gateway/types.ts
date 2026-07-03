import type { ExecutionError, ExecutionEvidence, ExecutionReport } from '../execution-contract/types'
import type { ExecutionInstruction } from '../execution-layer/types'
import type { SupportedInstructionType } from '../execution-ingress/constants'
import type { EXECUTION_AUTHORITY_DEX, EXECUTION_MODE_DRY_RUN_ONLY } from './constants'

export interface DryRunSuppressionManifest {
  executionMode: typeof EXECUTION_MODE_DRY_RUN_ONLY
  executionStatus: 'dry_run_completed'
  executionAuthority: typeof EXECUTION_AUTHORITY_DEX
  executionPerformed: false
  walletInteraction: 'none'
  transactionHash: null
  receipt: null
  settlement: null
  executionSuppressed: true
  suppressionReason: string
}

export interface DryRunGatewayContext {
  account?: string
  chainId?: number
  /** When true, certified handoff gate is satisfied for dry-run ingress. */
  certifiedHandoff?: boolean
}

export type DryRunGatewaySuccess = {
  ok: true
  executionId: string
  instructionType: SupportedInstructionType
  evidence: ExecutionEvidence
  report: ExecutionReport
  dryRun: DryRunSuppressionManifest
}

export type DryRunGatewayFailure = {
  ok: false
  error: ExecutionError
  executionId?: string
}

export type DryRunGatewayResult = DryRunGatewaySuccess | DryRunGatewayFailure

export type { ExecutionInstruction }
