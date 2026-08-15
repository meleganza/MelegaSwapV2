import type { NextApiHandler } from 'next'
import { getMarcoPayApplicationRef } from 'lib/marco-pay/contract'
import {
  createMarcoPayOrder,
  hydrateMarcoPayOrder,
  marcoPayStorageReady,
  type MarcoPayOrder,
} from 'lib/marco-pay/orders'
import { resolveMarcoPayReadiness } from 'lib/marco-pay/readiness'

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
    const order = await hydrateMarcoPayOrder(orderId)
    if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })
    return res.status(200).json({
      order: {
        orderId: order.orderId,
        state: order.state,
        receiptRef: order.receiptRef,
        paymentRef: order.paymentRef,
        testMode: order.testMode,
        activatedAt: order.activatedAt,
        lastError: order.lastError,
      },
    })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!marcoPayStorageReady()) return res.status(503).json({ error: 'ORDER_STORAGE_UNAVAILABLE' })
  const readiness = await resolveMarcoPayReadiness()
  if (!readiness.executable) {
    return res.status(503).json({ error: 'MARCO_PAY_UNAVAILABLE', message: readiness.reason })
  }
  const applicationRef = getMarcoPayApplicationRef()
  if (!applicationRef) return res.status(503).json({ error: 'MARCO_PAY_UNAVAILABLE' })
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const projectId = String(body.projectId || '').trim()
  const buyerWallet = String(body.buyerWallet || '').trim()
  const serviceId = String(body.serviceId || '') as MarcoPayOrder['serviceId']
  const targetId = body.targetId ? String(body.targetId).trim() : null
  if (!projectId || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
    return res.status(400).json({ error: 'PROJECT_AND_WALLET_REQUIRED' })
  }
  if (!SERVICES.has(serviceId)) return res.status(400).json({ error: 'SERVICE_UNSUPPORTED' })
  if ((serviceId === 'featured-farm' || serviceId === 'featured-pool') && !targetId) {
    return res.status(400).json({ error: 'TARGET_REQUIRED' })
  }
  try {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId,
      projectSlug: body.projectSlug ? String(body.projectSlug) : null,
      projectContract: body.projectContract ? String(body.projectContract) : null,
      buyerWallet,
      serviceId,
      packageId: body.packageId ? String(body.packageId) : null,
      targetId,
    })
    return res.status(201).json({
      order: {
        orderId: order.orderId,
        referenceCurrency: order.referenceCurrency,
        referenceAmountMinor: order.referenceAmountMinor,
        productRef: order.productRef,
        state: order.state,
      },
      widget: {
        application: order.applicationRef,
        amount: order.referenceAmountMinor,
        currency: order.referenceCurrency,
        reference: order.orderId,
      },
    })
  } catch (cause) {
    return res.status(400).json({ error: cause instanceof Error ? cause.message : 'ORDER_CREATE_FAILED' })
  }
}

export default handler
