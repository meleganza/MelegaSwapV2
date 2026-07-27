import type { TierMetricStatus } from 'lib/bsc-indexer/types'
import type { Valid24hChange } from 'lib/data-truth/compute24hPriceChange'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'

export type TierMetricRow = {
  slug: string
  pairAddress: string
  token0: string
  token1: string
  tier: string
  status: string
  volume24hQuote: number
  tradeCount24h: number
  priceChange24h?: number
  candleCount?: number
  eventCount24h?: number
  /** Recent Mint+Burn count — liquidity activity, not static reserves. */
  mintBurnCount24h?: number
  lastCloseQuote?: number
}

export type TierRankedAsset = {
  symbol: string
  slug: string
  pairSlug: string
  address: string
  chainId: number
  displayName: string
  tierStatus: TierMetricStatus
  priceUsd?: number
  change24h?: Valid24hChange
  volume24h: number
  liquidityScore: number
  tradeCount24h: number
  /** Recent LP Mint/Burn activity. */
  liquidityActivity24h?: number
  rankingSignals: string[]
}

const QUOTE_TOKEN_ADDRESSES = new Set([
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
])

export const TRENDING_ELIGIBLE_STATUSES = new Set<TierMetricStatus>(['READY', 'EMPTY_VERIFIED'])

export function isTrendingTierStatus(status: string): status is TierMetricStatus {
  return TRENDING_ELIGIBLE_STATUSES.has(status as TierMetricStatus)
}

export function isQuoteTokenAddress(address: string): boolean {
  return QUOTE_TOKEN_ADDRESSES.has(address.toLowerCase())
}

/** Rank the non-quote base token; never surface WBNB/BUSD/USDT when paired with a project token. */
export function pickTrendingBaseToken(token0: string, token1: string): string {
  const t0 = token0.toLowerCase()
  const t1 = token1.toLowerCase()
  const t0Quote = isQuoteTokenAddress(t0)
  const t1Quote = isQuoteTokenAddress(t1)
  if (t0Quote && !t1Quote) return t1
  if (t1Quote && !t0Quote) return t0
  if (t0 === MARCO_BSC_ADDRESS.toLowerCase()) return t0
  if (t1 === MARCO_BSC_ADDRESS.toLowerCase()) return t1
  return t0Quote ? t1 : t0
}

/** Legacy market signal (liquidity-allowed). Prefer isTopMoverEligible. */
export function hasTrendingMarketSignal(input: {
  tradeCount24h: number
  volume24h: number
  liquidityScore: number
  change24h?: Valid24hChange
}): boolean {
  const hasChange =
    input.change24h != null &&
    Number.isFinite(input.change24h.pct) &&
    Math.abs(input.change24h.pct) > 0.0001
  return (
    input.tradeCount24h > 0 ||
    input.volume24h > 0 ||
    input.liquidityScore > 0 ||
    hasChange
  )
}

/**
 * TOP MOVERS membership — never admit on token existence / static reserves alone.
 * Requires factual price movement OR swap activity OR volume OR recent LP Mint/Burn.
 */
export function isTopMoverEligible(input: {
  tradeCount24h: number
  volume24h: number
  liquidityActivity24h?: number
  change24h?: Valid24hChange
}): boolean {
  const hasChange =
    input.change24h != null &&
    Number.isFinite(input.change24h.pct) &&
    Math.abs(input.change24h.pct) > 0.0001
  return (
    hasChange ||
    input.tradeCount24h > 0 ||
    input.volume24h > 0 ||
    (input.liquidityActivity24h != null && input.liquidityActivity24h > 0)
  )
}

/**
 * TOP MOVERS rank:
 * 1) |price variation %|
 * 2) swap activity
 * 3) volume
 * 4) recent liquidity activity
 */
export function compareTierRankedAssets(a: TierRankedAsset, b: TierRankedAsset): number {
  const aCh = Math.abs(a.change24h?.pct ?? 0)
  const bCh = Math.abs(b.change24h?.pct ?? 0)
  if (bCh !== aCh) return bCh - aCh
  if (b.tradeCount24h !== a.tradeCount24h) return b.tradeCount24h - a.tradeCount24h
  if (b.volume24h !== a.volume24h) return b.volume24h - a.volume24h
  const aLiq = a.liquidityActivity24h ?? 0
  const bLiq = b.liquidityActivity24h ?? 0
  if (bLiq !== aLiq) return bLiq - aLiq
  return (b.liquidityScore ?? 0) - (a.liquidityScore ?? 0)
}

export function rankTierAssets(assets: TierRankedAsset[], limit = 10): TierRankedAsset[] {
  const byAddress = new Map<string, TierRankedAsset>()
  for (const asset of assets) {
    const key = asset.address.toLowerCase()
    const existing = byAddress.get(key)
    if (!existing || compareTierRankedAssets(asset, existing) < 0) {
      byAddress.set(key, asset)
    }
  }
  const bySymbol = new Map<string, TierRankedAsset>()
  for (const asset of byAddress.values()) {
    const symbolKey = asset.symbol.toUpperCase()
    const existing = bySymbol.get(symbolKey)
    if (!existing || compareTierRankedAssets(asset, existing) < 0) {
      bySymbol.set(symbolKey, asset)
    }
  }
  return [...bySymbol.values()].sort(compareTierRankedAssets).slice(0, limit)
}

export function formatTrendingTickerPrice(price?: number): string | undefined {
  if (!price || price <= 0 || !Number.isFinite(price)) return undefined
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

/** Ticker accent: ↑ 2.4% / ↓ 0.5% when factual; never invent. */
export function trendingTickerAccent(asset: TierRankedAsset): {
  accent?: string
  accentPositive?: boolean
} {
  const change =
    asset.change24h && Math.abs(asset.change24h.pct) > 0.0001 ? asset.change24h : undefined
  if (change) {
    const arrow = change.positive ? '↑' : '↓'
    return {
      accent: `${arrow} ${Math.abs(change.pct).toFixed(1)}%`,
      accentPositive: change.positive,
    }
  }
  if (asset.tradeCount24h > 0) {
    return {
      accent: `${asset.tradeCount24h} trade${asset.tradeCount24h === 1 ? '' : 's'}`,
    }
  }
  if (asset.volume24h > 0) {
    return { accent: '24H vol' }
  }
  return {}
}
