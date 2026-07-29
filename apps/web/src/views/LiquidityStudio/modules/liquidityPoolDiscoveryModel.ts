/**
 * LIQUIDITY_MODULE_003 — pure discovery model (search / filter / sort).
 * No wallet writes. Metrics only when provided factually.
 */
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import { searchPairs } from 'lib/bsc-indexer/pairs/classify'
import { lookupCanonicalToken } from 'lib/canonical-token-registry'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { getAllAssets } from 'registry/assets/getAllAssets'
import type { LiquidityDiscoveryFilter, LiquidityDiscoverySort } from './liquidityPoolDiscoveryTokens'
import { LIQUIDITY_POOL_DISCOVERY_COPY, liquidityPoolDiscovery } from './liquidityPoolDiscoveryTokens'

const ASSET_SYMBOL_BY_ADDRESS: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const asset of getAllAssets()) {
    const addr = asset.contractAddress?.toLowerCase()
    if (!addr || !asset.symbol || /^0x/i.test(asset.symbol)) continue
    map.set(addr, asset.symbol)
  }
  return map
})()

export type DiscoveryPoolMetrics = {
  tvlUsd?: number | null
  volumeUsd?: number | null
  feesUsd?: number | null
  /** Factual LP APR when subgraph provides lpApr7d (>0). */
  aprPct?: number | null
}

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const STABLES = new Set([
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
])

/**
 * Factual TVL approximation from Factory reserves when a quote side is present.
 * TVL ≈ 2 × quoteReserve × quoteUsd (standard AMM when one side is WBNB/stable).
 * Returns null when quote valuation cannot be trusted.
 */
export function estimateReserveTvlUsd(
  pair: ClassifiedAmmPair,
  bnbUsd?: number | null,
): number | null {
  const t0 = pair.token0?.toLowerCase()
  const t1 = pair.token1?.toLowerCase()
  if (!t0 || !t1) return null
  const r0 = Number(pair.reserve0 ?? '0')
  const r1 = Number(pair.reserve1 ?? '0')
  if (!Number.isFinite(r0) || !Number.isFinite(r1) || (r0 <= 0 && r1 <= 0)) return null

  const human = (raw: number, decimals = 18) => raw / 10 ** decimals

  if (t0 === WBNB || t1 === WBNB) {
    if (bnbUsd == null || !Number.isFinite(bnbUsd) || bnbUsd <= 0) return null
    const wbnbRaw = t0 === WBNB ? r0 : r1
    const tvl = human(wbnbRaw) * bnbUsd * 2
    return Number.isFinite(tvl) && tvl > 0 ? tvl : null
  }

  if (STABLES.has(t0) || STABLES.has(t1)) {
    const stableRaw = STABLES.has(t0) ? r0 : r1
    // BSC USDT/USDC/BUSD use 18 decimals in Melega listings.
    const tvl = human(stableRaw) * 2
    return Number.isFinite(tvl) && tvl > 0 ? tvl : null
  }

  return null
}

export type DiscoveryPoolStatus = 'Active' | 'Inactive' | 'Empty' | 'Unavailable' | 'New'

export type DiscoveryPoolCardModel = {
  id: string
  pairAddress: string
  token0: string
  token1: string
  symbol0: string
  symbol1: string
  pairName: string
  status: DiscoveryPoolStatus
  statusReason?: string
  active: boolean
  tvlLabel: string
  volumeLabel: string
  feesLabel: string
  aprLabel: string
  liquidityLabel: string
  reservesLabel: string
  tvlUsd: number | null
  volumeUsd: number | null
  feesUsd: number | null
  aprPct: number | null
  metricSourceNote?: string
  lastVerified?: string
  addHref: string
  classification: ClassifiedAmmPair['classification']
  qualityScore: number
}

export function isResolvedDiscoverySymbol(symbol: string): boolean {
  return Boolean(symbol) && symbol !== '—' && symbol !== 'Unknown' && !/^0x/i.test(symbol)
}

/**
 * Resolve a human token symbol for discovery cards.
 * Never returns a contract address as the primary label.
 */
export function resolveDiscoverySymbol(address: string, pairSymbol?: string): string {
  const trimmed = pairSymbol?.trim()
  if (trimmed && !/^0x/i.test(trimmed) && !trimmed.includes('…')) return trimmed
  const canonical = lookupCanonicalToken(MELEGA_CHAIN_ID, address)
  if (canonical?.symbol && !/^0x/i.test(canonical.symbol)) return canonical.symbol
  const fromAssets = ASSET_SYMBOL_BY_ADDRESS.get(address.toLowerCase())
  if (fromAssets) return fromAssets
  return 'Unknown'
}

export function resolveDiscoveryStatus(
  pair: ClassifiedAmmPair,
  metrics?: DiscoveryPoolMetrics,
): { status: DiscoveryPoolStatus; reason?: string; active: boolean } {
  if (pair.classification === 'invalid_contract') {
    return { status: 'Unavailable', reason: 'Invalid pair contract', active: false }
  }
  const hasReserves =
    pair.classification === 'tradeable' || pair.classification === 'liquidity_present'
  const tvl = metrics?.tvlUsd
  const volume = metrics?.volumeUsd
  const hasTvl = tvl != null && Number.isFinite(tvl) && tvl > 0
  const hasVolume = volume != null && Number.isFinite(volume) && volume > 0

  if (hasReserves && (hasTvl || hasVolume || pair.active)) {
    return { status: 'Active', active: true }
  }
  if (pair.classification === 'empty' || (pair.active === false && !hasReserves)) {
    return { status: 'Empty', reason: 'No reserves / empty pool', active: false }
  }
  if (pair.lastVerified && Date.now() - Date.parse(pair.lastVerified) < 7 * 86_400_000 && !hasReserves) {
    return { status: 'New', reason: 'Recently verified · liquidity not confirmed', active: false }
  }
  if (!hasReserves) {
    return { status: 'Inactive', reason: 'No tradeable liquidity', active: false }
  }
  return {
    status: 'Unavailable',
    reason: 'Metrics source unavailable (Info subgraph / indexer)',
    active: false,
  }
}

export function formatDiscoveryUsd(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    return LIQUIDITY_POOL_DISCOVERY_COPY.metricUnavailable
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function isPoolActive(pair: ClassifiedAmmPair, metrics?: DiscoveryPoolMetrics): boolean {
  return resolveDiscoveryStatus(pair, metrics).active
}

export function buildAddLiquidityHref(token0?: string, token1?: string): string {
  if (token0 && token1 && token0.length === 42 && token1.length === 42) {
    return `/add/${token0}/${token1}`
  }
  return liquidityPoolDiscovery.addLiquidityHref
}

function metricLabel(value: number | null, missingSource: string): { label: string; note?: string } {
  if (value != null && Number.isFinite(value) && value > 0) {
    return { label: formatDiscoveryUsd(value) }
  }
  return { label: LIQUIDITY_POOL_DISCOVERY_COPY.metricUnavailable, note: missingSource }
}

export function toDiscoveryCard(
  pair: ClassifiedAmmPair,
  metrics?: DiscoveryPoolMetrics,
  bnbUsd?: number | null,
): DiscoveryPoolCardModel | null {
  if (!pair.pairAddress || pair.classification === 'invalid_contract') return null
  if (!pair.token0 || !pair.token1) return null

  const symbol0 = resolveDiscoverySymbol(pair.token0, pair.symbol0)
  const symbol1 = resolveDiscoverySymbol(pair.token1, pair.symbol1)
  const identityResolved = isResolvedDiscoverySymbol(symbol0) && isResolvedDiscoverySymbol(symbol1)
  const resolved = resolveDiscoveryStatus(pair, metrics)
  const reserveTvl = estimateReserveTvlUsd(pair, bnbUsd)
  const tvlUsd =
    metrics?.tvlUsd != null && Number.isFinite(metrics.tvlUsd) && metrics.tvlUsd > 0
      ? metrics.tvlUsd
      : reserveTvl
  const volumeUsd = metrics?.volumeUsd ?? null
  const feesUsd = metrics?.feesUsd ?? null
  const tvl = metricLabel(
    tvlUsd != null && Number.isFinite(tvlUsd) && tvlUsd > 0 ? tvlUsd : null,
    reserveTvl
      ? 'TVL source: Factory reserves × quote USD'
      : 'TVL source: Info subgraph unavailable for this pair',
  )
  const volume = metricLabel(
    volumeUsd != null && Number.isFinite(volumeUsd) && volumeUsd > 0 ? volumeUsd : null,
    '24h volume source: Info subgraph unavailable for this pair',
  )
  const fees = metricLabel(
    feesUsd != null && Number.isFinite(feesUsd) && feesUsd > 0 ? feesUsd : null,
    '24h fees source: Info subgraph unavailable for this pair',
  )
  const aprPct =
    metrics?.aprPct != null && Number.isFinite(metrics.aprPct) && metrics.aprPct > 0 ? metrics.aprPct : null
  const aprLabel =
    aprPct != null ? `${aprPct >= 100 ? aprPct.toFixed(0) : aprPct.toFixed(2)}%` : LIQUIDITY_POOL_DISCOVERY_COPY.metricUnavailable
  const r0 = Number(pair.reserve0 ?? '0')
  const r1 = Number(pair.reserve1 ?? '0')
  const reservesLabel =
    Number.isFinite(r0) && Number.isFinite(r1) && (r0 > 0 || r1 > 0)
      ? `${r0 > 0 ? r0.toPrecision(4) : '0'} / ${r1 > 0 ? r1.toPrecision(4) : '0'}`
      : LIQUIDITY_POOL_DISCOVERY_COPY.metricUnavailable
  const qualityScore =
    (resolved.active ? 1_000_000 : 0) +
    (identityResolved ? 100_000 : 0) +
    (tvlUsd && tvlUsd > 0 ? Math.min(tvlUsd, 999_999) : 0) +
    (volumeUsd && volumeUsd > 0 ? Math.min(volumeUsd, 99_999) : 0)

  return {
    id: pair.pairAddress.toLowerCase(),
    pairAddress: pair.pairAddress,
    token0: pair.token0,
    token1: pair.token1,
    symbol0,
    symbol1,
    pairName: `${symbol0} / ${symbol1}`,
    status: resolved.status,
    statusReason:
      resolved.reason ||
      (!identityResolved ? 'Token metadata incomplete — address retained in technical details only' : undefined),
    active: resolved.active,
    tvlLabel: tvl.label,
    volumeLabel: volume.label,
    feesLabel: fees.label,
    aprLabel,
    liquidityLabel: tvl.label,
    reservesLabel,
    tvlUsd: tvlUsd != null && Number.isFinite(tvlUsd) && tvlUsd > 0 ? tvlUsd : null,
    volumeUsd: volumeUsd != null && Number.isFinite(volumeUsd) && volumeUsd > 0 ? volumeUsd : null,
    feesUsd: feesUsd != null && Number.isFinite(feesUsd) && feesUsd > 0 ? feesUsd : null,
    aprPct,
    metricSourceNote: [tvl.note, volume.note, fees.note, aprPct == null ? 'APR: subgraph lpApr7d unavailable' : null]
      .filter(Boolean)
      .join(' · ') || undefined,
    lastVerified: pair.lastVerified,
    addHref: buildAddLiquidityHref(pair.token0, pair.token1),
    classification: pair.classification,
    qualityScore,
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

function hasDiscoveryMetrics(card: DiscoveryPoolCardModel): boolean {
  return (card.tvlUsd != null && card.tvlUsd > 0) || (card.volumeUsd != null && card.volumeUsd > 0)
}

function recencyTs(card: DiscoveryPoolCardModel): number {
  return card.lastVerified ? Date.parse(card.lastVerified) || 0 : 0
}

/** Default founder sort: TVL → 24H volume → recency → pair address; metric-less last. */
export function compareDiscoveryDefault(a: DiscoveryPoolCardModel, b: DiscoveryPoolCardModel): number {
  const aHas = hasDiscoveryMetrics(a) ? 1 : 0
  const bHas = hasDiscoveryMetrics(b) ? 1 : 0
  if (bHas !== aHas) return bHas - aHas
  const tvl = (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1)
  if (tvl !== 0) return tvl
  const vol = (b.volumeUsd ?? -1) - (a.volumeUsd ?? -1)
  if (vol !== 0) return vol
  const recency = recencyTs(b) - recencyTs(a)
  if (recency !== 0) return recency
  return a.pairAddress.toLowerCase().localeCompare(b.pairAddress.toLowerCase())
}

export function sortDiscoveryCards(
  cards: DiscoveryPoolCardModel[],
  sort: LiquidityDiscoverySort,
): DiscoveryPoolCardModel[] {
  const next = [...cards]
  switch (sort) {
    case 'tvl':
      return next.sort(
        (a, b) =>
          (hasDiscoveryMetrics(b) ? 1 : 0) - (hasDiscoveryMetrics(a) ? 1 : 0) ||
          (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1) ||
          (b.volumeUsd ?? -1) - (a.volumeUsd ?? -1) ||
          a.pairAddress.toLowerCase().localeCompare(b.pairAddress.toLowerCase()),
      )
    case 'volume':
      return next.sort(
        (a, b) =>
          (hasDiscoveryMetrics(b) ? 1 : 0) - (hasDiscoveryMetrics(a) ? 1 : 0) ||
          (b.volumeUsd ?? -1) - (a.volumeUsd ?? -1) ||
          (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1) ||
          a.pairAddress.toLowerCase().localeCompare(b.pairAddress.toLowerCase()),
      )
    case 'newest':
      return next.sort((a, b) => {
        const ta = recencyTs(a)
        const tb = recencyTs(b)
        return tb - ta || compareDiscoveryDefault(a, b)
      })
    case 'market':
    default:
      return next.sort(compareDiscoveryDefault)
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
  const out: LiquidityDiscoverySort[] = ['market']
  if (cards.some((c) => c.tvlUsd != null)) out.push('tvl')
  if (cards.some((c) => c.volumeUsd != null)) out.push('volume')
  if (cards.some((c) => Boolean(c.lastVerified))) out.push('newest')
  return out
}
