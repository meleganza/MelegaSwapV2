/**
 * Canonical Melega DEX market snapshot — single certified dataset for all surfaces.
 * Pages must not independently invent USD price / volume / FDV / liquidity aggregates.
 */

import { createHash } from 'crypto'
import { buildFeaturedProjectMarkets } from 'lib/bsc-indexer/featuredMarkets'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { resolveOnchainRegistry } from 'lib/bsc-indexer/registry/store'
import { classifyAmmPair } from 'lib/bsc-indexer/pairs/classify'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'
import {
  pairContributionUsd,
  sumPricedUsd,
  wbnbVolumeFromPairSides,
} from 'lib/market-volume/canonical24hVolume'
import {
  MIN_COMPLETE_ABS,
  MIN_COMPLETE_RATIO,
  MIN_TRENDING_TENURE_MS,
} from 'lib/trending/durableTrendingSnapshot'
import { fetchBnbUsd } from './bnbUsd'
import { publishOrRetain } from './lastGood'
import { runMarketSanity } from './sanity'
import type {
  CanonicalFeaturedObservation,
  CanonicalMarketSnapshot,
  CanonicalPairObservation,
  MarketConfidence,
  MarketFreshness,
} from './types'

const SECONDS_24H = 86_400

function confidenceFromStatus(status: string, priced: boolean): MarketConfidence {
  if (!priced) return 'none'
  if (status === 'LIVE') return 'high'
  if (status === 'STALE' || status === 'NO_RECENT_TRADES') return 'medium'
  return 'low'
}

function freshnessFromStatus(status: string): MarketFreshness {
  if (status === 'LIVE') return 'fresh'
  if (status === 'STALE' || status === 'NO_RECENT_TRADES') return 'stale'
  return 'unavailable'
}

async function buildPairObservations(bnbUsd?: number): Promise<{
  pairs: CanonicalPairObservation[]
  swapEventCount24h: number
}> {
  const inventory = await loadTierPairInventory()
  const universe = [...inventory.tier1, ...inventory.tier2]
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const pairs: CanonicalPairObservation[] = []
  let swapEventCount24h = 0

  for (const watch of universe) {
    const slug =
      watch.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()
        ? FEATURED_PAIR_SLUG
        : slugFromPairAddress(watch.pairAddress, watch.token0, watch.token1)
    try {
      const storage = resolveIndexerStorageForSlug(slug)
      const [candles, events] = await Promise.all([
        storage.listCandles(watch.pairAddress, '1H', 48),
        storage.listEvents({ pairAddress: watch.pairAddress, limit: 500 }),
      ])
      const recentEvents = events.filter((e) => e.blockTimestamp >= cutoff)
      const recentCandles = candles.filter((c) => c.bucketTimestamp >= cutoff)
      const quoteVolume24h = recentCandles.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
      const baseVolume24h = recentCandles.reduce((sum, c) => sum + (c.baseVolume ?? 0), 0)
      const tradeCount24h =
        recentEvents.filter((e) => e.eventType === 'Swap').length ||
        recentCandles.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)
      swapEventCount24h += recentEvents.filter((e) => e.eventType === 'Swap').length
      const change = computeValid24hPriceChange(candles)
      const contrib = pairContributionUsd({
        pairAddress: watch.pairAddress,
        token0: watch.token0,
        token1: watch.token1,
        baseVolume: baseVolume24h,
        quoteVolume: quoteVolume24h,
        bnbUsd,
      })
      const { wbnbVolume, priced } = wbnbVolumeFromPairSides({
        token0: watch.token0,
        token1: watch.token1,
        baseVolume: baseVolume24h,
        quoteVolume: quoteVolume24h,
      })
      const status =
        wbnbVolume > 0 || tradeCount24h > 0 || change != null
          ? tradeCount24h > 0
            ? 'LIVE'
            : 'STALE'
          : 'NO_RECENT_TRADES'
      pairs.push({
        pairAddress: watch.pairAddress.toLowerCase(),
        token0: watch.token0.toLowerCase(),
        token1: watch.token1.toLowerCase(),
        slug,
        tier: watch.tier,
        baseVolume24h,
        quoteVolume24h,
        volume24hWbnb: contrib.wbnbVolume || wbnbVolume,
        volume24hUsd: contrib.usdVolume ?? undefined,
        tradeCount24h,
        priceChange24hPct: change?.pct,
        priced,
        priceSource: priced ? 'bnb-usd' : 'unpriced',
        status,
        confidence: confidenceFromStatus(status, priced),
        freshness: freshnessFromStatus(status),
      })
    } catch {
      pairs.push({
        pairAddress: watch.pairAddress.toLowerCase(),
        token0: watch.token0.toLowerCase(),
        token1: watch.token1.toLowerCase(),
        slug,
        tier: watch.tier,
        baseVolume24h: 0,
        quoteVolume24h: 0,
        volume24hWbnb: 0,
        tradeCount24h: 0,
        priced: false,
        priceSource: 'unpriced',
        status: 'UNAVAILABLE',
        confidence: 'none',
        freshness: 'unavailable',
      })
    }
  }

  return { pairs, swapEventCount24h }
}

function mapFeatured(
  rows: Awaited<ReturnType<typeof buildFeaturedProjectMarkets>>['rows'],
  bnbUsd?: number,
): CanonicalFeaturedObservation[] {
  return rows.map((r) => {
    const hasPrice = r.latestPriceUsd != null && r.latestPriceUsd > 0
    const hasLiq = r.liquidityUsd != null && r.liquidityUsd > 0
    const hasVol = r.volume24hUsd != null && r.volume24hUsd > 0
    const hasFdv = r.marketCapUsd != null && r.marketCapUsd > 0
    let unavailableReason: string | undefined
    if (!hasPrice && bnbUsd == null) unavailableReason = 'bnb-usd-unavailable'
    else if (!hasPrice) unavailableReason = 'price-uncomputable'
    else if (!hasFdv) unavailableReason = 'total-supply-or-price-missing'
    return {
      slug: r.slug,
      symbol: r.symbol,
      tokenAddress: r.tokenAddress,
      pairAddress: r.pairAddress,
      priceUsd: r.latestPriceUsd,
      priceWbnb: r.latestPriceQuote,
      volume24hUsd: r.volume24hUsd,
      volume24hWbnb: r.volume24hQuote,
      tradeCount24h: r.tradeCount24h,
      liquidityUsd: r.liquidityUsd,
      fdvUsd: r.marketCapUsd,
      marketCapLabel: (r.marketCapLabel as CanonicalFeaturedObservation['marketCapLabel']) || 'Unavailable',
      unavailableReason: hasFdv ? undefined : unavailableReason,
      changePct: r.changePct,
      status: r.status,
      bnbUsd: r.bnbUsd ?? bnbUsd,
      source: r.source,
      confidence: confidenceFromStatus(r.status, hasPrice && hasLiq),
    }
  })
}

export async function buildCanonicalMarketSnapshot(): Promise<CanonicalMarketSnapshot> {
  const generatedAt = new Date().toISOString()
  const [{ usd: bnbUsd, source: bnbUsdSource }, featuredBody, listed, registry] = await Promise.all([
    fetchBnbUsd(),
    buildFeaturedProjectMarkets(),
    Promise.resolve(measureListedProjectsCount()),
    resolveOnchainRegistry(),
  ])

  const { pairs, swapEventCount24h } = await buildPairObservations(bnbUsd)
  const volumeAgg = sumPricedUsd(
    pairs.map((p) => ({
      pairAddress: p.pairAddress,
      token0: p.token0,
      token1: p.token1,
      baseVolume: p.baseVolume24h,
      quoteVolume: p.quoteVolume24h,
      wbnbVolume: p.volume24hWbnb,
      usdVolume: p.volume24hUsd ?? null,
      priced: p.priced,
      priceSource: p.priceSource,
    })),
  )

  const featured = mapFeatured(featuredBody.rows, bnbUsd)
  const ammPairs = registry.registry?.amm?.pairs ?? []
  const tradeable = ammPairs.filter((p) => classifyAmmPair(p).classification === 'tradeable').length

  const pricedFeatured = featured.filter((f) => f.priceUsd != null && f.priceUsd > 0).length
  const fdvFeatured = featured.filter((f) => f.fdvUsd != null && f.fdvUsd > 0).length
  const volFeatured = featured.filter((f) => f.volume24hUsd != null && f.volume24hUsd > 0).length

  const tokenSet = new Set<string>()
  for (const p of pairs) {
    tokenSet.add(p.token0)
    tokenSet.add(p.token1)
  }
  for (const f of featured) tokenSet.add(f.tokenAddress.toLowerCase())

  const pricedTokens = new Set(
    featured.filter((f) => f.priceUsd != null).map((f) => f.tokenAddress.toLowerCase()),
  )

  const draft: CanonicalMarketSnapshot = {
    schema: 'melega.canonical-market-snapshot.v1',
    snapshotId: '',
    generatedAt,
    chainId: 56,
    bnbUsd,
    bnbUsdSource,
    volume24hWbnb: pairs.reduce((s, p) => s + (p.volume24hWbnb || 0), 0),
    volume24hUsd: volumeAgg.totalUsd > 0 ? volumeAgg.totalUsd : undefined,
    volumeMethodology: 'wbnb-side-notional-once · rolling-24h · candle-aggregated · tx+log uniqueness at indexer',
    unpricedPairCount: pairs.length - volumeAgg.pricedPairCount,
    pricedPairCount: volumeAgg.pricedPairCount,
    swapEventCount24h,
    tvlUsd: undefined,
    tvlMethodology: 'not aggregated in v1 snapshot — Home uses farm-partial; Liquidity uses factory-reserves',
    listedProjects: listed.finalCount,
    listedProjectsProvenance: listed.provenance,
    markets: tradeable,
    marketsMethodology: 'factory tradeable AMM pairs (classification=tradeable)',
    pairs: pairs.sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0)),
    featured,
    aprPools: [],
    trending: {
      schema: 'melega.trending.durable-snapshot.v1',
      atomicPublish: true,
      minCompleteAbs: MIN_COMPLETE_ABS,
      minCompleteRatio: MIN_COMPLETE_RATIO,
      minTenureMs: MIN_TRENDING_TENURE_MS,
      durableKey: 'melega.trending.durable-snapshot.v1',
    },
    coverage: {
      trackedTokens: tokenSet.size,
      pricedTokens: pricedTokens.size,
      featuredCoverage: `${pricedFeatured}/${featured.length}`,
      fdvCoverage: `${fdvFeatured}/${featured.length}`,
      volumeCoverage: `${volFeatured}/${featured.length}`,
      priceCoverage: `${pricedFeatured}/${featured.length}`,
      aprEnabledPools: 0,
    },
    sanity: { ok: true, degraded: false, issues: [] },
    status: 'LIVE',
  }

  draft.snapshotId = createHash('sha256')
    .update(
      JSON.stringify({
        generatedAt,
        volume24hUsd: draft.volume24hUsd,
        listedProjects: draft.listedProjects,
        markets: draft.markets,
        featured: featured.map((f) => [f.slug, f.priceUsd, f.liquidityUsd, f.fdvUsd]),
      }),
    )
    .digest('hex')
    .slice(0, 16)

  draft.sanity = runMarketSanity(draft)
  return publishOrRetain(draft)
}

export type { CanonicalMarketSnapshot }
