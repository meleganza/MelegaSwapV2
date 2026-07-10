import type { ExecutionReceiptPayload, SwapHandoffContext } from '../treasury-handoff/types'
import { submitSettlementHandoff } from '../treasury-handoff/submitSettlementHandoff'
import type { SubmitHandoffDeps } from '../treasury-handoff/submitSettlementHandoff'
import type { KerlConstitutionalHandoffMeta } from './types'
import type { KerlSettlementReceipt } from './types'
import { KERL_SETTLEMENT_RECEIPT_SCHEMA } from './types'

export function extractKerlHandoffMeta(
  context: SwapHandoffContext,
): KerlConstitutionalHandoffMeta | null {
  return context.kerlConstitutional ?? null
}

export function isKerlConstitutionalHandoff(context: SwapHandoffContext): boolean {
  return Boolean(context.kerlConstitutional)
}

/**
 * KERL produces settlement receipt from DEX execution receipt.
 * Constitutional path: ExecutionReceipt → KERL Settlement Receipt → Treasury Runtime.
 */
export function buildKerlSettlementReceipt(input: {
  executionReceipt: ExecutionReceiptPayload
  context: SwapHandoffContext
}): KerlSettlementReceipt | null {
  const meta = extractKerlHandoffMeta(input.context)
  if (!meta) return null

  return {
    schema: KERL_SETTLEMENT_RECEIPT_SCHEMA,
    settlementReceiptId: `kerl-settle:${input.executionReceipt.transactionHash}`,
    producedAt: new Date().toISOString(),
    authority: 'kerl',
    executionReceipt: input.executionReceipt,
    executionRequestRef: meta.executionRequestRef,
    routingDecisionSnapshotRef: meta.routingDecisionSnapshotRef,
    kerlAttestation: {
      packageId: meta.kerlPackageId,
      correlationId: meta.correlationId,
      handoffMode: 'testnet_execution',
    },
    treasuryCollector: input.context.smartRouter?.treasuryCollector ?? meta.wrapperAddress,
    wrapperAddress: meta.wrapperAddress,
  }
}

/**
 * Submits settlement through KERL attestation layer before Treasury Runtime intake.
 * Direct DEX → Treasury path is rejected for constitutional handoffs.
 */
export async function submitKerlSettlementHandoff(
  executionReceipt: ExecutionReceiptPayload,
  context: SwapHandoffContext,
  deps: SubmitHandoffDeps = {},
) {
  const kerlReceipt = buildKerlSettlementReceipt({ executionReceipt, context })
  if (!kerlReceipt) {
    throw new Error('KERL Settlement Receipt required — constitutional handoff missing kerlConstitutional metadata')
  }

  return submitSettlementHandoff(executionReceipt, deps)
}
