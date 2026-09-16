import { VISIBILITY_RUNTIME, isMCreditsFulfillableService } from 'lib/monetization/visibilityRuntime'
import type { NextApiHandler } from 'next'
import {
  MCreditsGatewayError,
  prepareMCreditsOrder,
  quoteMCreditsBalance,
  spendMCreditsForBoost,
} from 'lib/mcredits/checkout'
import type { MarcoPayOrder } from 'lib/marco-pay/orders'

const SERVICES = new Set<MarcoPayOrder['serviceId']>(['featured', 'trend-boost'])

function publicOrder(order: { orderId: string; state: string; serviceId: string; packageId: string; referenceAmountMinor: string }) {
  return {
    orderId: order.orderId,
    state: order.state,
    serviceId: order.serviceId,
    packageId: order.packageId,
    referenceAmountMinor: order.referenceAmountMinor,
    requiredMCredits: (Number(order.referenceAmountMinor) / 100).toFixed(2),
  }
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
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
  if (!SERVICES.has(serviceId) || !isMCreditsFulfillableService(serviceId)) {
    return res.status(400).json({ error: 'SERVICE_UNSUPPORTED' })
  }
  if (!VISIBILITY_RUNTIME[serviceId]?.live) return res.status(409).json({ error: 'SERVICE_ACTIVATION_PENDING' })
  const identityHeader = req.headers['x-marco-passport-session']
  const identityToken = Array.isArray(identityHeader) ? identityHeader[0] : identityHeader
  const authorization = body.mcreditsAuthorization ? String(body.mcreditsAuthorization) : identityToken || null
  const action = String(body.action || 'spend')
  const shared = {
    projectId,
    projectSlug: body.projectSlug ? String(body.projectSlug) : null,
    projectContract: body.projectContract ? String(body.projectContract) : null,
    buyerWallet,
    serviceId,
    packageId: body.packageId ? String(body.packageId) : null,
    targetId: body.targetId ? String(body.targetId) : null,
    existingOrderId: body.orderId ? String(body.orderId) : null,
    identityToken: authorization,
    mcreditsAuthorization: authorization,
  }
  try {
    if (action === 'prepare' || action === 'quote') {
      const quoted = await quoteMCreditsBalance(shared)
      return res.status(200).json({
        order: publicOrder(quoted.order),
        requiredAmountMinor: quoted.order.referenceAmountMinor,
        requiredMCredits: (Number(quoted.order.referenceAmountMinor) / 100).toFixed(2),
        availableMinor: quoted.availableMinor,
        insufficient: quoted.insufficient,
        payment_id: null,
        approval_url: null,
      })
    }
    const order = await spendMCreditsForBoost(shared)
    return res.status(201).json({
      order: publicOrder(order),
      payment_id: null,
      approval_url: null,
    })
  } catch (cause) {
    const code = cause instanceof MCreditsGatewayError ? cause.code : 'MCREDITS_UNAVAILABLE'
    const status =
      code === 'MCREDITS_IDENTITY_REQUIRED' ? 401 : code === 'INSUFFICIENT_BALANCE' || /INSUFFICIENT/.test(code) ? 409 : 503
    return res.status(status).json({
      error: code,
      message: cause instanceof Error ? cause.message : 'M-Credits are temporarily unavailable.',
      payment_id: null,
      approval_url: null,
    })
  }
}

export default handler
