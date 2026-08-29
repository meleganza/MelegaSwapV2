import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchLayerZeroTracking } from 'lib/marco-bridge/tracking'
import { MarcoBridgeError } from 'lib/marco-bridge/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const sourceTx = typeof req.query.sourceTx === 'string' ? req.query.sourceTx : ''
    if (!sourceTx) throw new MarcoBridgeError('QUOTE_FAILED', 'A source transaction hash is required.')
    const tracking = await fetchLayerZeroTracking(sourceTx)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(tracking)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Bridge tracking failed.'
    return res.status(503).json({ error: 'QUOTE_FAILED', message })
  }
}
