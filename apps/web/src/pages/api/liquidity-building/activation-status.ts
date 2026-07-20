import type { NextApiHandler } from 'next'
import { loadAndConsumeActivationGates } from 'lib/liquidity-building-runtime/activationGateConsumer'

/**
 * GET /api/liquidity-building/activation-status
 * LB021 read-only activation gate consumer surface.
 * Never accepts override query params. Never reports READY while gates fail.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  // Reject any attempt to pass activation overrides via query/body.
  const q = req.query ?? {}
  if (
    'activationAuthorized' in q ||
    'override' in q ||
    'forceReady' in q ||
    'manualActivation' in q
  ) {
    return res.status(400).json({
      ok: false,
      reason: 'MANUAL_ACTIVATION_FORBIDDEN',
      productStatus: 'FAILED',
    })
  }

  const report = loadAndConsumeActivationGates()
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).json({
    ok: true,
    ...report,
  })
}

export default handler
