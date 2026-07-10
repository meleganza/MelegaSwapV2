import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const storage = resolveIndexerStorage()
  const pair = typeof req.query.pair === 'string' ? req.query.pair : undefined
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30))
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const types = typeof req.query.types === 'string' ? req.query.types.split(',') : undefined

  const [events, health, eventCounts] = await Promise.all([
    storage.listEvents({ pairAddress: pair, limit, offset, eventTypes: types }),
    storage.loadHealth(),
    storage.countEvents(),
  ])

  const status = events.length > 0 ? 'ready' : health?.status === 'ready' ? 'empty' : 'unavailable'

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    status,
    reason:
      status === 'unavailable'
        ? health?.lastFailureReason ?? 'Indexer event store not populated — run /api/indexer/run or configure BLOB_READ_WRITE_TOKEN'
        : status === 'empty'
          ? 'Scan completed; no events in store for query'
          : undefined,
    events,
    meta: {
      storageBackend: storage.backend,
      lastIndexedBlock: health?.lastIndexedBlock,
      indexingLag: health?.indexingLag,
      eventCounts,
    },
  })
}

export default handler
