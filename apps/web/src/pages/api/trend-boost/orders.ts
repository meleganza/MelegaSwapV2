import type { NextApiHandler } from 'next'
import { RECOVERY_CAPABILITIES, RECOVERY_PAYMENT_UNAVAILABLE } from 'config/constants/recoveryCapabilities'
import { FEATURED_OFFER, type FeaturedPayAsset } from 'lib/featured-placement'
import {
  buildTrendBoostQuote,
  createTrendBoostOrder,
  getTrendBoostOrder,
  prepareTrendBoostPayment,
  activateVerifiedTrendBoostWindow,
  updateTrendBoostOrder,
} from 'lib/monetization/trendBoostOrders'
import { TREND_BOOST_PACKAGES } from 'lib/monetization/packages'
import { isQuoteExpired } from 'lib/featured-placement/quote'
import { verifyBscPaymentReceipt } from 'lib/monetization/verifyPaymentReceipt'

const ASSETS = new Set(FEATURED_OFFER.acceptedAssets)

async function fetchUnitPriceUsd(asset: FeaturedPayAsset): Promise<{ price: number | null; source: string }> {
  if (asset === 'USDT' || asset === 'USDC') return { price: 1, source: 'stablecoin-1usd' }
  try {
    const id = asset === 'BNB' ? 'binancecoin' : 'melega'
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const json = (await res.json()) as Record<string, { usd?: number }>
      const price = json[id]?.usd
      if (typeof price === 'number' && price > 0) return { price, source: `coingecko:${id}` }
    }
  } catch {
    /* fall through */
  }
  const envKey = asset === 'BNB' ? process.env.FEATURED_BNB_USD : process.env.FEATURED_MARCO_USD
  if (envKey && Number(envKey) > 0) return { price: Number(envKey), source: 'env-override' }
  return { price: null, source: 'unavailable' }
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({
      schema: 'melega.trend-boost.offer.v1',
      paymentActivationEnabled: RECOVERY_CAPABILITIES.commercialPaymentActivation,
      packages: TREND_BOOST_PACKAGES.map((p) => ({
        id: p.id,
        label: p.shortLabel,
        usdPrice: p.usdPrice,
        durationLabel: p.durationLabel,
        isDefault: Boolean(p.isDefault),
      })),
      acceptedAssets: FEATURED_OFFER.acceptedAssets,
      treasuryWallet: FEATURED_OFFER.treasuryWallet,
    })
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const action = String(body.action || 'create')

    if (
      !RECOVERY_CAPABILITIES.commercialPaymentActivation &&
      ['create', 'quote', 'confirm', 'confirm-receipt'].includes(action)
    ) {
      return res.status(503).json({
        error: 'PAYMENT_VERIFICATION_UNAVAILABLE',
        message: RECOVERY_PAYMENT_UNAVAILABLE,
      })
    }

    if (action === 'create') {
      const projectId = String(body.projectId || '').trim()
      const buyerWallet = String(body.buyerWallet || '').trim()
      const paymentAsset = String(body.paymentAsset || 'BNB').toUpperCase() as FeaturedPayAsset
      if (!projectId || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
        return res.status(400).json({ error: 'projectId and buyerWallet required' })
      }
      if (!ASSETS.has(paymentAsset)) return res.status(400).json({ error: 'unsupported paymentAsset' })
      const order = createTrendBoostOrder({
        projectId,
        projectSlug: body.projectSlug ? String(body.projectSlug) : null,
        projectContract: body.projectContract ? String(body.projectContract) : null,
        buyerWallet,
        paymentAsset,
        packageId: body.packageId ? String(body.packageId) : null,
      })
      return res.status(201).json({ order })
    }

    const orderId = String(body.orderId || '')
    const order = getTrendBoostOrder(orderId)
    if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })

    if (action === 'quote') {
      const asset = (body.paymentAsset || order.paymentAsset) as FeaturedPayAsset
      const { price, source } = await fetchUnitPriceUsd(asset)
      if (price == null) return res.status(503).json({ error: 'QUOTE_UNAVAILABLE', asset, source })
      try {
        const quote = buildTrendBoostQuote({
          orderId,
          paymentAsset: asset,
          unitPriceUsd: price,
          quoteSource: source,
        })
        const prepared = prepareTrendBoostPayment({
          paymentAsset: quote.paymentAsset,
          tokenAmountRaw: quote.tokenAmountRaw,
          tokenAmount: quote.tokenAmount,
          quoteExpiration: quote.quoteExpiration,
          usdReferenceAmount: quote.usdReferenceAmount,
        })
        updateTrendBoostOrder(orderId, { state: 'AWAITING_WALLET' })
        return res.status(200).json({ quote, prepared })
      } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : 'QUOTE_FAILED' })
      }
    }

    if (action === 'submit') {
      const txHash = String(body.transactionHash || '')
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return res.status(400).json({ error: 'INVALID_TX_HASH' })
      const updated = updateTrendBoostOrder(orderId, {
        state: 'SUBMITTED',
        transactionHash: txHash,
        paymentStatus: 'submitted',
      })
      return res.status(200).json({ order: updated })
    }

    if (action === 'confirm') {
      return res.status(400).json({ error: 'RECEIPT_VERIFICATION_REQUIRED' })
    }

    if (action === 'confirm-receipt') {
      const txHash = String(body.transactionHash || '')
      if (
        order.state !== 'SUBMITTED' ||
        !order.transactionHash ||
        order.transactionHash.toLowerCase() !== txHash.toLowerCase()
      ) {
        return res.status(400).json({ error: 'ORDER_NOT_SUBMITTED_OR_TX_MISMATCH' })
      }
      if (!order.tokenAmountRaw || isQuoteExpired(order.quoteExpiration)) {
        return res.status(400).json({ error: 'QUOTE_EXPIRED_OR_MISSING' })
      }
      const validation = await verifyBscPaymentReceipt({
        transactionHash: txHash,
        buyerWallet: order.buyerWallet,
        paymentAsset: order.paymentAsset,
        tokenAmountRaw: order.tokenAmountRaw,
        treasuryWallet: order.treasuryWallet,
      })
      if (!validation.ok) {
        const failed = updateTrendBoostOrder(orderId, {
          state: 'PAYMENT_FAILED',
          paymentStatus: 'failed',
          receiptVerified: false,
          lastError: validation.reason || 'RECEIPT_INVALID',
        })
        return res.status(400).json({ error: validation.reason, validation, order: failed })
      }
      updateTrendBoostOrder(orderId, {
        state: 'PAYMENT_CONFIRMED',
        paymentStatus: 'confirmed',
        receiptVerified: true,
        lastError: null,
      })
      const activated = activateVerifiedTrendBoostWindow(orderId)
      if (!activated) return res.status(409).json({ error: 'ACTIVATION_PRECONDITION_FAILED' })
      return res.status(200).json({ order: activated, validation })
    }

    if (action === 'cancel') {
      const cancelled = updateTrendBoostOrder(orderId, {
        state: 'CANCELLED',
        paymentStatus: 'cancelled',
      })
      return res.status(200).json({ order: cancelled })
    }

    return res.status(400).json({ error: 'UNKNOWN_ACTION' })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

export default handler
