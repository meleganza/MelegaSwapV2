import type { ExecutionArtifactV1, ExecutionIntentV1Wire } from './types'

/**
 * Production KMS signing adapter interface (LB009).
 * No private-key / HOT_SIGNER / vm.sign path in production code.
 */
export type KmsSignRequest = {
  intent: ExecutionIntentV1Wire
  /** Precomputed Authorizer-compatible digest (0x + 64 hex) when available */
  digest?: string
}

export type KmsSignResult =
  | {
      ok: true
      signature: string
      digest: string
      authorityAddress: string
      providerClass: string
    }
  | {
      ok: false
      reason: string
      code:
        | 'KMS_UNAVAILABLE'
        | 'AUTHORITY_NOT_PROVISIONED'
        | 'NORMALIZATION_UNAVAILABLE'
        | 'ARBITRARY_DIGEST_FORBIDDEN'
        | 'VALIDATION_FAILED'
        | 'DISABLED'
    }

export interface LiquidityBuildingKmsSigner {
  readonly providerClass: string
  readonly ready: boolean
  signExecutionIntent(req: KmsSignRequest): Promise<KmsSignResult>
}

/**
 * Disabled production signer — keeps LB-G03B / LB-G11 open.
 * Rejects all signing requests. Never falls back to hot keys.
 */
export class DisabledLiquidityBuildingKmsSigner implements LiquidityBuildingKmsSigner {
  readonly providerClass = 'DISABLED_PENDING_KMS'
  readonly ready = false

  async signExecutionIntent(_req: KmsSignRequest): Promise<KmsSignResult> {
    return {
      ok: false,
      reason:
        'Production non-exportable KMS/HSM authority and DER normalization are not provisioned (LB-G03B, LB-G11). No private-key fallback.',
      code: 'DISABLED',
    }
  }
}

export async function signArtifact(
  artifact: ExecutionArtifactV1,
  signer: LiquidityBuildingKmsSigner,
): Promise<ExecutionArtifactV1> {
  if (!signer.ready) {
    return {
      ...artifact,
      signingStatus: 'DISABLED',
      signingReason: 'SIGNER_NOT_READY',
      signature: null,
      digest: null,
    }
  }
  const result = await signer.signExecutionIntent({ intent: artifact.intent })
  if (!result.ok) {
    return {
      ...artifact,
      signingStatus: 'REJECTED',
      signingReason: `${result.code}:${result.reason}`,
      signature: null,
      digest: null,
    }
  }
  return {
    ...artifact,
    signingStatus: 'SIGNED',
    signingReason: null,
    signature: result.signature,
    digest: result.digest,
  }
}

/** Reject any attempt to inject a local private-key signer. */
export function assertNoPrivateKeySignerConfig(env: NodeJS.ProcessEnv = process.env): {
  ok: boolean
  violations: string[]
} {
  const violations: string[] = []
  const forbidden = [
    'LB_EXECUTION_PRIVATE_KEY',
    'LIQUIDITY_BUILDING_PRIVATE_KEY',
    'LB_HOT_SIGNER_KEY',
    'LB_MNEMONIC',
  ]
  for (const k of forbidden) {
    if (env[k]) violations.push(k)
  }
  // HOT_SIGNER must never be selected for LB
  if ((env.LB_SIGNER_TYPE || '').toUpperCase() === 'HOT_SIGNER') {
    violations.push('LB_SIGNER_TYPE=HOT_SIGNER')
  }
  return { ok: violations.length === 0, violations }
}
