import { canAcceptMCreditsPayment, VISIBILITY_RUNTIME } from 'lib/monetization/visibilityRuntime'
import type { NextApiHandler } from 'next'
import { getMCreditsOrder, MCreditsGatewayError, spendMCreditsForBoost } from 'lib/mcredits/checkout'
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
  if (req.method === 'GET') {
    const orderId = String(req.query.orderId || '').trim()
    if (!orderId) return res.status(400).json({ error: 'ORDER_ID_REQUIRED' })
    const order = getMCreditsOrder(orderId)
    if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })
    return res.status(200).json({
      order: {
        orderId: order.orderId,
        state: order.state,
        serviceId: order.serviceId,
        packageId: order.packageId,
      },
      payment_id: null,
      approval_url: null,
    })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const projectId = String(body.projectId || '').trim()
  const buyerWallet = String(body.buyerWallet || '').trim()
  if (!VISIBILITY_RUNTIME.M_CREDITS.live) return res.status(409).json({ error: 'PAYMENT_ACTIVATION_PENDING' })
  const serviceId = String(body.serviceId || '') as MarcoPayOrder['serviceId']
  if (!projectId || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
    return res.status(400).json({ error: 'PROJECT_AND_WALLET_REQUIRED' })
  }
  if (!SERVICES.has(serviceId)) return res.status(400).json({ error: 'SERVICE_UNSUPPORTED' })
  if (!VISIBILITY_RUNTIME[serviceId]?.live || !canAcceptMCreditsPayment(serviceId)) {
    return res.status(409).json({ error: 'SERVICE_ACTIVATION_PENDING' })
  }
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
      identityToken: identityToken || body.identityToken || null,
    })
    return res.status(order.state === 'FULFILLED' ? 201 : 409).json({
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
    const status =
      code === 'MCREDITS_IDENTITY_REQUIRED' ? 401 : code === 'SERVICE_NOT_FULFILLABLE' ? 409 : 503
    return res.status(status).json({
      error: code,
      message: cause instanceof Error ? cause.message : 'M-Credits are temporarily unavailable.',
      payment_id: null,
      approval_url: null,
    })
  }
}

export default handler
