import type { NextApiHandler } from 'next'
import { resolveIndexerStorage, resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { resolveSlugFromQuery } from 'lib/bsc-indexer/v2/pairSlug'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { NormalizedIndexerEvent } from 'lib/bsc-indexer/types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pair = typeof req.query.pair === 'string' ? req.query.pair.toLowerCase() : undefined
  const slugParam = typeof req.query.slug === 'string' ? req.query.slug : undefined
  const token0 = typeof req.query.token0 === 'string' ? req.query.token0 : undefined
  const token1 = typeof req.query.token1 === 'string' ? req.query.token1 : undefined
  // Cap raised so Top Movers can consume enough Swap observations for factual % change.
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 30))
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const types = typeof req.query.types === 'string' ? req.query.types.split(',') : undefined

  let events: NormalizedIndexerEvent[] = []
  let storageBackend = 'unknown'
  let health: Awaited<ReturnType<ReturnType<typeof resolveIndexerStorage>['loadHealth']>> = null
  let eventCounts: Record<string, number> | undefined

  if (pair || slugParam) {
    const slug = resolveSlugFromQuery(slugParam, pair ?? MARCO_WBNB_PAIR_BSC, token0, token1)
    const storage =
      slug === FEATURED_PAIR_SLUG
        ? resolveIndexerStorage()
        : resolveIndexerStorageForSlug(slug)
    storageBackend = storage.backend
    const [listed, h, counts] = await Promise.all([
      storage.listEvents({ pairAddress: pair, limit, offset, eventTypes: types }),
      storage.loadHealth(),
      storage.countEvents(),
    ])
    events = listed
    health = h
    eventCounts = counts
  } else {
    // Aggregate Tier-1 + Tier-2 slug stores so Top Movers can observe non-MARCO swaps.
    const inventory = await loadTierPairInventory()
    const watches = [...inventory.tier1, ...inventory.tier2]
    const perSlug = Math.max(20, Math.ceil(limit / Math.max(1, watches.length)))
    const merged: NormalizedIndexerEvent[] = []
    const countAgg: Record<string, number> = {}

    const featured = resolveIndexerStorage()
    storageBackend = `tier-aggregate:${featured.backend}`
    health = await featured.loadHealth()

    await Promise.all(
      watches.map(async (w) => {
        try {
          const storage =
            w.slug === FEATURED_PAIR_SLUG
              ? resolveIndexerStorage()
              : resolveIndexerStorageForSlug(w.slug)
          const [listed, counts] = await Promise.all([
            storage.listEvents({
              pairAddress: w.pairAddress,
              limit: perSlug,
              offset: 0,
              eventTypes: types,
            }),
            storage.countEvents(),
          ])
          merged.push(...listed)
          for (const [k, v] of Object.entries(counts ?? {})) {
            countAgg[k] = (countAgg[k] ?? 0) + (typeof v === 'number' ? v : 0)
          }
        } catch {
          /* skip unavailable slug stores */
        }
      }),
    )

    merged.sort((a, b) => (Number(b.blockTimestamp) || 0) - (Number(a.blockTimestamp) || 0))
    events = merged.slice(offset, offset + limit)
    eventCounts = countAgg
  }

  const status = events.length > 0 ? 'ready' : health?.status === 'ready' ? 'empty' : 'unavailable'

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    status,
    reason:
      status === 'unavailable'
        ? health?.lastFailureReason ??
          'Indexer event store not populated — run /api/indexer/run or configure BLOB_READ_WRITE_TOKEN'
        : status === 'empty'
          ? 'Scan completed; no events in store for query'
          : undefined,
    events,
    meta: {
      storageBackend,
      lastIndexedBlock: health?.lastIndexedBlock,
      indexingLag: health?.indexingLag,
      eventCounts,
      aggregated: !(pair || slugParam),
    },
  })
}

export default handler
