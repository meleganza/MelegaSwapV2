import { INTERVAL_SECONDS } from '../constants'
import type { NormalizedIndexerEvent, OhlcvCandle } from '../types'

function finite(n: number): boolean {
  return Number.isFinite(n) && !Number.isNaN(n) && n > 0
}

/** MARCO is token0, WBNB is token1 — price = token1 per token0 when selling token0 for token1. */
export function swapPriceFromEvent(event: NormalizedIndexerEvent): number | undefined {
  const a0 = Number(event.amount0 ?? 0)
  const a1 = Number(event.amount1 ?? 0)
  if (!finite(a0) || !finite(a1)) return undefined
  return a1 / a0
}

export function buildCandlesFromSwaps(
  swaps: NormalizedIndexerEvent[],
  pairAddress: string,
  intervals: Array<OhlcvCandle['interval']>,
): OhlcvCandle[] {
  const out: OhlcvCandle[] = []
  const now = new Date().toISOString()

  for (const interval of intervals) {
    const bucketSec = INTERVAL_SECONDS[interval]
    const buckets = new Map<
      number,
      {
        open: number
        high: number
        low: number
        close: number
        baseVolume: number
        quoteVolume: number
        tradeCount: number
        startBlock: number
        endBlock: number
      }
    >()

    for (const swap of swaps) {
      const price = swapPriceFromEvent(swap)
      if (!finite(price!)) continue
      const bucket = Math.floor(swap.blockTimestamp / bucketSec) * bucketSec
      const baseVol = Number(swap.amount0 ?? 0)
      const quoteVol = Number(swap.amount1 ?? 0)
      if (!finite(baseVol) || !finite(quoteVol)) continue

      const existing = buckets.get(bucket)
      if (!existing) {
        buckets.set(bucket, {
          open: price!,
          high: price!,
          low: price!,
          close: price!,
          baseVolume: baseVol,
          quoteVolume: quoteVol,
          tradeCount: 1,
          startBlock: swap.blockNumber,
          endBlock: swap.blockNumber,
        })
      } else {
        existing.high = Math.max(existing.high, price!)
        existing.low = Math.min(existing.low, price!)
        existing.close = price!
        existing.baseVolume += baseVol
        existing.quoteVolume += quoteVol
        existing.tradeCount += 1
        existing.endBlock = Math.max(existing.endBlock, swap.blockNumber)
      }
    }

    for (const [bucketTimestamp, c] of buckets) {
      if (!finite(c.open) || !finite(c.close)) continue
      out.push({
        pairAddress: pairAddress.toLowerCase(),
        interval,
        bucketTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        baseVolume: c.baseVolume,
        quoteVolume: c.quoteVolume,
        tradeCount: c.tradeCount,
        startBlock: c.startBlock,
        endBlock: c.endBlock,
        lastUpdated: now,
      })
    }
  }

  return out.sort((a, b) => a.bucketTimestamp - b.bucketTimestamp)
}
