import type { NextApiHandler } from 'next'
import { listProtocolActivityEvents } from 'lib/bsc-indexer/indexer/protocolActivitySync'

const PRODUCTION_ACTIVITY = 'https://www.melega.finance/api/protocol/activity'

async function fetchProductionActivity(limit: number): Promise<unknown[] | null> {
  try {
    const res = await fetch(`${PRODUCTION_ACTIVITY}?limit=${limit}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { events?: unknown[] }
    if (!Array.isArray(json.events) || json.events.length === 0) return null
    return json.events
  } catch {
    return null
  }
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const limit = Number(req.query.limit ?? 20)
  const resolvedLimit = Number.isFinite(limit) ? limit : 20
  let events = await listProtocolActivityEvents(resolvedLimit)
  let source: 'local' | 'production-fallback' = 'local'
  if (!events.length) {
    const remote = await fetchProductionActivity(resolvedLimit)
    if (remote) {
      events = remote as typeof events
      source = 'production-fallback'
    }
  }
  return res.status(200).json({ status: 'ready', events, count: events.length, source })
}

export default handler
