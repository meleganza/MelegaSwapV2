import type { OhlcvCandle } from 'lib/bsc-indexer/types'

const SECONDS_24H = 86_400

export interface Valid24hChange {
  pct: number
  text: string
  positive: boolean
  /** Present when the observation window is not a full 24H — never label shorter spans as 24H. */
  periodLabel?: string
}

function formatChangeText(pct: number, periodLabel?: string): Valid24hChange {
  const positive = pct >= 0
  const arrow = positive ? '▲' : '▼'
  const body = `${arrow} ${Math.abs(pct).toFixed(2)}%`
  return {
    pct,
    text: periodLabel ? `${body} · ${periodLabel}` : body,
    positive,
    periodLabel,
  }
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
  return formatChangeText(pct)
}

/**
 * Prefer full 24H; otherwise use the longest factual candle span with an explicit period label.
 * Never labels a shorter interval as 24H.
 */
export function computeFactualPriceChange(candles: OhlcvCandle[]): Valid24hChange | undefined {
  const exact24h = computeValid24hPriceChange(candles)
  if (exact24h) return exact24h
  if (candles.length < 2) return undefined

  const sorted = [...candles].sort((a, b) => a.bucketTimestamp - b.bucketTimestamp)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const open = first?.open
  const close = last?.close
  if (open == null || close == null || !Number.isFinite(open) || !Number.isFinite(close) || open <= 0) {
    return undefined
  }
  const spanSec = Math.max(0, (last.bucketTimestamp ?? 0) - (first.bucketTimestamp ?? 0))
  if (spanSec < 3600) return undefined
  const pct = ((close - open) / open) * 100
  if (!Number.isFinite(pct)) return undefined
  const hours = Math.max(1, Math.round(spanSec / 3600))
  const periodLabel = hours >= 24 ? `${Math.round(hours / 24)}D` : `${hours}H`
  return formatChangeText(pct, periodLabel)
}

export function format24hChangePct(pct: number, periodLabel?: string): Valid24hChange {
  return formatChangeText(pct, periodLabel)
}

/** Build % change from ordered price observations (swap-execution or reserve snapshots). */
export function computeChangeFromObservations(
  observations: Array<{ ts: number; price: number }>,
  preferSeconds = SECONDS_24H,
): Valid24hChange | undefined {
  const usable = observations
    .filter((o) => Number.isFinite(o.ts) && Number.isFinite(o.price) && o.price > 0)
    .sort((a, b) => a.ts - b.ts)
  if (usable.length < 2) return undefined
  const newest = usable[usable.length - 1]
  const cutoff = newest.ts - preferSeconds
  const inWindow = usable.filter((o) => o.ts >= cutoff)
  if (inWindow.length >= 2) {
    const open = inWindow[0].price
    const close = inWindow[inWindow.length - 1].price
    const pct = ((close - open) / open) * 100
    if (!Number.isFinite(pct)) return undefined
    return formatChangeText(pct)
  }
  const open = usable[0].price
  const close = newest.price
  const spanSec = newest.ts - usable[0].ts
  if (spanSec < 3600 || open <= 0) return undefined
  const pct = ((close - open) / open) * 100
  if (!Number.isFinite(pct)) return undefined
  const hours = Math.max(1, Math.round(spanSec / 3600))
  const periodLabel = hours >= 24 ? `${Math.round(hours / 24)}D` : `${hours}H`
  return formatChangeText(pct, periodLabel)
}
