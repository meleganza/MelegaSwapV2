import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import type { TradeSwapRow } from 'views/Trade/useTradeTerminalData'

export type TradeReconciliationStatus =
  | 'ready'
  | 'insufficient_history'
  | 'syncing'
  | 'inconsistent'
  | 'unavailable'

export interface TradeReconciliationInput {
  tradeCount24h: number
  volume24h: number
  swapEventCount24h: number
  recentSwaps: TradeSwapRow[]
  candles: OhlcvCandle[]
  reserveLiquidityUsd?: number
  liquidityDisplayed?: boolean
  indexerPhase?: string
  indexerLag?: number
}

export interface TradeReconciliationResult {
  status: TradeReconciliationStatus
  reasons: string[]
}

/** R786 G2 — shared trade reconciliation gate consumed by all Trade surfaces. */
export function reconcileTradeSurface(input: TradeReconciliationInput): TradeReconciliationResult {
  const reasons: string[] = []

  if (input.tradeCount24h > 0 && input.recentSwaps.length === 0) {
    reasons.push('tradeCount24h>0 but Recent Swaps empty')
  }
  if (input.volume24h > 0 && input.swapEventCount24h === 0) {
    reasons.push('volume24h>0 but no normalized Swap events in 24H window')
  }
  if (input.volume24h > 0) {
    const volumeCandles = input.candles.filter((c) => (c.quoteVolume ?? 0) > 0 || (c.tradeCount ?? 0) > 0)
    if (!volumeCandles.length) {
      reasons.push('volume24h>0 but no volume-bearing candles')
    }
  }
  if (input.tradeCount24h > 0 && input.candles.reduce((s, c) => s + (c.tradeCount ?? 0), 0) === 0) {
    reasons.push('tradeCount24h>0 but candle tradeCount sum is zero')
  }
  if (input.reserveLiquidityUsd != null && input.reserveLiquidityUsd > 0 && !input.liquidityDisplayed) {
    reasons.push('pair reserves readable but liquidity unavailable in UI')
  }

  if (reasons.length) {
    const hasIndexedSwaps = input.recentSwaps.length > 0 || input.swapEventCount24h > 0
    const bootstrapInProgress =
      input.indexerPhase === 'bootstrap' || (input.indexerLag ?? 0) > 5_000
    if (hasIndexedSwaps && bootstrapInProgress) {
      return { status: 'syncing', reasons: [...reasons, 'Indexer bootstrap converging — partial data visible'] }
    }
    return { status: 'inconsistent', reasons }
  }

  if ((input.indexerPhase === 'bootstrap' || (input.indexerLag ?? 0) > 5_000) && input.recentSwaps.length === 0) {
    return { status: 'syncing', reasons: ['Indexer bootstrap in progress'] }
  }

  const validCandles = input.candles.filter(
    (c) => Number.isFinite(c.close) && c.close > 0 && Number.isFinite(c.bucketTimestamp),
  )
  if (validCandles.length > 0 && validCandles.length < 3) {
    return { status: 'insufficient_history', reasons: ['Fewer than 3 valid candles'] }
  }

  if (input.recentSwaps.length > 0 || input.tradeCount24h > 0 || input.volume24h > 0) {
    return { status: 'ready', reasons: [] }
  }

  return { status: 'unavailable', reasons: ['No indexed trade activity in window'] }
}
