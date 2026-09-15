import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearMCreditsOrdersForTests, spendMCreditsForBoost } from 'lib/mcredits/checkout'
import { readFileSync } from 'fs'
import path from 'path'

vi.mock('lib/featured-placement/orderStore', () => ({
  createFeaturedOrder: vi.fn(),
  persistFeaturedOrderDurably: vi.fn(),
  updateFeaturedOrder: vi.fn(),
}))

vi.mock('lib/featured-placement/eligibility', () => ({
  scheduleFeaturedWindow: (date: Date, duration: number) => ({
    start: date.toISOString(),
    end: new Date(date.getTime() + duration).toISOString(),
  }),
}))

vi.mock('lib/monetization/packages', () => ({
  getFeaturedPackage: () => ({ id: 'featured_24h', durationMs: 86_400_000, usdPrice: 29 }),
  getVisibilityPackage: () => ({ id: 'trend_1h', durationMs: 3_600_000, usdPrice: 9 }),
}))

const trend = new Map<string, any>()
vi.mock('lib/monetization/trendBoostOrders', () => ({
  createTrendBoostOrder: (input: any) => {
    const order = {
      orderId: `legacy_${trend.size + 1}`,
      state: 'DRAFT',
      receiptVerified: false,
      paymentStatus: 'none',
      ...input,
    }
    trend.set(order.orderId, order)
    return order
  },
  updateTrendBoostOrder: (id: string, patch: any) => {
    const current = trend.get(id)
    if (!current) return null
    const next = { ...current, ...patch }
    trend.set(id, next)
    return next
  },
  activateVerifiedTrendBoostWindow: (id: string) => {
    const current = trend.get(id)
    if (!current?.receiptVerified || current.paymentStatus !== 'confirmed') return null
    const next = { ...current, state: 'ACTIVE', scheduledStart: new Date().toISOString(), scheduledEnd: new Date().toISOString() }
    trend.set(id, next)
    return next
  },
  persistTrendBoostOrderDurably: async (order: any) => order,
}))

describe('M-Credits separation', () => {
  afterEach(() => {
    clearMCreditsOrdersForTests()
    trend.clear()
  })

  it('never creates a MARCO Pay session, /pay URL, or wallet transfer', async () => {
    const checkout = readFileSync(
      path.join(__dirname, '../../../views/shared/monetization/CommercialCheckoutModal.tsx'),
      'utf8',
    )
    const api = readFileSync(path.join(__dirname, '../../../pages/api/mcredits/orders.ts'), 'utf8')
    expect(checkout).toContain("pay === 'MARCO_PAY'")
    expect(checkout).toContain("pay === 'M_CREDITS'")
    expect(checkout).not.toContain("pay === 'MARCO_PAY' || pay === 'M_CREDITS'")
    expect(checkout).toContain('/api/mcredits/orders')
    expect(api).not.toContain('createMarcoPayPaymentSession')
    expect(api).not.toContain('/pay/')
    expect(api).not.toContain('eth_sendTransaction')
    expect(api).not.toContain('buildMarcoPayWalletTransfer')
  })

  it('reserve+confirm fulfils once and failure releases the reservation', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('/reserve')) {
        return new Response(JSON.stringify({ ok: true, reservation_id: 'res_1' }), { status: 200 })
      }
      if (String(url).includes('/confirm')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const first = await spendMCreditsForBoost({
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      identityToken: 'passport_session_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(first.state).toBe('FULFILLED')
    expect(first.reservationId).toBe('res_1')
    expect(JSON.stringify(fetchImpl.mock.calls.map((call) => String(call[0])))).not.toContain('/api/public/pay/session')
    expect(JSON.stringify(fetchImpl.mock.calls.map((call) => String(call[0])))).not.toContain('/pay/')

    const failing = vi.fn(async (url: string) => {
      if (String(url).includes('/reserve')) {
        return new Response(JSON.stringify({ ok: true, reservation_id: 'res_fail' }), { status: 200 })
      }
      if (String(url).includes('/confirm')) {
        return new Response(JSON.stringify({ ok: false, error: 'INSUFFICIENT' }), { status: 400 })
      }
      if (String(url).includes('/release')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }
      return new Response(JSON.stringify({ ok: false }), { status: 500 })
    })
    await expect(
      spendMCreditsForBoost({
        projectId: 'mm72',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'trend-boost',
        identityToken: 'passport_session_test',
        fetchImpl: failing as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/M-Credits/)
    expect(failing.mock.calls.some((call) => String(call[0]).includes('/release'))).toBe(true)
  })

  it('rejects MARCO Pay merchant secrets as M-Credits identity', async () => {
    await expect(
      spendMCreditsForBoost({
        projectId: 'mm72',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'trend-boost',
        identityToken: 'mpk_live_not_a_real_secret',
      }),
    ).rejects.toMatchObject({ code: 'MCREDITS_SECRET_REJECTED' })
  })
})
