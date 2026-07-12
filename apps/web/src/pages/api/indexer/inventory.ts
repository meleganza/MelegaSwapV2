import type { NextApiHandler } from 'next'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { FEATURED_PAIR_SLUG, MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const inventory = await loadTierPairInventory()
  const chainHead = await getBlockNumber()
  const pairs = [...inventory.tier1, ...inventory.tier2]

  const rows = await Promise.all(
    pairs.map(async (watch) => {
      const slug =
        watch.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()
          ? FEATURED_PAIR_SLUG
          : slugFromPairAddress(watch.pairAddress, watch.token0, watch.token1)
      const storage = resolveIndexerStorageForSlug(slug)
      const [checkpoint, health, events, candles] = await Promise.all([
        storage.loadCheckpoint(),
        storage.loadHealth(),
        storage.listEvents({ pairAddress: watch.pairAddress, limit: 200 }),
        storage.listCandles(watch.pairAddress, '1H', 48),
      ])
      const swapCount = events.filter((e) => e.eventType === 'Swap').length
      const mintCount = events.filter((e) => e.eventType === 'Mint').length
      const burnCount = events.filter((e) => e.eventType === 'Burn').length
      const cutoff = Math.floor(Date.now() / 1000) - 86_400
      const recentSwaps = events.filter((e) => e.eventType === 'Swap' && e.blockTimestamp >= cutoff)
      const volume24h = candles
        .filter((c) => c.bucketTimestamp >= cutoff)
        .reduce((s, c) => s + (c.quoteVolume ?? 0), 0)

      return {
        slug,
        tier: watch.tier,
        pairAddress: watch.pairAddress,
        token0: watch.token0,
        token1: watch.token1,
        checkpoint: checkpoint?.lastIndexedBlock ?? null,
        forwardCursor: checkpoint?.forwardCursor ?? null,
        backwardCursor: checkpoint?.backwardCursor ?? null,
        phase: checkpoint?.phase ?? 'unknown',
        chainHead,
        lag: health?.indexingLag ?? (checkpoint ? chainHead - (checkpoint.forwardCursor ?? checkpoint.lastIndexedBlock) : null),
        bootstrapDirection: 'forward-priority-dual-cursor',
        lastSuccessfulSync: health?.lastSuccessfulSync ?? checkpoint?.lastSuccessfulSync,
        swapCount,
        mintCount,
        burnCount,
        candleCount1H: candles.length,
        volume24h,
        tradeCount24h: recentSwaps.length,
        failureReason: health?.lastFailureReason ?? checkpoint?.lastFailureReason ?? null,
        namespace: `melega-indexer/v2/featured-pairs/${slug}`,
      }
    }),
  )

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    tier1Count: inventory.tier1.length,
    tier2Count: inventory.tier2.length,
    tier3Count: inventory.tier3Count,
    pairs: rows,
  })
}

export default handler
