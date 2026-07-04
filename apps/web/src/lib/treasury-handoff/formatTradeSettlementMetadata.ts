import { getSettlementReference } from './settlementReferenceStore'
import type { TradeSettlementMachineMetadata } from './types'

export function formatTradeSettlementMetadata(input: {
  chainId?: number
  latestTxHash?: string
}): TradeSettlementMachineMetadata {
  if (!input.chainId || !input.latestTxHash) {
    return {
      settlementStatus: 'none',
      treasuryRuntimeEndpointStatus: 'not_configured',
    }
  }

  const ref = getSettlementReference(input.chainId, input.latestTxHash)
  if (!ref) {
    return {
      txHash: input.latestTxHash,
      settlementStatus: 'none',
      treasuryRuntimeEndpointStatus: 'not_configured',
    }
  }

  return {
    txHash: ref.txHash,
    settlementStatus: ref.settlementStatus,
    settlementId: ref.settlementId,
    machineCode: ref.machineCode,
    treasuryRuntimeEndpointStatus: ref.treasuryRuntimeEndpointStatus,
  }
}
