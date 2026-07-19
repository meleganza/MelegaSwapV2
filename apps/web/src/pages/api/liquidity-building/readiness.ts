import type { NextApiHandler } from 'next'
import { assessLiquidityBuildingRuntimeHealth } from 'lib/liquidity-building-runtime'

/**
 * GET /api/liquidity-building/readiness
 * Alias surface for readiness probes (same report as health).
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }
  const report = assessLiquidityBuildingRuntimeHealth()
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const ready = report.status === 'READY'
  return res.status(ready ? 200 : 503).json({
    ok: ready,
    ready,
    ...report,
  })
}

export default handler
