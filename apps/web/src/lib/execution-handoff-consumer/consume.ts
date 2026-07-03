import { acceptKerlExecutionInstruction } from '../execution-ingress/kerl-gateway'
import type { DryRunGatewayContext, DryRunGatewaySuccess } from '../execution-gateway/types'
import type { ExecutionError, ExecutionEvidence, ExecutionReport } from '../execution-contract/types'
import type { SupportedInstructionType } from '../execution-ingress/constants'
import type { DryRunSuppressionManifest } from '../execution-gateway/types'
import { validateDryRunHandoffPackage } from './validate-handoff'
import type { DryRunHandoffPackage } from './types'

export type HandoffConsumerSuccess = {
  ok: true
  packageId: string
  correlationId: string
  executionId: string
  instructionType: SupportedInstructionType
  evidence: ExecutionEvidence
  report: ExecutionReport
  dryRun: DryRunSuppressionManifest
  gateway: Pick<
    DryRunGatewaySuccess,
    'executionId' | 'instructionType' | 'evidence' | 'report' | 'dryRun'
  >
}

export type HandoffConsumerFailure = {
  ok: false
  error: ExecutionError
  packageId?: string
  executionId?: string
}

export type HandoffConsumerResult = HandoffConsumerSuccess | HandoffConsumerFailure

/**
 * Internal-only DEX consumer for KERL Dry-Run Handoff Packages.
 *
 * Validates handoff integrity, extracts proposed ExecutionInstruction,
 * and routes through acceptKerlExecutionInstruction (DRY_RUN_ONLY gateway).
 *
 * No adapter dispatch. No wallet submission. No public API. No UI exposure.
 */
export function consumeKerlDryRunHandoffPackage(
  handoffPackage: DryRunHandoffPackage,
  context: DryRunGatewayContext = {},
): HandoffConsumerResult {
  const validation = validateDryRunHandoffPackage(handoffPackage)
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      packageId: handoffPackage?.packageId,
    }
  }

  const gatewayResult = acceptKerlExecutionInstruction(handoffPackage.proposedInstruction, context)

  if (!gatewayResult.ok) {
    return {
      ok: false,
      error: gatewayResult.error,
      packageId: handoffPackage.packageId,
      executionId: gatewayResult.executionId,
    }
  }

  return {
    ok: true,
    packageId: handoffPackage.packageId,
    correlationId: handoffPackage.correlationId,
    executionId: gatewayResult.executionId,
    instructionType: gatewayResult.instructionType,
    evidence: gatewayResult.evidence,
    report: gatewayResult.report,
    dryRun: gatewayResult.dryRun,
    gateway: {
      executionId: gatewayResult.executionId,
      instructionType: gatewayResult.instructionType,
      evidence: gatewayResult.evidence,
      report: gatewayResult.report,
      dryRun: gatewayResult.dryRun,
    },
  }
}
