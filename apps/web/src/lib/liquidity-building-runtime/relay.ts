import type { ExecutionArtifactV1, ExecutionIntentV1Wire, TxMonitorStatus } from './types'

/**
 * Permissionless relay — submits signed calldata only.
 * Must not sign, modify economics, choose recipients, or set fees.
 */
export type RelaySubmitRequest = {
  program: string
  intent: ExecutionIntentV1Wire
  signature: string
  /** ABI-encoded executeLiquidityBuilding call — opaque to relay economics */
  calldata: string
  to: string
  gasLimit?: string
  maxFeePerGas?: string
  idempotencyKey: string
}

export type RelaySubmitResult =
  | {
      ok: true
      transactionHash: string
      status: TxMonitorStatus
      submissionId: string
    }
  | {
      ok: false
      reason: string
      code: 'RELAY_UNAVAILABLE' | 'UNSIGNED' | 'CALLDATA_TAMPER' | 'DUPLICATE' | 'DISABLED'
    }

export interface LiquidityBuildingRelay {
  readonly ready: boolean
  submit(req: RelaySubmitRequest): Promise<RelaySubmitResult>
  getStatus(submissionId: string): Promise<TxMonitorStatus | null>
}

export class DisabledLiquidityBuildingRelay implements LiquidityBuildingRelay {
  readonly ready = false
  private readonly seen = new Map<string, RelaySubmitResult>()

  async submit(req: RelaySubmitRequest): Promise<RelaySubmitResult> {
    if (!req.signature || req.signature === '0x') {
      return { ok: false, reason: 'Missing signature', code: 'UNSIGNED' }
    }
    // Even when disabled, enforce no-tamper check surface for tests
    if (!req.calldata || !req.calldata.startsWith('0x')) {
      return { ok: false, reason: 'Invalid calldata', code: 'CALLDATA_TAMPER' }
    }
    if (this.seen.has(req.idempotencyKey)) {
      return { ok: false, reason: 'Duplicate submission', code: 'DUPLICATE' }
    }
    const blocked: RelaySubmitResult = {
      ok: false,
      reason: 'Permissionless relay not provisioned (LB-G03C). No funded execution wallet fallback.',
      code: 'DISABLED',
    }
    this.seen.set(req.idempotencyKey, blocked)
    return blocked
  }

  async getStatus(_submissionId: string): Promise<TxMonitorStatus | null> {
    return null
  }
}

/** Verify relay cannot alter intent economics vs signed artifact. */
export function relayPreservesEconomics(
  artifact: ExecutionArtifactV1,
  submittedIntent: ExecutionIntentV1Wire,
): boolean {
  const a = artifact.intent
  return (
    a.grossQuoteTarget === submittedIntent.grossQuoteTarget &&
    a.eligibleNetBuyFlow === submittedIntent.eligibleNetBuyFlow &&
    a.effectiveStrategyRateBps === submittedIntent.effectiveStrategyRateBps &&
    a.program.toLowerCase() === submittedIntent.program.toLowerCase() &&
    a.treasuryAuthorizationReference === submittedIntent.treasuryAuthorizationReference
  )
}
