import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearMCreditsOrdersForTests,
  prepareMCreditsOrder,
  quoteMCreditsBalance,
  spendMCreditsForBoost,
} from 'lib/mcredits/checkout'
import { createFeaturedOrder, persistFeaturedOrderDurably, updateFeaturedOrder } from 'lib/featured-placement/orderStore'

vi.mock('lib/featured-placement/orderStore', () => ({
  createFeaturedOrder: vi.fn((input: any) => ({ orderId: 'feat_1', ...input })),
  persistFeaturedOrderDurably: vi.fn(async (order: any) => order),
  updateFeaturedOrder: vi.fn((_id: string, patch: any) => ({ orderId: 'feat_1', ...patch })),
}))

vi.mock('lib/featured-placement/eligibility', () => ({
  scheduleFeaturedWindow: (date: Date, duration: number) => ({
    start: date.toISOString(),
    end: new Date(date.getTime() + duration).toISOString(),
  }),
}))

vi.mock('lib/monetization/packages', () => ({
  getFeaturedPackage: () => ({ id: 'featured_24h', durationMs: 86_400_000, usdPrice: 29 }),
  getVisibilityPackage: (_product: string, id?: string | null) => ({
    id: id || 'trend_6h',
    durationMs: 21_600_000,
    usdPrice: 29,
  }),
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
    const next = {
      ...current,
      state: 'ACTIVE',
      scheduledStart: new Date().toISOString(),
      scheduledEnd: new Date().toISOString(),
    }
    trend.set(id, next)
    return next
  },
  persistTrendBoostOrderDurably: async (order: any) => order,
}))

const SIGNING = {
  applicationRef: 'app_sedafoqw6qlxyxb9l8ds',
  signingSecret: 'test_signing_secret_not_live',
}

function ledger(options?: { availableMinor?: string; fail?: 'reserve' | 'confirm' | 'insufficient' }) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const path = String(url)
    if (path.includes('/balance')) {
      return new Response(
        JSON.stringify({
          ok: true,
          available_minor: options?.availableMinor ?? '5000',
        }),
        { status: 200 },
      )
    }
    if (path.includes('/reserve')) {
      if (options?.fail === 'insufficient') {
        return new Response(JSON.stringify({ ok: false, error: 'INSUFFICIENT_BALANCE' }), { status: 409 })
      }
      if (options?.fail === 'reserve') {
        return new Response(JSON.stringify({ ok: false, error: 'MCREDITS_RESERVE_FAILED' }), { status: 503 })
      }
      expect(init?.headers).toMatchObject({
        'marco-application': SIGNING.applicationRef,
      })
      expect(String((init?.headers as any)?.authorization || '')).toContain('passport_grant_test')
      return new Response(JSON.stringify({ ok: true, reservation_id: 'res_ok' }), { status: 200 })
    }
    if (path.includes('/confirm')) {
      if (options?.fail === 'confirm') {
        return new Response(JSON.stringify({ ok: false, error: 'MCREDITS_CONFIRM_FAILED' }), { status: 503 })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
    if (path.includes('/release')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
    throw new Error(`Unexpected M-Credits URL: ${path}`)
  })
}

const buyer = '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed'

describe('M-Credits production activation', () => {
  afterEach(() => {
    clearMCreditsOrdersForTests()
    trend.clear()
    vi.clearAllMocks()
  })

  it('quotes the exact Featured 24h amount without charging', async () => {
    const fetchImpl = ledger({ availableMinor: '4000' })
    const quoted = await quoteMCreditsBalance({
      projectId: 'eyed',
      buyerWallet: buyer,
      serviceId: 'featured',
      packageId: 'featured_24h',
      identityToken: 'passport_grant_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      ...SIGNING,
    })
    expect(quoted.order.referenceAmountMinor).toBe('2900')
    expect(quoted.insufficient).toBe(false)
    expect(quoted.availableMinor).toBe('4000')
    expect(fetchImpl.mock.calls.some((call) => String(call[0]).includes('/reserve'))).toBe(false)
  })

  it('marks insufficient M-Credits from the canonical balance quote', async () => {
    const quoted = await quoteMCreditsBalance({
      projectId: 'eyed',
      buyerWallet: buyer,
      serviceId: 'trend-boost',
      packageId: 'trend_6h',
      identityToken: 'passport_grant_test',
      fetchImpl: ledger({ availableMinor: '100' }) as unknown as typeof fetch,
      ...SIGNING,
    })
    expect(quoted.order.referenceAmountMinor).toBe('2900')
    expect(quoted.insufficient).toBe(true)
  })

  it('fulfills Featured into the existing Home rotation candidate store', async () => {
    const order = await spendMCreditsForBoost({
      projectId: 'eyed',
      projectSlug: 'eyed',
      buyerWallet: buyer,
      serviceId: 'featured',
      packageId: 'featured_24h',
      identityToken: 'passport_grant_test',
      fetchImpl: ledger() as unknown as typeof fetch,
      ...SIGNING,
    })
    expect(order.state).toBe('FULFILLED')
    expect(createFeaturedOrder).toHaveBeenCalled()
    expect(updateFeaturedOrder).toHaveBeenCalledWith(
      'feat_1',
      expect.objectContaining({
        paymentStatus: 'confirmed',
        receiptVerified: true,
        rotationStatus: 'candidate',
      }),
    )
    expect(persistFeaturedOrderDurably).toHaveBeenCalled()
  })

  it('fulfills Trend Boost into the existing active ticker window', async () => {
    const order = await spendMCreditsForBoost({
      projectId: 'eyed',
      projectSlug: 'eyed',
      buyerWallet: buyer,
      serviceId: 'trend-boost',
      packageId: 'trend_6h',
      identityToken: 'passport_grant_test',
      fetchImpl: ledger() as unknown as typeof fetch,
      ...SIGNING,
    })
    expect(order.state).toBe('FULFILLED')
    expect([...trend.values()].some((item) => item.state === 'ACTIVE' && item.receiptVerified)).toBe(true)
  })

  it('never charges Featured Pool / Farm / Sponsored Search', async () => {
    for (const serviceId of ['featured-pool', 'featured-farm', 'sponsored-research']) {
      await expect(
        spendMCreditsForBoost({
          projectId: 'eyed',
          buyerWallet: buyer,
          serviceId,
          identityToken: 'passport_grant_test',
          fetchImpl: ledger() as unknown as typeof fetch,
          ...SIGNING,
        }),
      ).rejects.toMatchObject({ code: 'SERVICE_NOT_FULFILLABLE' })
    }
  })

  it('is idempotent and does not reserve twice for the same buyer/service/package', async () => {
    const fetchImpl = ledger()
    const input = {
      projectId: 'eyed',
      buyerWallet: buyer,
      serviceId: 'featured' as const,
      packageId: 'featured_24h',
      identityToken: 'passport_grant_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      ...SIGNING,
    }
    const first = await spendMCreditsForBoost(input)
    const second = await spendMCreditsForBoost(input)
    expect(second.orderId).toBe(first.orderId)
    expect(second.state).toBe('FULFILLED')
    expect(fetchImpl.mock.calls.filter((call) => String(call[0]).includes('/reserve'))).toHaveLength(1)
    expect(fetchImpl.mock.calls.filter((call) => String(call[0]).includes('/confirm'))).toHaveLength(1)
  })

  it('reuses a prepared merchant order reference', () => {
    const prepared = prepareMCreditsOrder({
      projectId: 'eyed',
      buyerWallet: buyer,
      serviceId: 'trend-boost',
      packageId: 'trend_6h',
    })
    const again = prepareMCreditsOrder({
      projectId: 'eyed',
      buyerWallet: buyer,
      serviceId: 'trend-boost',
      packageId: 'trend_6h',
    })
    expect(again.orderId).toBe(prepared.orderId)
    expect(again.referenceAmountMinor).toBe('2900')
  })
})
