/** Execution receipt sent by DEX — Treasury Runtime owns settlement normalization. */
export interface ExecutionReceiptPayload {
  schema: 'melega.dex-execution-receipt.v1'
  transactionHash: string
  wallet: string
  chain: number
  timestamp: string
  status: 'confirmed' | 'failed'
  asset: {
    symbol: string
    address: string
    decimals?: number
  }
  amount: string
  /** Gross protocol fee on input — execution metadata only, not treasury waterfall. */
  fee: string
  operation: 'swap'
  explorerUrl: string
  originModule: 'trade'
  originProject?: string
}

/** Context captured at swap submit — stored on transaction until receipt confirms. */
export interface SwapHandoffContext {
  schema: 'melega.dex-swap-handoff-context.v1'
  asset: {
    symbol: string
    address: string
    decimals?: number
  }
  amount: string
  fee: string
  originProject?: string
  smartRouter?: {
    architecture: 'ADAPTER'
    protocolFeeBps?: number
    buyMarcoIncentiveApplied?: boolean
    treasuryCollector?: string
    underlyingRouter?: string
    pricingRef: 'D87_DEX_PRICING_RATIFIED'
    treasuryPolicyRef: 'FSC-01'
    blocked?: string
    protocolFeeCollected?: Record<string, unknown>
    smartRouterSwapRouted?: Record<string, unknown>
  }
}

export type SettlementHandoffStatus =
  | 'SETTLEMENT_PENDING'
  | 'SETTLEMENT_ACCEPTED'
  | 'SETTLEMENT_DUPLICATE'
  | 'SETTLEMENT_REJECTED'

export type TreasuryRuntimeEndpointStatus = 'available' | 'unavailable' | 'not_configured'

export interface TreasurySettlementResponse {
  ok?: boolean
  settlement_id?: string
  settlement?: {
    settlement_id?: string
    authority?: string
    status?: string
  }
  authority?: string
  schema?: string
  status?: string
  machine_code?: string
  reason?: string
  code?: string
}

export interface SettlementReference {
  txHash: string
  chainId: number
  wallet: string
  settlementStatus: SettlementHandoffStatus
  settlementId?: string
  machineCode?: string
  reason?: string
  treasuryRuntimeEndpointStatus: TreasuryRuntimeEndpointStatus
  updatedAt: string
}

export interface SettlementHandoffResult {
  reference: SettlementReference
  response?: TreasurySettlementResponse
}

export interface TradeSettlementMachineMetadata {
  txHash?: string
  settlementStatus: SettlementHandoffStatus | 'none'
  settlementId?: string
  machineCode?: string
  treasuryRuntimeEndpointStatus: TreasuryRuntimeEndpointStatus
}
