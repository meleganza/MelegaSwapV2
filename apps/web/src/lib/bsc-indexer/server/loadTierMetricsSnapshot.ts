import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import { MARCO_WBNB_PAIR_BSC, REORG_SAFETY_BLOCKS } from 'lib/bsc-indexer/constants'
import { isBootstrapWindowComplete } from 'lib/bsc-indexer/indexer/bootstrapWindow'
import { bootstrapWindowSummary } from 'lib/bsc-indexer/indexer/coverageRanges'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'
import { buildTierPairStatusInput, resolveTierPairStatus } from 'lib/bsc-indexer/indexer/tierPairStatus'
import type { TierMetricStatus } from 'lib/bsc-indexer/types'
import { wbnbVolumeFromPairSides } from 'lib/market-volume/canonical24hVolume'

const SECONDS_24H = 86_400

export type TierPairStatus = TierMetricStatus | 'INVALID_PAIR'

export type ServerTierMetricRow = {
  slug: string
  pairAddress: string
  token0: string
  token1: string
  tier: string
  status: TierPairStatus
  /** @deprecated token1 raw volume — do not treat as WBNB unless token1 is WBNB. */
  volume24hQuote: number
  volume24hBase: number
  volume24hWbnb: number
  volumePriced: boolean
  tradeCount24h: number
  priceChange24h?: number
  candleCount: number
  eventCount24h: number
  indexingLag?: number
}

export type TierMetricsSnapshot = {
  generatedAt: string
  tier1Count: number
  tier2Count: number
  volumeMethodology: 'wbnb-side-notional-once · rolling-24h · candle-aggregated'
  rows: ServerTierMetricRow[]
}

/**
 * One server-side authority for tier metrics. API consumers and lightweight market snapshots
 * share this computation instead of asking every browser to hydrate the indexer independently.
 */
export async function loadTierMetricsSnapshot(nowMs = Date.now()): Promise<TierMetricsSnapshot> {
  const inventory = await loadTierPairInventory()
  const universe = [...inventory.tier1, ...inventory.tier2]
  const cutoff = Math.floor(nowMs / 1000) - SECONDS_24H
  const rows: ServerTierMetricRow[] = []

  for (const watch of universe) {
    const slug =
      watch.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()
        ? FEATURED_PAIR_SLUG
        : slugFromPairAddress(watch.pairAddress, watch.token0, watch.token1)
    try {
      const storage = resolveIndexerStorageForSlug(slug)
      const [health, checkpoint, candles, events] = await Promise.all([
        storage.loadHealth(),
        storage.loadCheckpoint(),
        storage.listCandles(watch.pairAddress, '1H', 48),
        storage.listEvents({ pairAddress: watch.pairAddress, limit: 500 }),
      ])

      const recentEvents = events.filter((event) => event.blockTimestamp >= cutoff)
      const recentCandles = candles.filter((candle) => candle.bucketTimestamp >= cutoff)
      const volume24hQuote = recentCandles.reduce((sum, candle) => sum + (candle.quoteVolume ?? 0), 0)
      const volume24hBase = recentCandles.reduce((sum, candle) => sum + (candle.baseVolume ?? 0), 0)
      const { wbnbVolume, priced } = wbnbVolumeFromPairSides({
        token0: watch.token0,
        token1: watch.token1,
        baseVolume: volume24hBase,
        quoteVolume: volume24hQuote,
      })
      const tradeCount24h =
        recentEvents.filter((event) => event.eventType === 'Swap').length ||
        recentCandles.reduce((sum, candle) => sum + (candle.tradeCount ?? 0), 0)
      const changeResult = computeValid24hPriceChange(candles)
      const hasSignal =
        wbnbVolume > 0 ||
        volume24hQuote > 0 ||
        tradeCount24h > 0 ||
        changeResult != null ||
        recentCandles.length >= 2

      const coverageRanges = checkpoint?.coverageRanges ?? []
      const bootstrapStart = checkpoint?.bootstrapStartBlock ?? 0
      const chainHeadRef = checkpoint?.chainHeadAtSync ?? checkpoint?.lastIndexedBlock ?? 0
      const forwardHigh = Math.max(0, chainHeadRef - REORG_SAFETY_BLOCKS)
      const windowSummary = bootstrapWindowSummary(coverageRanges, bootstrapStart, forwardHigh)
      const windowComplete = isBootstrapWindowComplete(windowSummary.coveragePercent, windowSummary.gaps)
      const status = resolveTierPairStatus(
        buildTierPairStatusInput({ hasSignal, checkpoint, health, windowComplete }),
      )

      rows.push({
        slug,
        pairAddress: watch.pairAddress,
        token0: watch.token0,
        token1: watch.token1,
        tier: watch.tier,
        status,
        volume24hQuote,
        volume24hBase,
        volume24hWbnb: wbnbVolume,
        volumePriced: priced,
        tradeCount24h,
        priceChange24h: changeResult?.pct,
        candleCount: candles.length,
        eventCount24h: recentEvents.length,
        indexingLag: health?.indexingLag,
      })
    } catch {
      rows.push({
        slug,
        pairAddress: watch.pairAddress,
        token0: watch.token0,
        token1: watch.token1,
        tier: watch.tier,
        status: 'INVALID_PAIR',
        volume24hQuote: 0,
        volume24hBase: 0,
        volume24hWbnb: 0,
        volumePriced: false,
        tradeCount24h: 0,
        candleCount: 0,
        eventCount24h: 0,
      })
    }
  }

  return {
    generatedAt: new Date(nowMs).toISOString(),
    tier1Count: inventory.tier1.length,
    tier2Count: inventory.tier2.length,
    volumeMethodology: 'wbnb-side-notional-once · rolling-24h · candle-aggregated',
    rows,
  }
}
