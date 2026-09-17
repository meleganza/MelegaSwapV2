import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFeaturedOrder, persistFeaturedOrderDurably } from 'lib/featured-placement/orderStore'
import { clearMCreditsOrdersForTests, getMCreditsOrder, spendMCreditsForBoost } from 'lib/mcredits/checkout'
import {
  mCreditsCheckoutBlocker,
  refreshMCreditsQuote,
  setMCreditsPassportForTests,
} from 'lib/mcredits/passportState'
import { canAcceptMCreditsPayment } from 'lib/monetization/visibilityRuntime'

vi.mock('lib/featured-placement/orderStore', () => ({
  createFeaturedOrder: vi.fn((input: { projectId: string }) => ({
    orderId: `featured_${input.projectId}`,
    state: 'DRAFT',
  })),
  persistFeaturedOrderDurably: vi.fn(async (order: { orderId: string }) => order),
  updateFeaturedOrder: vi.fn((_id: string, patch: Record<string, unknown>) => ({
    orderId: 'featured_mm72',
    ...patch,
  })),
}))

vi.mock('lib/featured-placement/eligibility', () => ({
  scheduleFeaturedWindow: (date: Date, duration: number) => ({
    start: date.toISOString(),
    end: new Date(date.getTime() + duration).toISOString(),
  }),
}))

vi.mock('lib/monetization/packages', () => ({
  getFeaturedPackage: () => ({ id: 'featured_24h', durationMs: 86_400_000, usdPrice: 29 }),
  getVisibilityPackage: () => ({ id: 'trend_6h', durationMs: 21_600_000, usdPrice: 29 }),
}))

const trend = new Map<string, any>()
const activate = vi.fn((id: string) => {
  const current = trend.get(id)
  if (!current?.receiptVerified || current.paymentStatus !== 'confirmed') return null
  const next = { ...current, state: 'ACTIVE', scheduledStart: new Date().toISOString(), scheduledEnd: new Date().toISOString() }
  trend.set(id, next)
  return next
})

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
  activateVerifiedTrendBoostWindow: (id: string) => activate(id),
  persistTrendBoostOrderDurably: async (order: any) => order,
}))

function ledger(ok = true) {
  return vi.fn(async (url: string) => {
    if (String(url).includes('/reserve')) {
      return new Response(JSON.stringify({ ok: true, reservation_id: 'res_1' }), { status: 200 })
    }
    if (String(url).includes('/confirm')) {
      return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 400 })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  })
}

describe('M-Credits Boost payment activation', () => {
  afterEach(() => {
    clearMCreditsOrdersForTests()
    setMCreditsPassportForTests(null)
    trend.clear()
    activate.mockClear()
    vi.mocked(createFeaturedOrder).mockClear()
    vi.mocked(persistFeaturedOrderDurably).mockClear()
  })

  it('A. disconnected Passport requires connect', () => {
    setMCreditsPassportForTests({ connected: false, known: false, availableMinor: null, identityToken: null })
    expect(mCreditsCheckoutBlocker({ usdPrice: 29 })).toBe('Connect MARCO Passport to pay with M-Credits.')
  })

  it('B. connected Passport exposes M-Credits balance', () => {
    setMCreditsPassportForTests({ connected: true, known: true, availableMinor: 5000, identityToken: 'passport_session_test' })
    expect(mCreditsCheckoutBlocker({ usdPrice: 29 })).toBeNull()
    expect(refreshMCreditsQuote(29)).toEqual({ amountMinor: '2900', display: '≈ 29 M-Credits' })
  })

  it('C. insufficient M-Credits disables payment with a controlled reason', () => {
    setMCreditsPassportForTests({ connected: true, known: true, availableMinor: 100, identityToken: 'passport_session_test' })
    expect(mCreditsCheckoutBlocker({ usdPrice: 29 })).toBe('Insufficient M-Credits for this purchase.')
  })

  it('D/E. sufficient balance keeps Review and Pay operational with a refreshed quote', () => {
    setMCreditsPassportForTests({ connected: true, known: true, availableMinor: 2900, identityToken: 'passport_session_test' })
    expect(mCreditsCheckoutBlocker({ usdPrice: 29 })).toBeNull()
    expect(refreshMCreditsQuote(29).amountMinor).toBe('2900')
    expect(refreshMCreditsQuote(59).amountMinor).toBe('5900')
  })

  it('F. successful mocked payment creates one charge, one order, and one fulfillment', async () => {
    const fetchImpl = ledger()
    const first = await spendMCreditsForBoost({
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'featured',
      identityToken: 'passport_session_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(first.state).toBe('FULFILLED')
    expect(fetchImpl.mock.calls.filter((call) => String(call[0]).includes('/reserve'))).toHaveLength(1)
    expect(getMCreditsOrder(first.orderId)?.state).toBe('FULFILLED')
    expect(createFeaturedOrder).toHaveBeenCalledTimes(1)
    expect(persistFeaturedOrderDurably).toHaveBeenCalledTimes(1)
  })

  it('G. concurrent double submit charges once and rejects the in-flight duplicate', async () => {
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('/reserve')) {
        await gate
        return new Response(JSON.stringify({ ok: true, reservation_id: 'res_1' }), { status: 200 })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const input = {
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost' as const,
      identityToken: 'passport_session_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    }
    const first = spendMCreditsForBoost(input)
    await expect(spendMCreditsForBoost(input)).rejects.toMatchObject({ code: 'MCREDITS_IN_FLIGHT' })
    release?.()
    expect((await first).state).toBe('FULFILLED')
    expect(fetchImpl.mock.calls.filter((call) => String(call[0]).includes('/reserve'))).toHaveLength(1)
  })

  it('H. refresh after fulfillment reuses the order without a second charge', async () => {
    const fetchImpl = ledger()
    const input = {
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost' as const,
      identityToken: 'passport_session_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    }
    const first = await spendMCreditsForBoost(input)
    const second = await spendMCreditsForBoost(input)
    expect(second.orderId).toBe(first.orderId)
    expect(fetchImpl.mock.calls.filter((call) => String(call[0]).includes('/reserve'))).toHaveLength(1)
    expect(activate).toHaveBeenCalledTimes(1)
  })

  it('I. failed payment does not create a completed order', async () => {
    const failing = ledger(false)
    await expect(
      spendMCreditsForBoost({
        projectId: 'mm72',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'featured',
        identityToken: 'passport_session_test',
        fetchImpl: failing as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/M-Credits/)
    const retry = await spendMCreditsForBoost({
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'featured',
      identityToken: 'passport_session_test',
      fetchImpl: ledger() as unknown as typeof fetch,
    })
    expect(retry.state).toBe('FULFILLED')
    expect(failing.mock.calls.filter((call) => String(call[0]).includes('/confirm'))).toHaveLength(1)
  })

  it('J. fulfillment failure stays controlled and is not silent success', async () => {
    activate.mockReturnValueOnce(null)
    await expect(
      spendMCreditsForBoost({
        projectId: 'mm72',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'trend-boost',
        identityToken: 'passport_session_test',
        fetchImpl: ledger() as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'MCREDITS_ACTIVATION_FAILED' })
  })

  it('K. production-enabled services bind the canonical fulfillment pipelines', () => {
    expect(canAcceptMCreditsPayment('featured')).toBe(true)
    expect(canAcceptMCreditsPayment('trend-boost')).toBe(true)
  })

  it('L. genuinely unavailable services cannot charge the user', async () => {
    expect(canAcceptMCreditsPayment('featured-pool')).toBe(false)
    expect(canAcceptMCreditsPayment('featured-farm')).toBe(false)
    expect(canAcceptMCreditsPayment('sponsored-research')).toBe(false)
    await expect(
      spendMCreditsForBoost({
        projectId: 'eyed',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'featured-pool',
        identityToken: 'passport_session_test',
        fetchImpl: ledger() as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'SERVICE_NOT_FULFILLABLE' })
  })
})
