import type { NextApiHandler } from 'next'
import { assessLiquidityBuildingRuntimeHealth } from 'lib/liquidity-building-runtime'

/**
 * GET /api/liquidity-building/health
 * Machine-readable LB009 runtime health. Never reports READY while blockers remain.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }
  const report = assessLiquidityBuildingRuntimeHealth()
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).json({ ok: true, ...report })
}

export default handler
