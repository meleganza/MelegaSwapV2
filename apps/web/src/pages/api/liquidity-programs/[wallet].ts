import type { NextApiHandler } from 'next'
import { listProgramsForOwner, resolveLbProgramStore } from 'lib/liquidity-builder-indexer'

/**
 * GET /api/liquidity-programs/:wallet
 * Owner inventory of indexed Liquidity Builder programs.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const raw = req.query.wallet
  const wallet = Array.isArray(raw) ? raw[0] : raw
  if (!wallet) {
    return res.status(400).json({ ok: false, reason: 'WALLET_REQUIRED' })
  }

  const store = resolveLbProgramStore()
  const result = await listProgramsForOwner(store, wallet)
  if (!result.ok) {
    return res.status(400).json({ ok: false, reason: result.reason })
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).json({
    ok: true,
    schema: 'melega.dex.v1.lb-owner-programs',
    wallet: result.wallet,
    count: result.programs.length,
    programs: result.programs,
  })
}

export default handler
