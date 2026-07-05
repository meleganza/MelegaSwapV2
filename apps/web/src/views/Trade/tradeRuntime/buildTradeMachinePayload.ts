import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import type { TradeDataMachinePayload } from '../useTradeTerminalData'
import type { TradeMachinePayload } from './useTradeSwapRuntime'

export type TradeDataMissingReason =
  | 'pair_not_indexed'
  | 'subgraph_empty'
  | 'explorer_missing'
  | 'route_not_configured'
  | null

export interface TradeSurfaceMachinePayload {
  schema: 'melega.trade.v1'
  schemaVersion: '1.0.0'
  module: 'trade'
  timestamp: string
  pair: {
    canonical: boolean
    symbols: [string, string]
    outputAddress: string
    indexed: boolean
  }
  dataSources: string[]
  reasonCodes: Partial<Record<string, DataReasonCode>>
  dataStatus: {
    chart: 'indexed' | 'empty' | 'loading'
    stats: 'ready' | 'missing' | 'loading'
    recentSwaps: 'ready' | 'empty' | 'loading'
    missingReason: TradeDataMissingReason
    missingReasonDetail?: string
  }
  primaryActions: string[]
  runtimeLinks: string[]
  execution: TradeMachinePayload
  market: TradeDataMachinePayload
}

export function resolveTradeDataMissingReason(input: {
  tokenExists?: boolean
  tokenLoading: boolean
  hasSubgraphTx: boolean
  hasPairPrices: boolean
  outputAddress?: string
  routeConfigured: boolean
}): { reason: TradeDataMissingReason; detail?: string } {
  if (input.tokenLoading) return { reason: null }
  if (!input.outputAddress) {
    return { reason: 'route_not_configured', detail: 'Output token address not resolved' }
  }
  if (!input.routeConfigured) {
    return { reason: 'route_not_configured', detail: 'Swap route not configured for this pair' }
  }
  if (input.tokenExists === false) {
    return { reason: 'pair_not_indexed', detail: 'MARCO/BNB pair not indexed in subgraph' }
  }
  if (!input.hasSubgraphTx && !input.hasPairPrices) {
    return { reason: 'subgraph_empty', detail: 'Subgraph returned no candles or swap events' }
  }
  return { reason: null }
}

export function buildTradeSurfaceMachinePayload(input: {
  execution: TradeMachinePayload
  market: TradeDataMachinePayload
  inputSymbol: string
  outputSymbol: string
  outputAddress?: string
  tokenExists?: boolean
  tokenLoading: boolean
  hasSubgraphTx: boolean
  hasPairPrices: boolean
  routeConfigured: boolean
  chartStatus: 'indexed' | 'empty' | 'loading'
  statsStatus: 'ready' | 'missing' | 'loading'
  swapsStatus: 'ready' | 'empty' | 'loading'
}): TradeSurfaceMachinePayload {
  const canonical =
    input.outputAddress?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase() ||
    input.outputSymbol.toUpperCase() === 'MARCO'
  const missing = resolveTradeDataMissingReason(input)

  return {
    schema: 'melega.trade.v1',
    schemaVersion: '1.0.0',
    module: 'trade',
    timestamp: new Date().toISOString(),
    pair: {
      canonical,
      symbols: [input.inputSymbol, input.outputSymbol],
      outputAddress: input.outputAddress ?? MARCO_BSC_ADDRESS,
      indexed: input.tokenExists !== false,
    },
    dataSources: ['melega-subgraph', 'on-chain-multicall', 'presence-registry', 'wallet-state'],
    reasonCodes: input.market.reasonCodes,
    dataStatus: {
      chart: input.chartStatus,
      stats: input.statsStatus,
      recentSwaps: input.swapsStatus,
      missingReason: missing.reason,
      missingReasonDetail: missing.detail,
    },
    primaryActions: ['swap', 'approve_token', 'view_history', 'view_routes'],
    runtimeLinks: ['/command-center', '/liquidity-studio', '/trending', '/projects'],
    execution: input.execution,
    market: input.market,
  }
}
