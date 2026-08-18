import type { NextApiHandler } from 'next'
import { MCreditsGatewayError, spendMCreditsForBoost } from 'lib/mcredits/checkout'
import type { MarcoPayOrder } from 'lib/marco-pay/orders'

const SERVICES = new Set<MarcoPayOrder['serviceId']>([
  'featured',
  'trend-boost',
  'sponsored-research',
  'featured-farm',
  'featured-pool',
])

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const projectId = String(body.projectId || '').trim()
  const buyerWallet = String(body.buyerWallet || '').trim()
  const serviceId = String(body.serviceId || '') as MarcoPayOrder['serviceId']
  if (!projectId || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
    return res.status(400).json({ error: 'PROJECT_AND_WALLET_REQUIRED' })
  }
  if (!SERVICES.has(serviceId)) return res.status(400).json({ error: 'SERVICE_UNSUPPORTED' })
  const identityHeader = req.headers['x-marco-passport-session']
  const identityToken = Array.isArray(identityHeader) ? identityHeader[0] : identityHeader
  try {
    const order = await spendMCreditsForBoost({
      projectId,
      projectSlug: body.projectSlug ? String(body.projectSlug) : null,
      projectContract: body.projectContract ? String(body.projectContract) : null,
      buyerWallet,
      serviceId,
      packageId: body.packageId ? String(body.packageId) : null,
      targetId: body.targetId ? String(body.targetId) : null,
      identityToken: identityToken || null,
    })
    return res.status(201).json({
      order: {
        orderId: order.orderId,
        state: order.state,
        serviceId: order.serviceId,
        packageId: order.packageId,
      },
      payment_id: null,
      approval_url: null,
    })
  } catch (cause) {
    const code = cause instanceof MCreditsGatewayError ? cause.code : 'MCREDITS_UNAVAILABLE'
    const status = code === 'MCREDITS_IDENTITY_REQUIRED' ? 401 : 503
    return res.status(status).json({
      error: code,
      message: cause instanceof Error ? cause.message : 'M-Credits are temporarily unavailable.',
      payment_id: null,
      approval_url: null,
    })
  }
}

export default handler
