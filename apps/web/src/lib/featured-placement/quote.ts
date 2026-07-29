import { FEATURED_OFFER, FEATURED_PAYMENT_TOKENS, type FeaturedPayAsset } from './constants'
import type { FeaturedQuote } from './types'
import { updateFeaturedOrder } from './orderStore'

function toRawAmount(human: number, decimals: number): string {
  const [whole, frac = ''] = human.toFixed(decimals).split('.')
  return BigInt(whole + frac.padEnd(decimals, '0').slice(0, decimals)).toString()
}

/**
 * Resolve Featured token amount at quote time.
 * Stablecoins use 1:1 USD. BNB/MARCO require a positive unit USD price from an approved source.
 */
export function buildFeaturedQuote(input: {
  orderId: string
  paymentAsset: FeaturedPayAsset
  unitPriceUsd: number | null
  quoteSource: string
}): FeaturedQuote {
  const meta = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  const usd = FEATURED_OFFER.usdPrice
  let unit = input.unitPriceUsd
  let source = input.quoteSource

  if (input.paymentAsset === 'USDT' || input.paymentAsset === 'USDC') {
    unit = 1
    source = 'stablecoin-1usd'
  }

  if (unit == null || !(unit > 0) || !Number.isFinite(unit)) {
    throw new Error(`QUOTE_UNAVAILABLE:${input.paymentAsset}`)
  }

  const tokenAmountNum = usd / unit
  const tokenAmount = tokenAmountNum.toFixed(Math.min(8, meta.decimals))
  const tokenAmountRaw = toRawAmount(Number(tokenAmount), meta.decimals)
  const now = Date.now()
  const quote: FeaturedQuote = {
    orderId: input.orderId,
    paymentAsset: input.paymentAsset,
    usdReferenceAmount: usd,
    tokenAmount,
    tokenAmountRaw,
    unitPriceUsd: unit,
    quoteSource: source,
    quoteTimestamp: new Date(now).toISOString(),
    quoteExpiration: new Date(now + FEATURED_OFFER.quoteTtlMs).toISOString(),
    treasuryWallet: FEATURED_OFFER.treasuryWallet,
    chainId: 56,
    decimals: meta.decimals,
    tokenAddress: meta.address,
  }

  updateFeaturedOrder(input.orderId, {
    state: 'QUOTED',
    paymentAsset: input.paymentAsset,
    tokenAmount: quote.tokenAmount,
    tokenAmountRaw: quote.tokenAmountRaw,
    unitPriceUsd: quote.unitPriceUsd,
    quoteSource: quote.quoteSource,
    quoteTimestamp: quote.quoteTimestamp,
    quoteExpiration: quote.quoteExpiration,
  })

  return quote
}

export function isQuoteExpired(expirationIso: string | null | undefined, now = Date.now()): boolean {
  if (!expirationIso) return true
  const t = Date.parse(expirationIso)
  return !Number.isFinite(t) || t <= now
}
