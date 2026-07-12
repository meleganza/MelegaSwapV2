import type { NextApiHandler } from 'next'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'

import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'

const SECONDS_24H = 86_400

export type TierPairStatus =
  | 'READY'
  | 'NO_EVENTS_IN_WINDOW'
  | 'EMPTY_VERIFIED'
  | 'UNSCANNED'
  | 'RPC_UNAVAILABLE'
  | 'INVALID_PAIR'

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
      const [health, checkpoint, candles, events] = await Promise.all([
        storage.loadHealth(),
        storage.loadCheckpoint(),
        storage.listCandles(watch.pairAddress, '1H', 48),
        storage.listEvents({ pairAddress: watch.pairAddress, limit: 500 }),
      ])

      const recentEvents = events.filter((e) => e.blockTimestamp >= cutoff)
      const recentCandles = candles.filter((c) => c.bucketTimestamp >= cutoff)
      const volume24hQuote = recentCandles.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
      const tradeCount24h =
        recentEvents.filter((e) => e.eventType === 'Swap').length ||
        recentCandles.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)

      const changeResult = computeValid24hPriceChange(candles)
      const priceChange24h = changeResult?.pct

      const hasSignal =
        volume24hQuote > 0 || tradeCount24h > 0 || changeResult != null || recentCandles.length >= 2

      const scanned = Boolean(checkpoint || health?.lastSuccessfulSync)
      const rpcFailure =
        health?.status === 'error' &&
        Boolean(health?.lastFailureReason?.toLowerCase().includes('rpc'))

      let status: TierPairStatus
      if (hasSignal) {
        status = 'READY'
      } else if (!scanned) {
        status = 'UNSCANNED'
      } else if (rpcFailure) {
        status = 'RPC_UNAVAILABLE'
      } else if (health?.status === 'ready' || health?.status === 'syncing' || checkpoint) {
        status = 'EMPTY_VERIFIED'
      } else {
        status = 'NO_EVENTS_IN_WINDOW'
      }

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
