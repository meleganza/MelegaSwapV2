import type { NextApiHandler } from 'next'
import { syncLbProgramInventory } from 'lib/liquidity-builder-indexer'

/**
 * POST/GET /api/indexer/liquidity-building/run
 * Operator/cron entry to advance LB program inventory sync.
 */
function authorized(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.INDEXER_CRON_SECRET?.trim()
  const auth = req.headers.authorization
  const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (secret && bearer && bearer === secret) return true
  if (req.headers['x-vercel-cron'] === '1') return true
  if (process.env.NODE_ENV !== 'production' && !secret) return true
  return false
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }
  if (!authorized(req)) {
    return res.status(401).json({ ok: false, reason: 'UNAUTHORIZED' })
  }

  const report = await syncLbProgramInventory()
  res.setHeader('Cache-Control', 'no-store')
  return res.status(report.ok ? 200 : 503).json({ ok: report.ok, ...report })
}

export default handler
