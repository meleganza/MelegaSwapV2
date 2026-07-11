import type { NextApiHandler } from 'next'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'

const SECONDS_24H = 86_400

export type TierPairStatus = 'READY' | 'NO_EVENTS_IN_WINDOW' | 'RPC_UNAVAILABLE' | 'INVALID_PAIR'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const inventory = await loadTierPairInventory()
  const universe = [...inventory.tier1, ...inventory.tier2]
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const rows: Array<{
    slug: string
    pairAddress: string
    token0: string
    token1: string
    tier: string
    status: TierPairStatus
    volume24hQuote: number
    tradeCount24h: number
    priceChange24h?: number
    candleCount: number
    eventCount24h: number
    indexingLag?: number
  }> = []

  for (const watch of universe) {
    const slug =
      watch.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()
        ? FEATURED_PAIR_SLUG
        : slugFromPairAddress(watch.pairAddress, watch.token0, watch.token1)
    try {
      const storage = resolveIndexerStorageForSlug(slug)
      const [health, candles, events] = await Promise.all([
        storage.loadHealth(),
        storage.listCandles(watch.pairAddress, '1H', 48),
        storage.listEvents({ pairAddress: watch.pairAddress, limit: 500 }),
      ])

      const recentEvents = events.filter((e) => e.blockTimestamp >= cutoff)
      const recentCandles = candles.filter((c) => c.bucketTimestamp >= cutoff)
      const windowCandles = recentCandles.length >= 2 ? recentCandles : candles.slice(-24)

      const volume24hQuote = windowCandles.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
      const tradeCount24h =
        recentEvents.filter((e) => e.eventType === 'Swap').length ||
        windowCandles.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)

      let priceChange24h: number | undefined
      if (windowCandles.length >= 2) {
        const open = windowCandles[0]?.open
        const close = windowCandles[windowCandles.length - 1]?.close
        if (open != null && close != null && open > 0) {
          priceChange24h = ((close - open) / open) * 100
        }
      }

      const hasSignal = volume24hQuote > 0 || tradeCount24h > 0 || windowCandles.length >= 2
      const status: TierPairStatus = hasSignal
        ? 'READY'
        : health?.status === 'ready' || health?.status === 'syncing'
          ? 'NO_EVENTS_IN_WINDOW'
          : 'RPC_UNAVAILABLE'

      rows.push({
        slug,
        pairAddress: watch.pairAddress,
        token0: watch.token0,
        token1: watch.token1,
        tier: watch.tier,
        status,
        volume24hQuote,
        tradeCount24h,
        priceChange24h,
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
        tradeCount24h: 0,
        candleCount: 0,
        eventCount24h: 0,
      })
    }
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    tier1Count: inventory.tier1.length,
    tier2Count: inventory.tier2.length,
    rows,
  })
}

export default handler
