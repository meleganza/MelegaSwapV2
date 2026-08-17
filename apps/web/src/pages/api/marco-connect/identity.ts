import type { NextApiHandler } from 'next'
import { evaluateMarcoConnectIdentityClaim, publicMarcoConnectStatus } from 'lib/marco-connect/identity'

const handler: NextApiHandler = (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method === 'GET') {
    return res.status(200).json(publicMarcoConnectStatus())
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  let body: Record<string, unknown> = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    body = {}
  }
  const decision = evaluateMarcoConnectIdentityClaim(body)
  return res.status(401).json({
    linked: false,
    error: decision.error,
    ...publicMarcoConnectStatus(),
  })
}

export default handler
