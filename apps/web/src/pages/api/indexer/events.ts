import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'

const PRODUCTION_EVENTS = 'https://www.melega.finance/api/indexer/events'

/** When local blob/fs store is empty, mirror production Factory/Router Swap feed (read-only). */
async function fetchProductionEvents(query: URLSearchParams): Promise<{ events: unknown[]; meta?: unknown } | null> {
  try {
    const url = `${PRODUCTION_EVENTS}?${query.toString()}`
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    const json = (await res.json()) as { events?: unknown[]; meta?: unknown }
    if (!Array.isArray(json.events) || json.events.length === 0) return null
    return { events: json.events, meta: json.meta }
  } catch {
    return null
  }
}

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

  const [localEvents, health, eventCounts] = await Promise.all([
    storage.listEvents({ pairAddress: pair, limit, offset, eventTypes: types }),
    storage.loadHealth(),
    storage.countEvents(),
  ])

  let events = localEvents
  let storageBackend = storage.backend
  let productionMeta: unknown

  if (events.length === 0) {
    const qs = new URLSearchParams()
    if (pair) qs.set('pair', pair)
    qs.set('limit', String(limit))
    if (offset) qs.set('offset', String(offset))
    if (types?.length) qs.set('types', types.join(','))
    const remote = await fetchProductionEvents(qs)
    if (remote) {
      events = remote.events as typeof localEvents
      storageBackend = 'production-fallback'
      productionMeta = remote.meta
    }
  }

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
      storageBackend,
      lastIndexedBlock: health?.lastIndexedBlock,
      indexingLag: health?.indexingLag,
      eventCounts,
      productionFallback: storageBackend === 'production-fallback' ? productionMeta : undefined,
    },
  })
}

export default handler
