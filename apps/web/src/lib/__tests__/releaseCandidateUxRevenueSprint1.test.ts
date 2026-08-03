/**
 * MELEGASWAP_V2_RELEASE_CANDIDATE_UX_AND_REVENUE_SPRINT_1
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  FEATURED_PACKAGES,
  TREND_BOOST_PACKAGES,
  getFeaturedPackage,
  getTrendBoostPackage,
  listFeaturedPackageIds,
  listTrendBoostPackageIds,
} from 'lib/monetization/packages'
import {
  listPaymentRouterProducts,
  quotePaymentRouter,
  PAYMENT_ROUTER_PRODUCTS,
} from 'lib/monetization/paymentRouter'
import { TOKEN_SUGGESTIONS, suggestionsForQuery } from 'lib/monetization/sponsorship'
import { RC_COPY, walletFlowMessage } from 'lib/monetization/copy'
import {
  clearTrendBoostOrdersForTests,
  createTrendBoostOrder,
  buildTrendBoostQuote,
  prepareTrendBoostPayment,
} from 'lib/monetization/trendBoostOrders'
import { FEATURED_OFFER, createFeaturedOrder, buildFeaturedQuote, clearFeaturedOrdersForTests } from 'lib/featured-placement'

const WEB = path.resolve(__dirname, '../../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/melegaswap-v2-release-candidate-ux-and-revenue-sprint-1')

describe('MELEGASWAP_V2_RELEASE_CANDIDATE_UX_AND_REVENUE_SPRINT_1', () => {
  beforeEach(() => {
    clearFeaturedOrdersForTests()
    clearTrendBoostOrdersForTests()
  })

  it('Featured packages: 24h, 72h, 1 week, 1 month', () => {
    expect(listFeaturedPackageIds()).toEqual([
      'featured_24h',
      'featured_72h',
      'featured_1w',
      'featured_1m',
    ])
    expect(FEATURED_PACKAGES).toHaveLength(4)
    expect(getFeaturedPackage().id).toBe('featured_1w')
    expect(getFeaturedPackage().usdPrice).toBe(99)
    expect(getFeaturedPackage('featured_24h').usdPrice).toBe(29)
    expect(getFeaturedPackage('featured_1m').durationMs).toBe(30 * 24 * 60 * 60 * 1000)
  })

  it('Trend Boost packages: 1h, 3h, 6h, 12h, 24h', () => {
    expect(listTrendBoostPackageIds()).toEqual([
      'trend_1h',
      'trend_3h',
      'trend_6h',
      'trend_12h',
      'trend_24h',
    ])
    expect(TREND_BOOST_PACKAGES).toHaveLength(5)
    expect(getTrendBoostPackage().id).toBe('trend_6h')
    expect(getTrendBoostPackage('trend_1h').usdPrice).toBe(9)
  })

  it('Payment Router covers Create Token/Farm/Pool + Featured + Trend Boost with BNB/USDT/USDC/MARCO', () => {
    const products = listPaymentRouterProducts()
    expect(products.map((p) => p.product).sort()).toEqual(
      ['create_farm', 'create_pool', 'create_token', 'featured_project', 'trend_boost'].sort(),
    )
    for (const p of products) {
      expect(p.acceptedAssets).toEqual(['BNB', 'USDT', 'USDC', 'MARCO'])
    }
    const featured = quotePaymentRouter({
      product: 'featured_project',
      asset: 'USDT',
      packageId: 'featured_1w',
    })
    expect(featured.usdReferenceAmount).toBe(99)
    expect(featured.tokenAmount).toBe('99.00000000')
    const create = quotePaymentRouter({ product: 'create_token', asset: 'BNB' })
    expect(create.protocolFeeWei).toBe('100000000000000000')
    expect(PAYMENT_ROUTER_PRODUCTS.create_token.protocolAsset).toBe('BNB')
  })

  it('Sponsored suggestions are clearly labelled Featured / Trending / Sponsored', () => {
    expect(TOKEN_SUGGESTIONS.map((s) => s.label).sort()).toEqual(['Featured', 'Sponsored', 'Trending'])
    expect(suggestionsForQuery('marco')[0]?.kind).toBe('featured')
    expect(suggestionsForQuery('usdt')[0]?.kind).toBe('sponsored')
  })

  it('Wallet UX copy is uniform and human-first', () => {
    expect(walletFlowMessage('connect')).toBe(RC_COPY.connectWallet)
    expect(walletFlowMessage('switch_network')).toBe(RC_COPY.switchNetwork)
    expect(walletFlowMessage('approve', 'MARCO')).toContain('MARCO')
    expect(walletFlowMessage('success')).toBe(RC_COPY.success)
    expect(RC_COPY.featuredTitle).toMatch(/Featured/)
    expect(RC_COPY.trendBoostTitle).toMatch(/Trend Boost/)
  })

  it('Featured order respects package pricing', () => {
    const order = createFeaturedOrder({
      projectId: 'p1',
      projectSlug: 'demo',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'USDT',
      sourceFlow: 'claim-project',
      packageId: 'featured_24h',
    })
    expect(order.packageId).toBe('featured_24h')
    expect(order.usdReferenceAmount).toBe(29)
    const quote = buildFeaturedQuote({
      orderId: order.orderId,
      paymentAsset: 'USDT',
      unitPriceUsd: 1,
      quoteSource: 'stablecoin-1usd',
    })
    expect(quote.usdReferenceAmount).toBe(29)
  })

  it('Trend Boost order + payment prepare settles to treasury', () => {
    const order = createTrendBoostOrder({
      projectId: 'p2',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'BNB',
      packageId: 'trend_1h',
    })
    expect(order.usdReferenceAmount).toBe(9)
    const quote = buildTrendBoostQuote({
      orderId: order.orderId,
      paymentAsset: 'BNB',
      unitPriceUsd: 600,
      quoteSource: 'test',
    })
    const prepared = prepareTrendBoostPayment({
      paymentAsset: 'BNB',
      tokenAmountRaw: quote.tokenAmountRaw,
      tokenAmount: quote.tokenAmount,
      quoteExpiration: quote.quoteExpiration,
      usdReferenceAmount: quote.usdReferenceAmount,
    })
    expect(prepared.to.toLowerCase()).toBe(FEATURED_OFFER.treasuryWallet.toLowerCase())
    expect(prepared.kind).toBe('native')
  })

  it('fee-schedule.json includes Featured packages + Trend Boost', () => {
    const schedule = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/fee-schedule.json'), 'utf8'),
    )
    expect(schedule.services.featuredProject.packages).toHaveLength(4)
    expect(schedule.services.trendBoost.packages).toHaveLength(5)
  })

  it('evidence pack exists', () => {
    const required = [
      'MISSION_REPORT.md',
      'packages.json',
      'payment-router.json',
      'sponsorship.json',
      'wallet-ux.json',
      'copy-audit.json',
      'ui-polish.json',
      'tests.json',
      'build.json',
    ]
    for (const name of required) {
      expect(existsSync(path.join(EVIDENCE, name)), name).toBe(true)
    }
    const report = readFileSync(path.join(EVIDENCE, 'MISSION_REPORT.md'), 'utf8')
    expect(report).toContain('MELEGASWAP_V2_RELEASE_CANDIDATE_SPRINT_1_COMPLETE')
  })
})
