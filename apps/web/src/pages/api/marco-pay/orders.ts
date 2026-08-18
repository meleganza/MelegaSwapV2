import type { NextApiHandler } from 'next'
import { getMarcoPayApplicationRef, getMarcoPayMerchantApiKey } from 'lib/marco-pay/contract'
import { resolveMarcoPayWebhookSecret } from 'lib/marco-pay/connectionGrant'
import { createMarcoPayPaymentSession, MarcoPayGatewayError, quoteMarcoPayConversion } from 'lib/marco-pay/gateway'
import { assertMarcoPaySettlementWallet, MARCO_PAY_SETTLEMENT_WALLET } from 'lib/marco-pay/settlement'
import {
  createMarcoPayOrder,
  hydrateMarcoPayOrder,
  marcoPayStorageReady,
  reconcileMarcoPayOrder,
  updateMarcoPayOrder,
  type MarcoPayOrder,
} from 'lib/marco-pay/orders'
import { resolveMarcoPayReadiness } from 'lib/marco-pay/readiness'
import { buildMarcoPayWalletTransfer } from 'lib/marco-pay/walletTransfer'

const SERVICES = new Set<MarcoPayOrder['serviceId']>([
  'featured',
  'trend-boost',
  'sponsored-research',
  'featured-farm',
  'featured-pool',
])

const OPEN_STATES = new Set([
  'CREATED',
  'AWAITING_WALLET',
  'SUBMITTED',
  'ONCHAIN_PENDING',
  'PAYMENT_CONFIRMED',
  'ACTIVATING',
])

function publicOrder(order: MarcoPayOrder) {
  return {
    orderId: order.orderId,
    state: order.state,
    serviceId: order.serviceId,
    packageId: order.packageId,
    projectId: order.projectId,
    projectSlug: order.projectSlug,
    durationMs: order.durationMs,
    receiptRef: order.receiptRef,
    paymentRef: order.paymentRef,
    payment_id: order.paymentRef,
    paymentId: order.paymentRef,
    approval_url: order.approvalUrl,
    approvalUrl: order.approvalUrl,
    testMode: order.testMode,
    activatedAt: order.activatedAt,
    lastError: order.lastError,
    marcoAmountMinor: order.marcoAmountMinor,
    destinationWallet: order.destinationWallet,
    chainId: order.chainId,
  }
}

function walletPayload(order: MarcoPayOrder) {
  if (!order.marcoAmountMinor) return null
  try {
    return buildMarcoPayWalletTransfer({
      marcoAmountMinor: order.marcoAmountMinor,
      destinationWallet: order.destinationWallet || MARCO_PAY_SETTLEMENT_WALLET,
      chainId: order.chainId ?? 56,
    })
  } catch {
    return null
  }
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method === 'GET') {
    const orderId = String(req.query.orderId || '').trim()
    if (!orderId) return res.status(400).json({ error: 'ORDER_ID_REQUIRED' })
    let order = await hydrateMarcoPayOrder(orderId)
    if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })
    if (OPEN_STATES.has(order.state) && order.paymentRef) {
      const updatedAt = Date.parse(order.updatedAt)
      if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > 8_000) {
        try {
          order = (await reconcileMarcoPayOrder(order.orderId)) ?? order
        } catch {
          /* keep current order; webhook remains authoritative */
        }
      }
    }
    return res.status(200).json({
      payment_id: order.paymentRef,
      approval_url: order.approvalUrl,
      wallet: walletPayload(order),
      order: publicOrder(order),
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
    const existingOrderId = body.orderId ? String(body.orderId).trim() : ''
    const existing = existingOrderId ? await hydrateMarcoPayOrder(existingOrderId) : null
    const order =
      existing &&
      existing.buyerWallet === buyerWallet.toLowerCase() &&
      existing.serviceId === serviceId &&
      OPEN_STATES.has(existing.state)
        ? existing
        : await createMarcoPayOrder({
            applicationRef,
            projectId,
            projectSlug: body.projectSlug ? String(body.projectSlug) : null,
            projectContract: body.projectContract ? String(body.projectContract) : null,
            buyerWallet,
            serviceId,
            packageId: body.packageId ? String(body.packageId) : null,
            targetId,
          })
    const secret = await resolveMarcoPayWebhookSecret()
    const merchantApiKey = getMarcoPayMerchantApiKey()
    if (!secret || !merchantApiKey) {
      return res.status(503).json({ error: 'MARCO_PAY_UNAVAILABLE', message: 'MARCO Pay signing secret is not configured.' })
    }
    try {
      assertMarcoPaySettlementWallet()
    } catch {
      return res.status(503).json({ error: 'SETTLEMENT_WALLET_INVALID', message: 'MARCO Pay is temporarily unavailable.' })
    }
    let bound = order
    let quote = {
      reference_amount_minor: order.referenceAmountMinor,
      reference_currency: order.referenceCurrency,
      marco_amount_minor: order.marcoAmountMinor,
      destination: order.destinationWallet,
      chain_id: order.chainId,
    }
    if (!order.paymentRef || !order.approvalUrl || !order.marcoAmountMinor) {
      try {
        await quoteMarcoPayConversion({
          applicationRef,
          amountMinor: order.referenceAmountMinor,
          currency: order.referenceCurrency,
          item: order.serviceId,
        })
        const session = await createMarcoPayPaymentSession({
          applicationRef,
          merchantOrderRef: order.orderId,
          amountMinor: order.referenceAmountMinor,
          currency: order.referenceCurrency,
          item: order.serviceId,
          secret,
          merchantApiKey,
        })
        quote = {
          reference_amount_minor: order.referenceAmountMinor,
          reference_currency: order.referenceCurrency,
          marco_amount_minor: session.marcoAmountMinor,
          destination: session.destinationWallet,
          chain_id: session.chainId,
        }
        bound =
          (await updateMarcoPayOrder(order.orderId, {
            state: 'AWAITING_WALLET',
            paymentRef: session.paymentId,
            intentRef: session.intentId,
            approvalUrl: session.approvalUrl,
            marcoAmountMinor: session.marcoAmountMinor,
            destinationWallet: session.destinationWallet,
            chainId: session.chainId ?? 56,
          })) ?? order
      } catch (cause) {
        const code = cause instanceof MarcoPayGatewayError ? cause.code : 'MARCO_PAY_INTENT_UNAVAILABLE'
        const message = cause instanceof Error ? cause.message : 'MARCO Pay could not create this payment.'
        return res.status(503).json({ error: code, message })
      }
    }
    if (!bound.paymentRef || !bound.approvalUrl) {
      return res.status(503).json({ error: 'MARCO_PAY_INTENT_UNAVAILABLE', message: 'MARCO Pay did not return a payment session.' })
    }
    const wallet = walletPayload(bound)
    if (!wallet) {
      return res.status(503).json({ error: 'WALLET_TRANSFER_UNAVAILABLE', message: 'MARCO Pay is temporarily unavailable.' })
    }
    return res.status(201).json({
      payment_id: bound.paymentRef,
      approval_url: bound.approvalUrl,
      quote,
      wallet,
      order: {
        ...publicOrder(bound),
        referenceCurrency: bound.referenceCurrency,
        referenceAmountMinor: bound.referenceAmountMinor,
        productRef: bound.productRef,
      },
      widget: {
        application: bound.applicationRef,
        amount: bound.referenceAmountMinor,
        currency: bound.referenceCurrency,
        product: bound.productRef,
        reference: bound.orderId,
        payment_id: bound.paymentRef,
        paymentId: bound.paymentRef,
        approval_url: bound.approvalUrl,
        approvalUrl: bound.approvalUrl,
      },
    })
  } catch (cause) {
    return res.status(400).json({ error: cause instanceof Error ? cause.message : 'ORDER_CREATE_FAILED' })
  }
}

export default handler
