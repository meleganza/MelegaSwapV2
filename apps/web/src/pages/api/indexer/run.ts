import type { NextApiHandler } from 'next'
import { runIncrementalSync } from 'lib/bsc-indexer/indexer/syncIncremental'

export const config = {
  maxDuration: 300,
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET || process.env.INDEXER_CRON_SECRET
  const vercelCron = req.headers['x-vercel-cron'] === '1'

  if (!vercelCron) {
    if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized indexer run' })
    }
  }

  try {
    const result = await runIncrementalSync()
    return res.status(200).json({
      ok: true,
      addedEvents: result.addedEvents,
      checkpoint: result.checkpoint,
      health: result.health,
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  }
}

export default handler
