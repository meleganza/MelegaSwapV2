import type { NextApiHandler } from 'next'
import { getProgramDetail, resolveLbProgramStore } from 'lib/liquidity-builder-indexer'

/**
 * GET /api/liquidity-program/:address
 * Program detail + indexed event ledger for deep-link / portfolio.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const raw = req.query.address
  const address = Array.isArray(raw) ? raw[0] : raw
  if (!address) {
    return res.status(400).json({ ok: false, reason: 'ADDRESS_REQUIRED' })
  }

  const store = resolveLbProgramStore()
  const result = await getProgramDetail(store, address)
  if (!result.ok) {
    const status = result.reason === 'PROGRAM_NOT_FOUND' ? 404 : 400
    return res.status(status).json({ ok: false, reason: result.reason })
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).json({
    ok: true,
    schema: 'melega.dex.v1.lb-program-detail',
    program: result.program,
    events: result.events,
    deepLink: `/liquidity-studio?view=building&program=${result.program.programAddress}`,
  })
}

export default handler
