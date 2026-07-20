import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import { normalizeEvmAddress, toCaip2ChainId } from '../caip'
import { getVenuesByProjectSlug } from 'registry/venues/getVenueBySlug'
import type { StaticVenueRecord } from 'registry/venues/types'
import { MELEGA_FACTORY_BSC, MELEGA_ROUTER_BSC } from 'lib/bsc-indexer/constants'
import {
  MARKET_LIMITATIONS,
  MARKET_RESOLVER_REVISION,
  PROJECT_MARKETS_SCHEMA_VERSION,
  PROJECT_PAGE_MARKETS_SUMMARY_EXTENSION,
  type MarketAvailability,
  type MarketStatus,
  type MarketVerificationLevel,
} from './schema'
import { addressFromAssetRef, buildMarketId, buildMarketRevision } from './ids'
import {
  buildAssetTradableDestination,
  buildMarketSwapDestinations,
} from './buildSwapDestination'
import type {
  MarketResolutionContext,
  MarketsSummaryForProjectApi,
  ProjectMarketAssetSummary,
  ProjectMarketRecord,
  ProjectMarketsDocument,
  ProjectMarketsWarning,
  SwapDestinationDescriptor,
} from './types'
import { resolveProjectBySlug } from '../resolveProject'
import { normalizeProjectDocument } from '../normalizeProject'

function venueToMarketStatus(venue: StaticVenueRecord): {
  status: MarketStatus
  availability: MarketAvailability
  reasonCode: ProjectMarketRecord['reasonCode']
} {
  if (venue.lifecycle === 'deprecated' || venue.lifecycle === 'archived') {
    return { status: 'DEPRECATED', availability: 'UNAVAILABLE', reasonCode: 'MARKET_DEPRECATED' }
  }
  if (venue.lifecycle === 'draft') {
    return { status: 'INACTIVE', availability: 'UNAVAILABLE', reasonCode: 'MARKET_INACTIVE' }
  }
  const swapStatus = venue.capabilities.swap.status
  if (swapStatus === 'none') {
    return { status: 'INACTIVE', availability: 'UNAVAILABLE', reasonCode: 'VENUE_NOT_SWAP_CAPABLE' }
  }
  if (swapStatus === 'planned' || swapStatus === 'scheduled') {
    return { status: 'PAUSED', availability: 'UNAVAILABLE', reasonCode: 'MARKET_PAUSED' }
  }
  return { status: 'ACTIVE', availability: 'AVAILABLE', reasonCode: null }
}

function venueVerification(venue: StaticVenueRecord): MarketVerificationLevel {
  if (venue.trust.verificationStatus === 'verified') return 'MELEGA_VERIFIED'
  if (venue.trust.verificationStatus === 'observed') return 'OBSERVED'
  return 'PROJECT_ATTESTED'
}

function factoryRouterForChain(chainId: number): {
  factoryContractId: string | null
  routerContractId: string | null
} {
  if (chainId === 56) {
    return {
      factoryContractId: MELEGA_FACTORY_BSC.toLowerCase(),
      routerContractId: MELEGA_ROUTER_BSC.toLowerCase(),
    }
  }
  return { factoryContractId: null, routerContractId: null }
}

function resolveAssetIdForAddress(
  document: CanonicalProjectDocument,
  chainId: number,
  address: string,
): string {
  const normalized = normalizeEvmAddress(address)
  const match = document.assets.find(
    (a) => a.chainId === chainId && normalizeEvmAddress(a.contractAddress ?? '') === normalized,
  )
  if (match) return match.assetId
  return `eip155:${chainId}/erc20:${normalized}`
}

function symbolForAddress(
  document: CanonicalProjectDocument,
  chainId: number,
  address: string,
  fallback: string,
): string {
  const normalized = normalizeEvmAddress(address)
  const match = document.assets.find(
    (a) => a.chainId === chainId && normalizeEvmAddress(a.contractAddress ?? '') === normalized,
  )
  if (match?.symbol.meta.availability === 'AVAILABLE' && match.symbol.value) {
    return match.symbol.value
  }
  if (normalized === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c') return 'WBNB'
  return fallback
}

function marketFromSpotLpVenue(input: {
  document: CanonicalProjectDocument
  venue: StaticVenueRecord
  generatedAt: string
}): { market: ProjectMarketRecord; baseAddress: string; quoteAddress: string } | null {
  const { document, venue, generatedAt } = input
  if (venue.venueType !== 'spot_lp') return null
  const pair = venue.contractAddress ? normalizeEvmAddress(venue.contractAddress) : null
  if (!pair) return null

  const baseBinding = venue.assetBindings.find((b) => b.role === 'base')
  const quoteBinding = venue.assetBindings.find((b) => b.role === 'quote')
  const baseAddr = addressFromAssetRef(baseBinding?.assetUai)
  const quoteAddr = addressFromAssetRef(quoteBinding?.assetUai)
  if (!baseAddr || !quoteAddr) return null

  const projectAddrs = new Set(
    document.assets
      .filter((a) => a.chainId === venue.chainId)
      .map((a) => normalizeEvmAddress(a.contractAddress ?? ''))
      .filter(Boolean) as string[],
  )
  if (!projectAddrs.has(baseAddr) && !projectAddrs.has(quoteAddr)) {
    return null
  }

  const marketId = buildMarketId({
    projectId: document.projectId,
    marketType: 'AMM_V2_PAIR',
    chainId: venue.chainId,
    venue: 'melega-dex',
    pairOrPoolContract: pair,
    tokenA: baseAddr,
    tokenB: quoteAddr,
  })
  if (!marketId) return null

  const { status, availability, reasonCode } = venueToMarketStatus(venue)
  const { factoryContractId, routerContractId } = factoryRouterForChain(venue.chainId)
  const baseAssetId = resolveAssetIdForAddress(document, venue.chainId, baseAddr)
  const quoteAssetId = resolveAssetIdForAddress(document, venue.chainId, quoteAddr)
  const baseSymbol = symbolForAddress(document, venue.chainId, baseAddr, baseBinding?.assetSlug ?? 'BASE')
  const quoteSymbol = symbolForAddress(
    document,
    venue.chainId,
    quoteAddr,
    quoteBinding?.assetSlug ?? 'QUOTE',
  )

  return {
    baseAddress: baseAddr,
    quoteAddress: quoteAddr,
    market: {
      marketId,
      projectId: document.projectId,
      marketType: 'AMM_V2_PAIR',
      chainId: venue.chainId,
      caip2: toCaip2ChainId(venue.chainId),
      venue: 'melega-dex',
      venueSlug: venue.slug,
      baseAssetId,
      quoteAssetId,
      baseSymbol,
      quoteSymbol,
      pairOrPoolContractId: pair,
      factoryContractId,
      routerContractId,
      status,
      availability,
      source: 'VENUE_REGISTRY',
      verification: venueVerification(venue),
      observedAt: venue.asOf ? `${venue.asOf}T00:00:00.000Z` : generatedAt,
      updatedAt: generatedAt,
      dataRevision: buildMarketRevision([marketId, pair, venue.lifecycle, venue.asOf]),
      swapDestinationId: null,
      displayLabel: `${baseSymbol}/${quoteSymbol}`,
      limitations: [
        'Attributed via certified venue registry project binding.',
        'No live reserve or volume metrics are exposed in PP005.',
      ],
      reasonCode,
    },
  }
}

/**
 * Deterministic preferred-market policy (no fabricated liquidity/volume ranking).
 * Returns all equally preferred markets when ties remain.
 */
export function selectPreferredMarkets(
  markets: ProjectMarketRecord[],
  connectedChainId?: number | null,
): ProjectMarketRecord[] {
  const active = markets.filter((m) => m.status === 'ACTIVE' && m.availability === 'AVAILABLE')
  if (active.length === 0) return []

  let pool = active
  if (connectedChainId != null) {
    const onChain = active.filter((m) => m.chainId === connectedChainId)
    if (onChain.length) pool = onChain
  }

  const chains = [...new Set(pool.map((m) => m.chainId))].sort((a, b) => a - b)
  if (chains.length > 1 && chains.includes(56)) {
    pool = pool.filter((m) => m.chainId === 56)
  } else if (chains.length > 1) {
    const minChain = chains[0]
    pool = pool.filter((m) => m.chainId === minChain)
  }

  const melega = pool.filter((m) => m.venue === 'melega-dex')
  if (melega.length) pool = melega

  return [...pool].sort((a, b) => a.marketId.localeCompare(b.marketId))
}

/**
 * Single shared market resolver — HTML page and public API must use this.
 */
export function buildProjectMarketsDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  context?: MarketResolutionContext
}): ProjectMarketsDocument {
  const generatedAt = input.context?.generatedAt ?? new Date().toISOString()
  const connectedChainId = input.context?.connectedChainId ?? null
  const warnings: ProjectMarketsWarning[] = []
  const dataSources = new Set<string>(['registry.projects', 'registry.venues'])

  const assets: ProjectMarketAssetSummary[] = input.document.assets.map((asset) => ({
    assetId: asset.assetId,
    chainId: asset.chainId,
    symbol:
      asset.symbol.meta.availability === 'AVAILABLE' && asset.symbol.value ? asset.symbol.value : 'TOKEN',
    contractAddress: asset.contractAddress,
    projectRole: asset.projectRole,
    marketEnabled: false,
  }))

  if (input.document.assets.length === 0) {
    warnings.push({
      reasonCode: 'PROJECT_HAS_NO_ASSETS',
      message: 'Project has no registered assets for market orchestration.',
      marketId: null,
      chainId: null,
    })
  }

  const markets: ProjectMarketRecord[] = []
  const addressByMarketId = new Map<string, { base: string; quote: string }>()
  const seenMarketIds = new Set<string>()
  const seenPairKeys = new Set<string>()

  const venues = getVenuesByProjectSlug(input.document.slug)
  for (const venue of venues) {
    const built = marketFromSpotLpVenue({
      document: input.document,
      venue,
      generatedAt,
    })
    if (!built) continue
    const { market, baseAddress, quoteAddress } = built
    const dedupeKey = `${market.chainId}:${market.pairOrPoolContractId}`
    if (seenMarketIds.has(market.marketId) || seenPairKeys.has(dedupeKey)) continue
    seenMarketIds.add(market.marketId)
    seenPairKeys.add(dedupeKey)
    markets.push(market)
    addressByMarketId.set(market.marketId, { base: baseAddress, quote: quoteAddress })
  }

  for (const poolRef of input.project.resources.liquidityPools) {
    const addr = normalizeEvmAddress(poolRef)
    if (!addr) continue
    if (markets.some((m) => m.pairOrPoolContractId === addr)) continue
    warnings.push({
      reasonCode: 'PARTIAL_MARKET_COVERAGE',
      message:
        'Explicit liquidity pool reference lacks deterministic asset sides for safe attribution and was not promoted to a market.',
      marketId: null,
      chainId: null,
    })
  }

  markets.sort((a, b) => a.marketId.localeCompare(b.marketId))

  const preferredMarkets = selectPreferredMarkets(markets, connectedChainId)
  if (preferredMarkets.length > 1) {
    warnings.push({
      reasonCode: 'MULTIPLE_EQUAL_PREFERRED_MARKETS',
      message: 'Multiple equally preferred markets remain after deterministic policy — all exposed.',
      marketId: null,
      chainId: connectedChainId,
    })
  }

  const swapDestinations: SwapDestinationDescriptor[] = []
  for (const market of markets) {
    const addrs = addressByMarketId.get(market.marketId)
    if (!addrs) {
      warnings.push({
        reasonCode: 'INVALID_ASSET_IDENTIFIER',
        message: 'Market lacks resolvable base/quote addresses for swap destination.',
        marketId: market.marketId,
        chainId: market.chainId,
      })
      continue
    }
    const dests = buildMarketSwapDestinations({
      projectId: input.document.projectId,
      market,
      baseAddress: addrs.base,
      quoteAddress: addrs.quote,
      connectedChainId,
    })
    const readyBuy = dests.find((d) => d.status === 'READY' && d.label.includes('buy'))
    if (readyBuy) {
      market.swapDestinationId = readyBuy.destinationId
    }
    swapDestinations.push(...dests)
    for (const asset of assets) {
      if (asset.assetId === market.baseAssetId || asset.assetId === market.quoteAssetId) {
        asset.marketEnabled = market.status === 'ACTIVE' && market.availability === 'AVAILABLE'
      }
    }
  }

  const tradableCap = input.document.declaredCapabilities.find((c) => c.key === 'tradable')
  const tradableLive = tradableCap?.state === 'AVAILABLE'
  if (tradableLive) {
    for (const asset of input.document.assets.filter((a) => a.projectRole === 'primary')) {
      const covered = markets.some(
        (m) =>
          m.baseAssetId === asset.assetId && m.status === 'ACTIVE' && m.availability === 'AVAILABLE',
      )
      if (covered || !asset.contractAddress) continue
      const dest = buildAssetTradableDestination({
        projectId: input.document.projectId,
        chainId: asset.chainId,
        assetId: asset.assetId,
        tokenAddress: asset.contractAddress,
        symbol:
          asset.symbol.meta.availability === 'AVAILABLE' && asset.symbol.value
            ? asset.symbol.value
            : 'TOKEN',
        connectedChainId,
      })
      if (dest) {
        swapDestinations.push(dest)
        warnings.push({
          reasonCode: 'ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET',
          message: `Primary asset on chain ${asset.chainId} is tradable but has no registered pair market.`,
          marketId: null,
          chainId: asset.chainId,
        })
        const summaryAsset = assets.find((a) => a.assetId === asset.assetId)
        if (summaryAsset) summaryAsset.marketEnabled = true
      }
    }
  }

  swapDestinations.sort((a, b) => a.destinationId.localeCompare(b.destinationId))

  if (markets.length === 0 && !swapDestinations.some((d) => d.status === 'READY')) {
    warnings.push({
      reasonCode: 'PROJECT_HAS_NO_REGISTERED_MARKETS',
      message: 'No Melega DEX market is currently registered for this project.',
      marketId: null,
      chainId: null,
    })
  }

  const activeMarkets = markets.filter((m) => m.status === 'ACTIVE' && m.availability === 'AVAILABLE')
  const conflicted =
    markets.some((m) => m.availability === 'CONFLICTED') ||
    warnings.some((w) => w.reasonCode === 'MARKET_MAPPING_CONFLICTED')
  const partial = warnings.some((w) =>
    ['PARTIAL_MARKET_COVERAGE', 'ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET', 'LIVE_READ_UNAVAILABLE'].includes(
      w.reasonCode,
    ),
  )

  const canonicalPrimary =
    input.document.assets.find((a) => a.projectRole === 'primary' && a.chainId === 56) ??
    input.document.assets.find((a) => a.projectRole === 'primary') ??
    null

  const readyDestinations = swapDestinations.filter((d) => d.status === 'READY')
  const hasViewMarkets = markets.length > 0 || readyDestinations.length > 0
  const hasSwap = readyDestinations.length > 0

  const marketRevision = buildMarketRevision([
    input.document.revision,
    ...markets.map((m) => m.dataRevision),
    ...swapDestinations.map((d) => d.destinationId),
  ])

  const availability: MarketAvailability = conflicted
    ? 'CONFLICTED'
    : activeMarkets.length > 0 || readyDestinations.length > 0
      ? 'AVAILABLE'
      : input.document.assets.length === 0
        ? 'NOT_APPLICABLE'
        : 'UNAVAILABLE'

  return {
    schemaVersion: PROJECT_MARKETS_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    marketRevision,
    resolverRevision: MARKET_RESOLVER_REVISION,
    generatedAt,
    summary: {
      marketSupport: availability,
      activeMarketCount: activeMarkets.length,
      registeredMarketCount: markets.length,
      supportedMarketChains: [...new Set(markets.map((m) => m.chainId))].sort((a, b) => a - b),
      canonicalProjectAssetId: canonicalPrimary?.assetId ?? null,
      preferredMarketIds: preferredMarkets.map((m) => m.marketId),
      marketsEndpoint: `/api/public/projects/${input.document.slug}/markets/`,
      schemaVersion: PROJECT_MARKETS_SCHEMA_VERSION,
      lastObservationAt: markets[0]?.observedAt ?? null,
      partial,
      conflicted,
    },
    assets,
    markets,
    preferredMarkets,
    swapDestinations,
    dataSources: [...dataSources].sort(),
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: MARKET_LIMITATIONS,
    capabilities: {
      VIEW_MARKETS: hasViewMarkets ? 'AVAILABLE' : 'UNAVAILABLE',
      SWAP: hasSwap ? 'AVAILABLE' : 'UNAVAILABLE',
      BUY_PROJECT_ASSET: readyDestinations.some(
        (d) => d.label.includes('buy') || d.reasonCode === 'ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET',
      )
        ? 'AVAILABLE'
        : 'UNAVAILABLE',
      SELL_PROJECT_ASSET: readyDestinations.some((d) => d.label.includes('sell'))
        ? 'AVAILABLE'
        : 'UNAVAILABLE',
    },
  }
}

export function toMarketsSummaryForProjectApi(doc: ProjectMarketsDocument): MarketsSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_MARKETS_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    marketSupport: doc.summary.marketSupport,
    activeMarketCount: doc.summary.activeMarketCount,
    supportedMarketChains: doc.summary.supportedMarketChains,
    canonicalProjectAssetId: doc.summary.canonicalProjectAssetId,
    preferredMarketIds: doc.summary.preferredMarketIds,
    marketsEndpoint: doc.summary.marketsEndpoint,
    lastObservationAt: doc.summary.lastObservationAt,
    partial: doc.summary.partial,
    conflicted: doc.summary.conflicted,
  }
}

export function loadProjectMarketsDocument(
  slug: string,
  context?: MarketResolutionContext,
): ProjectMarketsDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const generatedAt = context?.generatedAt ?? new Date().toISOString()
  const document = normalizeProjectDocument(resolved.project, { generatedAt })
  return buildProjectMarketsDocument({
    project: resolved.project,
    document,
    context: { ...context, generatedAt },
  })
}
