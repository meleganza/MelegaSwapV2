import type { DryRunGatewayContext } from '../execution-gateway/types'
import type { ExecutionError, ExecutionEvidence, ExecutionReport } from '../execution-contract/types'
import type { SupportedInstructionType } from '../execution-ingress/constants'
import type { DryRunSuppressionManifest } from '../execution-gateway/types'
import { consumeKerlDryRunHandoffPackage } from './consume'
import type { HandoffConsumerResult } from './consume'
import type { DryRunHandoffPackage } from './types'
import { validateCertifiedDryRunHandshake } from './validate-certified-handshake'

export type CertifiedHandshakeSuccess = {
  ok: true
  handshake: 'certified'
  packageId: string
  correlationId: string
  executionId: string
  instructionType: SupportedInstructionType
  evidence: ExecutionEvidence
  report: ExecutionReport
  dryRun: DryRunSuppressionManifest
}

export type CertifiedHandshakeFailure = {
  ok: false
  handshake: 'certified'
  error: ExecutionError
  packageId?: string
  executionId?: string
}

export type CertifiedHandshakeResult = CertifiedHandshakeSuccess | CertifiedHandshakeFailure

/**
 * Certified Dry-Run Handshake — Phase 6 internal entry.
 *
 * Pipeline:
 *   Certified DryRunHandoffPackage
 *     → validateCertifiedDryRunHandshake()
 *     → consumeKerlDryRunHandoffPackage() (existing consumer)
 *     → Execution Gateway (DRY_RUN_ONLY)
 *
 * The handshake performs no execution itself.
 * No adapter dispatch. No wallet interaction. No network communication.
 */
export function performCertifiedDryRunHandshake(
  handoffPackage: DryRunHandoffPackage,
  context: DryRunGatewayContext = {},
): CertifiedHandshakeResult {
  const validation = validateCertifiedDryRunHandshake(handoffPackage)
  if (!validation.ok) {
    return {
      ok: false,
      handshake: 'certified',
      error: validation.error,
      packageId: handoffPackage?.packageId,
    }
  }

  const consumerResult: HandoffConsumerResult = consumeKerlDryRunHandoffPackage(handoffPackage, context)

  if (!consumerResult.ok) {
    return {
      ok: false,
      handshake: 'certified',
      error: consumerResult.error,
      packageId: consumerResult.packageId,
      executionId: consumerResult.executionId,
    }
  }

  return {
    ok: true,
    handshake: 'certified',
    packageId: consumerResult.packageId,
    correlationId: consumerResult.correlationId,
    executionId: consumerResult.executionId,
    instructionType: consumerResult.instructionType,
    evidence: consumerResult.evidence,
    report: consumerResult.report,
    dryRun: consumerResult.dryRun,
  }
}
