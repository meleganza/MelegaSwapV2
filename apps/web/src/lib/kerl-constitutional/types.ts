import type { TradeType } from '@pancakeswap/sdk'
import type { ExecutionReceiptPayload } from '../treasury-handoff/types'

export const EXECUTION_REQUEST_SCHEMA = 'melega.kerl.execution-request.v1' as const
export const KERL_SETTLEMENT_RECEIPT_SCHEMA = 'melega.kerl.settlement-receipt.v1' as const

export type KerlRouteType = 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO'

export interface ExecutionRequest {
  schema: typeof EXECUTION_REQUEST_SCHEMA
  requestId: string
  chainId: number
  producedAt: string
  authority: 'kerl'
  routingDecisionSnapshotRef: string
  kerlPackageId: string
  correlationId: string
  wrapperAddress: string
  treasuryCollector: string
  underlyingRouter: string
  adapter: 'v2-execution-adapter'
  routeType: KerlRouteType
  tradeType: TradeType
  inputIsNative: boolean
  inputToken: string | null
  outputToken: string
  path: string[]
  amountRaw: string
  slippageBps: number
  recipient: string | null
  expectedFeeBps: number
}

export interface KerlSettlementReceipt {
  schema: typeof KERL_SETTLEMENT_RECEIPT_SCHEMA
  settlementReceiptId: string
  producedAt: string
  authority: 'kerl'
  executionReceipt: ExecutionReceiptPayload
  executionRequestRef: string
  routingDecisionSnapshotRef: string
  kerlAttestation: {
    packageId: string
    correlationId: string
    handoffMode: 'testnet_execution'
  }
  treasuryCollector: string
  wrapperAddress: string
}

export interface KerlConstitutionalHandoffMeta {
  executionRequestRef: string
  routingDecisionSnapshotRef: string
  kerlPackageId: string
  correlationId: string
  wrapperAddress: string
  routeType: KerlRouteType
}
