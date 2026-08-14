import { describe, expect, it, beforeEach } from 'vitest'
import {
  FEATURED_OFFER,
  assertNoTreasuryRuntime,
  buildFeaturedQuote,
  clearFeaturedOrdersForTests,
  createFeaturedOrder,
  isQuoteExpired,
  isRotationEligible,
  listRotationCandidates,
  marcoCashbackAmount,
  prepareFeaturedPayment,
  resolveCashbackState,
  scheduleFeaturedWindow,
  updateFeaturedOrder,
  validateFeaturedReceipt,
} from '../index'

describe('featured placement', () => {
  beforeEach(() => {
    clearFeaturedOrdersForTests()
  })

  it('encodes Founder commercial terms', () => {
    expect(FEATURED_OFFER.usdPrice).toBe(99)
    expect(FEATURED_OFFER.durationDays).toBe(7)
    expect(FEATURED_OFFER.acceptedAssets).toEqual(['BNB', 'USDT', 'USDC', 'MARCO'])
    expect(FEATURED_OFFER.treasuryWallet.toLowerCase()).toBe(
      '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b',
    )
    expect(marcoCashbackAmount()).toBe(4.95)
    expect(resolveCashbackState('MARCO')).toBe('ELIGIBLE_PENDING')
    expect(resolveCashbackState('BNB')).toBe('NOT_ELIGIBLE')
  })

  it('builds native BNB transfer to treasury', () => {
    const order = createFeaturedOrder({
      projectId: 'p1',
      projectSlug: 'demo',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'BNB',
      sourceFlow: 'claim-project',
    })
    const quote = buildFeaturedQuote({
      orderId: order.orderId,
      paymentAsset: 'BNB',
      unitPriceUsd: 600,
      quoteSource: 'test-fixture',
    })
    const prepared = prepareFeaturedPayment({
      paymentAsset: 'BNB',
      tokenAmountRaw: quote.tokenAmountRaw,
      tokenAmount: quote.tokenAmount,
      quoteExpiration: quote.quoteExpiration,
    })
    expect(prepared.kind).toBe('native')
    expect(prepared.to.toLowerCase()).toBe(FEATURED_OFFER.treasuryWallet.toLowerCase())
    expect(prepared.valueHex.startsWith('0x')).toBe(true)
  })

  it('builds ERC-20 transfer calldata to treasury', () => {
    const order = createFeaturedOrder({
      projectId: 'p2',
      projectContract: '0x2222222222222222222222222222222222222222',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'USDT',
      sourceFlow: 'create-project',
    })
    const quote = buildFeaturedQuote({
      orderId: order.orderId,
      paymentAsset: 'USDT',
      unitPriceUsd: 1,
      quoteSource: 'stablecoin-1usd',
    })
    const prepared = prepareFeaturedPayment({
      paymentAsset: 'USDT',
      tokenAmountRaw: quote.tokenAmountRaw,
      tokenAmount: quote.tokenAmount,
      quoteExpiration: quote.quoteExpiration,
    })
    expect(prepared.kind).toBe('erc20')
    expect(prepared.to.toLowerCase()).toBe('0x55d398326f99059ff775485246999027b3197955')
    expect(prepared.data.startsWith('0xa9059cbb')).toBe(true)
    expect(prepared.data.toLowerCase()).toContain(
      FEATURED_OFFER.treasuryWallet.slice(2).toLowerCase(),
    )
  })

  it('validates native receipt destination and amount', () => {
    const ok = validateFeaturedReceipt({
      paymentAsset: 'BNB',
      tokenAmountRaw: '1000',
      txTo: FEATURED_OFFER.treasuryWallet,
      txValueHex: '0x3e8',
      txStatus: '0x1',
    })
    expect(ok.ok).toBe(true)
    const bad = validateFeaturedReceipt({
      paymentAsset: 'BNB',
      tokenAmountRaw: '1000',
      txTo: '0x0000000000000000000000000000000000000001',
      txValueHex: '0x3e8',
      txStatus: '0x1',
    })
    expect(bad.ok).toBe(false)
  })

  it('expires quotes and gates rotation candidates', () => {
    expect(isQuoteExpired(new Date(Date.now() - 1000).toISOString())).toBe(true)
    const order = createFeaturedOrder({
      projectId: 'p3',
      projectSlug: 'rot',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'USDC',
      sourceFlow: 'claim-project',
    })
    const window = scheduleFeaturedWindow(new Date(), 7)
    updateFeaturedOrder(order.orderId, {
      state: 'ELIGIBILITY_PENDING',
      paymentStatus: 'confirmed',
      receiptVerified: true,
      eligibilityStatus: 'pending',
      scheduledStart: window.start,
      scheduledEnd: window.end,
      rotationStatus: 'candidate',
    })
    expect(isRotationEligible(updateFeaturedOrder(order.orderId, {})!)).toBe(true)
    expect(listRotationCandidates().some((c) => c.orderId === order.orderId)).toBe(true)
    updateFeaturedOrder(order.orderId, { state: 'CANCELLED' })
    expect(listRotationCandidates().some((c) => c.orderId === order.orderId)).toBe(false)
  })

  it('does not reference Treasury Runtime', () => {
    expect(assertNoTreasuryRuntime('featured-placement payment to MELEGA TREASURY WALLET')).toBe(true)
    expect(assertNoTreasuryRuntime('calls TreasuryRuntime.execute')).toBe(false)
  })
})
