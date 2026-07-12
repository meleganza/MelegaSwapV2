import type { NextApiHandler } from 'next'
import { listProtocolActivityEvents } from 'lib/bsc-indexer/indexer/protocolActivitySync'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const limit = Number(req.query.limit ?? 20)
  const events = await listProtocolActivityEvents(Number.isFinite(limit) ? limit : 20)
  return res.status(200).json({ status: 'ready', events, count: events.length })
}

export default handler
