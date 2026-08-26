import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const state = await fetchCanonicalRouteAuthority()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(state)
  } catch (cause) {
    return res.status(503).json({
      error: 'CANONICAL_ROUTE_AUTHORITY_UNAVAILABLE',
      message: cause instanceof Error ? cause.message : 'Canonical MMN route authority is unavailable.',
    })
  }
}
