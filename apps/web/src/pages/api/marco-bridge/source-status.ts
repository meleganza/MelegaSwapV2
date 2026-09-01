import type { NextApiRequest, NextApiResponse } from 'next'
import { readSolanaSourceStatus } from 'lib/marco-bridge/solanaSourceStatus'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const sourceTx = typeof req.query.sourceTx === 'string' ? req.query.sourceTx : ''
    const status = await readSolanaSourceStatus(sourceTx)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ status })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Solana source status is unavailable.'
    return res.status(503).json({ error: 'SOURCE_STATUS_UNAVAILABLE', message })
  }
}
