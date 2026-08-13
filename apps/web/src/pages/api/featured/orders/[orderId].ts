import type { NextApiHandler } from 'next'
import { RECOVERY_CAPABILITIES, RECOVERY_PAYMENT_UNAVAILABLE } from 'config/constants/recoveryCapabilities'
import {
  FEATURED_OFFER,
  buildFeaturedQuote,
  getFeaturedOrder,
  isQuoteExpired,
  prepareFeaturedPayment,
  scheduleFeaturedWindow,
  updateFeaturedOrder,
  type FeaturedPayAsset,
} from 'lib/featured-placement'
import { verifyBscPaymentReceipt } from 'lib/monetization/verifyPaymentReceipt'

async function fetchUnitPriceUsd(asset: FeaturedPayAsset): Promise<{ price: number | null; source: string }> {
  if (asset === 'USDT' || asset === 'USDC') return { price: 1, source: 'stablecoin-1usd' }
  const rpc = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'
  // Prefer CoinGecko simple price (factual public source); fail closed if unavailable.
  try {
    const id = asset === 'BNB' ? 'binancecoin' : 'melega'
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const json = (await res.json()) as Record<string, { usd?: number }>
      const price = json[id]?.usd
      if (typeof price === 'number' && price > 0) {
        return { price, source: `coingecko:${id}` }
      }
    }
  } catch {
    /* fall through */
  }
  // Optional env override for ops (never fabricate)
  const envKey = asset === 'BNB' ? process.env.FEATURED_BNB_USD : process.env.FEATURED_MARCO_USD
  if (envKey && Number(envKey) > 0) {
    return { price: Number(envKey), source: 'env-override' }
  }
  void rpc
  return { price: null, source: 'unavailable' }
}

const handler: NextApiHandler = async (req, res) => {
  const body =
    req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) : {}
  const action = String(body.action || '')

  if (
    req.method === 'POST' &&
    !RECOVERY_CAPABILITIES.commercialPaymentActivation &&
    ['quote', 'confirm-receipt'].includes(action)
  ) {
    return res.status(503).json({
      error: 'PAYMENT_VERIFICATION_UNAVAILABLE',
      message: RECOVERY_PAYMENT_UNAVAILABLE,
    })
  }

  const orderId = String(req.query.orderId || '')
  const order = getFeaturedOrder(orderId)
  if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' })

  if (req.method === 'GET') {
    return res.status(200).json({
      order,
      offer: {
        usdPrice: FEATURED_OFFER.usdPrice,
        durationDays: FEATURED_OFFER.durationDays,
        treasuryWallet: FEATURED_OFFER.treasuryWallet,
      },
      paymentActivationEnabled: RECOVERY_CAPABILITIES.commercialPaymentActivation,
      quoteExpired: isQuoteExpired(order.quoteExpiration),
    })
  }

  if (req.method === 'POST') {
    if (action === 'quote') {
      const asset = (body.paymentAsset || order.paymentAsset) as FeaturedPayAsset
      const { price, source } = await fetchUnitPriceUsd(asset)
      if (price == null) {
        return res.status(503).json({ error: 'QUOTE_UNAVAILABLE', asset, source })
      }
      try {
        const quote = buildFeaturedQuote({
          orderId,
          paymentAsset: asset,
          unitPriceUsd: price,
          quoteSource: source,
        })
        const prepared = prepareFeaturedPayment({
          paymentAsset: quote.paymentAsset,
          tokenAmountRaw: quote.tokenAmountRaw,
          tokenAmount: quote.tokenAmount,
          quoteExpiration: quote.quoteExpiration,
          usdReferenceAmount: quote.usdReferenceAmount,
        })
        updateFeaturedOrder(orderId, { state: 'AWAITING_WALLET' })
        return res.status(200).json({ quote, prepared })
      } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : 'QUOTE_FAILED' })
      }
    }

    if (action === 'submit') {
      const txHash = String(body.transactionHash || '')
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        return res.status(400).json({ error: 'INVALID_TX_HASH' })
      }
      const updated = updateFeaturedOrder(orderId, {
        state: 'SUBMITTED',
        transactionHash: txHash,
        paymentStatus: 'submitted',
      })
      return res.status(200).json({ order: updated })
    }

    if (action === 'confirm-receipt') {
      const current = getFeaturedOrder(orderId)!
      const txHash = String(body.transactionHash || '')
      if (
        current.state !== 'SUBMITTED' ||
        !current.transactionHash ||
        current.transactionHash.toLowerCase() !== txHash.toLowerCase()
      ) {
        return res.status(400).json({ error: 'ORDER_NOT_SUBMITTED_OR_TX_MISMATCH' })
      }
      if (!current.tokenAmountRaw || isQuoteExpired(current.quoteExpiration)) {
        return res.status(400).json({ error: 'QUOTE_EXPIRED_OR_MISSING' })
      }
      const validation = await verifyBscPaymentReceipt({
        transactionHash: txHash,
        buyerWallet: current.buyerWallet,
        paymentAsset: current.paymentAsset,
        tokenAmountRaw: current.tokenAmountRaw,
        treasuryWallet: current.treasuryWallet,
      })
      if (!validation.ok) {
        const failed = updateFeaturedOrder(orderId, {
          state: 'PAYMENT_FAILED',
          paymentStatus: 'failed',
          receiptVerified: false,
          lastError: validation.reason || 'RECEIPT_INVALID',
        })
        return res.status(400).json({ error: validation.reason, validation, order: failed })
      }
      const durationMs = current.durationMs || FEATURED_OFFER.durationDays * 24 * 60 * 60 * 1000
      const window = scheduleFeaturedWindow(new Date(), durationMs, 'ms')
      const confirmed = updateFeaturedOrder(orderId, {
        state: 'ELIGIBILITY_PENDING',
        paymentStatus: 'confirmed',
        receiptVerified: true,
        eligibilityStatus: 'pending',
        scheduledStart: window.start,
        scheduledEnd: window.end,
        rotationStatus: 'candidate',
        transactionHash: body.transactionHash || current.transactionHash,
      })
      return res.status(200).json({ order: confirmed, validation })
    }

    if (action === 'cancel') {
      const cancelled = updateFeaturedOrder(orderId, {
        state: 'CANCELLED',
        paymentStatus: order.paymentStatus === 'confirmed' ? order.paymentStatus : 'cancelled',
      })
      return res.status(200).json({ order: cancelled })
    }

    return res.status(400).json({ error: 'UNKNOWN_ACTION' })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

export default handler
