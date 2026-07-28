/**
 * LIQUIDITY_MODULE_003 — pure discovery model (search / filter / sort).
 * No wallet writes. Metrics only when provided factually.
 */
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import { searchPairs } from 'lib/bsc-indexer/pairs/classify'
import type { LiquidityDiscoveryFilter, LiquidityDiscoverySort } from './liquidityPoolDiscoveryTokens'
import { LIQUIDITY_POOL_DISCOVERY_COPY, liquidityPoolDiscovery } from './liquidityPoolDiscoveryTokens'

export type DiscoveryPoolMetrics = {
  tvlUsd?: number | null
  volumeUsd?: number | null
  feesUsd?: number | null
}

export type DiscoveryPoolCardModel = {
  id: string
  pairAddress: string
  token0: string
  token1: string
  symbol0: string
  symbol1: string
  pairName: string
  status: 'Active' | 'Unavailable'
  active: boolean
  tvlLabel: string
  volumeLabel: string
  feesLabel: string
  tvlUsd: number | null
  volumeUsd: number | null
  feesUsd: number | null
  lastVerified?: string
  addHref: string
  classification: ClassifiedAmmPair['classification']
}

function shortAddr(addr?: string): string {
  if (!addr || addr.length < 10) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function formatDiscoveryUsd(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    return LIQUIDITY_POOL_DISCOVERY_COPY.metricUnavailable
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function isPoolActive(pair: ClassifiedAmmPair): boolean {
  return (
    pair.active === true &&
    (pair.classification === 'tradeable' || pair.classification === 'liquidity_present')
  )
}

export function buildAddLiquidityHref(token0?: string, token1?: string): string {
  if (token0 && token1 && token0.length === 42 && token1.length === 42) {
    return `/add/${token0}/${token1}`
  }
  return liquidityPoolDiscovery.addLiquidityHref
}

export function toDiscoveryCard(
  pair: ClassifiedAmmPair,
  metrics?: DiscoveryPoolMetrics,
): DiscoveryPoolCardModel | null {
  if (!pair.pairAddress || pair.classification === 'invalid_contract') return null
  if (!pair.token0 || !pair.token1) return null

  const symbol0 = pair.symbol0?.trim() || shortAddr(pair.token0)
  const symbol1 = pair.symbol1?.trim() || shortAddr(pair.token1)
  const active = isPoolActive(pair)
  const tvlUsd = metrics?.tvlUsd ?? null
  const volumeUsd = metrics?.volumeUsd ?? null
  const feesUsd = metrics?.feesUsd ?? null

  return {
    id: pair.pairAddress.toLowerCase(),
    pairAddress: pair.pairAddress,
    token0: pair.token0,
    token1: pair.token1,
    symbol0,
    symbol1,
    pairName: `${symbol0} / ${symbol1}`,
    status: active ? LIQUIDITY_POOL_DISCOVERY_COPY.statusActive : LIQUIDITY_POOL_DISCOVERY_COPY.statusUnavailable,
    active,
    tvlLabel: formatDiscoveryUsd(tvlUsd),
    volumeLabel: formatDiscoveryUsd(volumeUsd),
    feesLabel: formatDiscoveryUsd(feesUsd),
    tvlUsd: tvlUsd != null && Number.isFinite(tvlUsd) && tvlUsd > 0 ? tvlUsd : null,
    volumeUsd: volumeUsd != null && Number.isFinite(volumeUsd) && volumeUsd > 0 ? volumeUsd : null,
    feesUsd: feesUsd != null && Number.isFinite(feesUsd) && feesUsd > 0 ? feesUsd : null,
    lastVerified: pair.lastVerified,
    addHref: buildAddLiquidityHref(pair.token0, pair.token1),
    classification: pair.classification,
  }
}

export function filterDiscoveryCards(
  cards: DiscoveryPoolCardModel[],
  filter: LiquidityDiscoveryFilter,
  myTokenAddresses: ReadonlySet<string>,
): DiscoveryPoolCardModel[] {
  switch (filter) {
    case 'popular':
      return cards.filter((c) => c.active && c.classification === 'tradeable')
    case 'newest':
      return cards.filter((c) => Boolean(c.lastVerified))
    case 'my-tokens':
      if (myTokenAddresses.size === 0) return []
      return cards.filter(
        (c) =>
          myTokenAddresses.has(c.token0.toLowerCase()) || myTokenAddresses.has(c.token1.toLowerCase()),
      )
    case 'all':
    default:
      return cards
  }
}

export function sortDiscoveryCards(
  cards: DiscoveryPoolCardModel[],
  sort: LiquidityDiscoverySort,
): DiscoveryPoolCardModel[] {
  const next = [...cards]
  switch (sort) {
    case 'tvl':
      return next.sort((a, b) => (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1) || a.pairName.localeCompare(b.pairName))
    case 'volume':
      return next.sort(
        (a, b) => (b.volumeUsd ?? -1) - (a.volumeUsd ?? -1) || a.pairName.localeCompare(b.pairName),
      )
    case 'newest':
      return next.sort((a, b) => {
        const ta = a.lastVerified ? Date.parse(a.lastVerified) : 0
        const tb = b.lastVerified ? Date.parse(b.lastVerified) : 0
        return tb - ta || a.pairName.localeCompare(b.pairName)
      })
    default:
      return next
  }
}

export function searchDiscoveryPairs(pairs: ClassifiedAmmPair[], query: string): ClassifiedAmmPair[] {
  return searchPairs(pairs, query)
}

/** Which filter chips are factual for the current dataset. */
export function factualFilters(cards: DiscoveryPoolCardModel[], myTokensReady: boolean): LiquidityDiscoveryFilter[] {
  const out: LiquidityDiscoveryFilter[] = ['all']
  if (myTokensReady) out.push('my-tokens')
  if (cards.some((c) => c.active && c.classification === 'tradeable')) out.push('popular')
  if (cards.some((c) => Boolean(c.lastVerified))) out.push('newest')
  return out
}

/** Which sort options are factual (have at least one real metric / timestamp). */
export function factualSorts(cards: DiscoveryPoolCardModel[]): LiquidityDiscoverySort[] {
  const out: LiquidityDiscoverySort[] = []
  if (cards.some((c) => c.tvlUsd != null)) out.push('tvl')
  if (cards.some((c) => c.volumeUsd != null)) out.push('volume')
  if (cards.some((c) => Boolean(c.lastVerified))) out.push('newest')
  return out
}
