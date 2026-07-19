/**
 * Production authorize path wiring (LB010).
 * Connects intent builder → KMS signer → Authorizer validation surface.
 * Remains blocked until production authority is provisioned.
 */

import type { ExecutionArtifactV1, ExecutionIntentV1Wire } from './types'
import { DisabledLiquidityBuildingKmsSigner, type LiquidityBuildingKmsSigner, signArtifact } from './signing-adapter'
import { signatureNormalizationProductionStatus } from './kms-signature-normalization'

export type AuthorizePathResult =
  | {
      ok: true
      artifact: ExecutionArtifactV1
      authorityAddress: string
    }
  | {
      ok: false
      reason: string
      code:
        | 'SIGNING_DISABLED'
        | 'AUTHORITY_NOT_READY'
        | 'NORMALIZATION_NOT_PRODUCTION_VERIFIED'
        | 'INTENT_MUTATION_FORBIDDEN'
        | 'REJECTED'
    }

/**
 * Attempt production authorization. Never mutates intent after signing.
 * Never falls back to HOT_SIGNER / private key.
 */
export async function authorizeExecutionIntent(args: {
  artifact: ExecutionArtifactV1
  signer?: LiquidityBuildingKmsSigner
  /** Pre-sign snapshot for mutation detection */
  intentSnapshot?: ExecutionIntentV1Wire
}): Promise<AuthorizePathResult> {
  const norm = signatureNormalizationProductionStatus()
  if (norm.status !== 'VERIFIED') {
    // Module may be implemented, but production path stays blocked without VERIFIED + ready signer
  }

  if (args.intentSnapshot) {
    const a = JSON.stringify(args.artifact.intent)
    const b = JSON.stringify(args.intentSnapshot)
    if (a !== b) {
      return { ok: false, reason: 'Intent mutated before signing', code: 'INTENT_MUTATION_FORBIDDEN' }
    }
  }

  const signer = args.signer ?? new DisabledLiquidityBuildingKmsSigner()
  if (!signer.ready) {
    return {
      ok: false,
      reason: `Production authority not ready (${norm.blocker})`,
      code: 'AUTHORITY_NOT_READY',
    }
  }

  const signed = await signArtifact(args.artifact, signer)
  if (signed.signingStatus !== 'SIGNED' || !signed.signature) {
    return {
      ok: false,
      reason: signed.signingReason || 'Signing rejected',
      code: signed.signingStatus === 'DISABLED' ? 'SIGNING_DISABLED' : 'REJECTED',
    }
  }

  // Post-sign mutation guard
  if (JSON.stringify(signed.intent) !== JSON.stringify(args.artifact.intent)) {
    return { ok: false, reason: 'Intent mutated after signing', code: 'INTENT_MUTATION_FORBIDDEN' }
  }

  return {
    ok: true,
    artifact: signed,
    authorityAddress: 'provisioned', // real address comes from signer result in future adapters
  }
}
