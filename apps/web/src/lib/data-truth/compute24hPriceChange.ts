import type { OhlcvCandle } from 'lib/bsc-indexer/types'

const SECONDS_24H = 86_400

export interface Valid24hChange {
  pct: number
  text: string
  positive: boolean
}

/** Requires ≥2 candles inside the rolling 24H window — never falls back to full history. */
export function computeValid24hPriceChange(candles: OhlcvCandle[]): Valid24hChange | undefined {
  if (candles.length < 2) return undefined
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const window = candles.filter((c) => c.bucketTimestamp >= cutoff)
  if (window.length < 2) return undefined

  const open = window[0]?.open
  const close = window[window.length - 1]?.close
  if (open == null || close == null || !Number.isFinite(open) || !Number.isFinite(close) || open <= 0) {
    return undefined
  }

  const pct = ((close - open) / open) * 100
  if (!Number.isFinite(pct)) return undefined
  const positive = pct >= 0
  return {
    pct,
    text: `${positive ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`,
    positive,
  }
}

export function format24hChangePct(pct: number): Valid24hChange {
  const positive = pct >= 0
  return {
    pct,
    text: `${positive ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`,
    positive,
  }
}
