import type { NextApiHandler } from 'next'
import { FEATURED_PAIR_SLUG, MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { resolveIndexerStorage, resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { blobPathForSlug } from 'lib/bsc-indexer/v2/paths'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const featured = resolveIndexerStorage()
  const featuredHealth = await featured.loadHealth()
  const featuredCheckpoint = await featured.loadCheckpoint()
  const featuredEvents = await featured.listEvents({ limit: 5 })
  const featuredCandles = await featured.listCandles(MARCO_WBNB_PAIR_BSC, '1H', 5)
  const swapsViaStorage = await featured.listEvents({ limit: 5, eventTypes: ['Swap'] })

  const consistent = featuredEvents.length === swapsViaStorage.length

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    canonicalNamespace: blobPathForSlug(FEATURED_PAIR_SLUG),
    featuredPairSlug: FEATURED_PAIR_SLUG,
    consumers: {
      events: {
        namespace: blobPathForSlug(FEATURED_PAIR_SLUG),
        eventSample: featuredEvents.length,
        checkpoint: featuredCheckpoint?.lastIndexedBlock,
      },
      candles: {
        namespace: blobPathForSlug(FEATURED_PAIR_SLUG),
        candleSample: featuredCandles.length,
      },
      runtimeSwaps: {
        namespace: blobPathForSlug(FEATURED_PAIR_SLUG),
        transactionSample: swapsViaStorage.length,
      },
      health: {
        lastIndexedBlock: featuredHealth?.lastIndexedBlock,
        forwardCursor: featuredCheckpoint?.forwardCursor,
        backwardCursor: featuredCheckpoint?.backwardCursor,
        phase: featuredCheckpoint?.phase,
      },
    },
    consistent,
    legacyNote: 'bsc-indexer/* is not an active read source — v2 featured-pairs namespace is canonical',
  })
}

export default handler
