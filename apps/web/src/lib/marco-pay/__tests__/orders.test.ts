import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MarcoPayCompletedEvent } from '../contract'

vi.mock('@vercel/blob', () => ({ get: vi.fn(), head: vi.fn(), put: vi.fn() }))
vi.mock('lib/featured-placement/eligibility', () => ({
  scheduleFeaturedWindow: (date: Date, duration: number) => ({
    start: date.toISOString(),
    end: new Date(date.getTime() + duration).toISOString(),
  }),
}))
vi.mock('lib/featured-placement/orderStore', () => ({
  clearFeaturedOrdersForTests: vi.fn(),
  createFeaturedOrder: vi.fn(),
  getFeaturedOrder: vi.fn(),
  persistFeaturedOrderDurably: vi.fn(),
  updateFeaturedOrder: vi.fn(),
}))
vi.mock('lib/monetization/packages', () => ({
  getFeaturedPackage: () => ({ id: 'featured_24h', durationMs: 86_400_000, usdPrice: 29 }),
  getVisibilityPackage: () => ({ id: 'trend_1h', durationMs: 3_600_000, usdPrice: 9 }),
}))
vi.mock('lib/monetization/trendBoostOrders', () => {
  const orders = new Map<string, any>()
  return {
    clearTrendBoostOrdersForTests: () => orders.clear(),
    getTrendBoostOrder: (id: string) => orders.get(id) ?? null,
    createTrendBoostOrder: (input: any) => {
      const order = {
        orderId: `legacy_${orders.size + 1}`,
        state: 'DRAFT',
        receiptVerified: false,
        paymentStatus: 'none',
        ...input,
      }
      orders.set(order.orderId, order)
      return order
    },
    updateTrendBoostOrder: (id: string, patch: any) => {
      const current = orders.get(id)
      if (!current) return null
      const next = { ...current, ...patch }
      orders.set(id, next)
      return next
    },
    activateVerifiedTrendBoostWindow: (id: string) => {
      const current = orders.get(id)
      if (!current?.receiptVerified || current.paymentStatus !== 'confirmed') return null
      if (current.state === 'ACTIVE') return current
      const next = {
        ...current,
        state: 'ACTIVE',
        scheduledStart: new Date().toISOString(),
        scheduledEnd: new Date(Date.now() + 3_600_000).toISOString(),
      }
      orders.set(id, next)
      return next
    },
    persistTrendBoostOrderDurably: async (order: any) => order,
  }
})

let clearFeaturedOrdersForTests: () => void
let clearTrendBoostOrdersForTests: () => void
let getTrendBoostOrder: (orderId: string) => any
let clearMarcoPayOrdersForTests: () => void
let createMarcoPayOrder: (input: any) => Promise<any>
let getMarcoPayOrder: (orderId: string) => any
let processMarcoPayCompletedEvent: (event: MarcoPayCompletedEvent) => Promise<any>
let processMarcoPaySignedEvent: (signed: any) => Promise<any>

const applicationRef = 'app_sedafoqw6qlxyxb9l8ds'

function eventFor(
  orderId: string,
  overrides: Partial<MarcoPayCompletedEvent> = {},
): MarcoPayCompletedEvent {
  return {
    event_id: '00000000-0000-4000-8000-000000000010',
    event_type: 'payment.completed',
    event_version: '1',
    created_at: new Date().toISOString(),
    application_ref: applicationRef,
    payment_ref: 'pay_order_test_1',
    intent_ref: 'intent_order_test_1',
    product_ref: null,
    merchant_order_ref: orderId,
    reference_currency: 'USD',
    reference_amount_minor: '900',
    marco_amount_minor: '2840000',
    status: 'COMPLETED',
    test_mode: true,
    receipt_ref: 'receipt_order_test_1',
    ...overrides,
  }
}

describe('MARCO Pay fulfilment', () => {
  beforeAll(async () => {
    ;({ clearFeaturedOrdersForTests } = await import('lib/featured-placement/orderStore'))
    ;({ clearTrendBoostOrdersForTests, getTrendBoostOrder } = await import('lib/monetization/trendBoostOrders'))
    ;({ clearMarcoPayOrdersForTests, createMarcoPayOrder, getMarcoPayOrder, processMarcoPayCompletedEvent, processMarcoPaySignedEvent } =
      await import('../orders'))
  })
  beforeEach(() => {
    process.env.MARCO_PAY_ORDERS_DIR = '/private/tmp/melega-marco-pay-orders-test'
    process.env.TREND_BOOST_ORDERS_DIR = '/private/tmp/melega-marco-pay-trend-orders-test'
    process.env.FEATURED_ORDERS_DIR = '/private/tmp/melega-marco-pay-featured-orders-test'
    clearMarcoPayOrdersForTests()
    clearTrendBoostOrdersForTests()
    clearFeaturedOrdersForTests()
  })

  afterEach(() => {
    clearMarcoPayOrdersForTests()
    clearTrendBoostOrdersForTests()
    clearFeaturedOrdersForTests()
  })

  it('recognises TEST_AUTHORITY and never activates a service', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      projectSlug: 'mm72',
      projectContract: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    const result = await processMarcoPayCompletedEvent(eventFor(order.orderId))
    expect(order.productRef).toBeNull()
    expect(result.testMode).toBe(true)
    expect(result.order?.state).toBe('TEST_VERIFIED')
    expect(getTrendBoostOrder(order.legacyOrderId)?.state).toBe('DRAFT')
  })

  it('reconciles amount/order and activates a live service exactly once under concurrency', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      projectSlug: 'mm72',
      projectContract: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    const live = eventFor(order.orderId, { test_mode: false })
    const [first, second] = await Promise.all([
      processMarcoPayCompletedEvent(live),
      processMarcoPayCompletedEvent(live),
    ])
    expect([first.duplicate, second.duplicate].sort()).toEqual([false, true])
    expect(getMarcoPayOrder(order.orderId)?.state).toBe('ACTIVE')
    const activated = getTrendBoostOrder(order.legacyOrderId)
    expect(activated?.state).toBe('ACTIVE')
    expect(activated?.receiptVerified).toBe(true)
    const scheduledEnd = activated?.scheduledEnd
    const retry = await processMarcoPayCompletedEvent(live)
    expect(retry.duplicate).toBe(true)
    expect(getTrendBoostOrder(order.legacyOrderId)?.scheduledEnd).toBe(scheduledEnd)
  })

  it('fails closed on a mismatched server-owned amount', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    await expect(
      processMarcoPayCompletedEvent(eventFor(order.orderId, { reference_amount_minor: '899', test_mode: false })),
    ).rejects.toThrow('ORDER_AMOUNT_MISMATCH')
    expect(getTrendBoostOrder(order.legacyOrderId)?.state).toBe('DRAFT')
  })

  it('never activates when MARCO amount is copied from USD', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    await expect(
      processMarcoPayCompletedEvent(eventFor(order.orderId, { marco_amount_minor: '900', test_mode: false })),
    ).rejects.toThrow('MARCO_CONVERSION_INVALID')
    expect(getTrendBoostOrder(order.legacyOrderId)?.state).toBe('DRAFT')
  })

  it('marks a failed payment without activating and ignores a duplicate failure', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    const failed = {
      kind: 'lifecycle' as const,
      event: {
        event_id: '00000000-0000-4000-8000-000000000011',
        event_type: 'payment.failed' as const,
        event_version: '1' as const,
        created_at: new Date().toISOString(),
        application_ref: applicationRef,
        payment_ref: 'pay_failed_order',
        intent_ref: 'intent_failed_order',
        product_ref: null,
        merchant_order_ref: order.orderId,
        reference_currency: 'USD',
        reference_amount_minor: '900',
        marco_amount_minor: '2840000',
        status: 'FAILED',
        test_mode: false,
        receipt_ref: null,
      },
    }
    const first = await processMarcoPaySignedEvent(failed)
    const second = await processMarcoPaySignedEvent(failed)
    expect(first.effect).toBe('failed')
    expect(first.activated).toBe(false)
    expect(second.duplicate).toBe(true)
    expect(getMarcoPayOrder(order.orderId)?.state).toBe('FAILED')
    expect(getTrendBoostOrder(order.legacyOrderId)?.state).toBe('DRAFT')
  })

  it('does not let payment.created or payment.pending mark an order paid', async () => {
    const order = await createMarcoPayOrder({
      applicationRef,
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    for (const event_type of ['payment.created', 'payment.pending'] as const) {
      const result = await processMarcoPaySignedEvent({
        kind: 'lifecycle',
        event: {
          event_id: `00000000-0000-4000-8000-00000000001${event_type === 'payment.created' ? '2' : '3'}`,
          event_type,
          event_version: '1',
          created_at: new Date().toISOString(),
          application_ref: applicationRef,
          payment_ref: 'pay_early',
          intent_ref: 'intent_early',
          product_ref: null,
          merchant_order_ref: order.orderId,
          reference_currency: 'USD',
          reference_amount_minor: '900',
          marco_amount_minor: '2840000',
          status: event_type === 'payment.created' ? 'CREATED' : 'PENDING',
          test_mode: false,
          receipt_ref: null,
        },
      })
      expect(result.activated).toBe(false)
      expect(result.effect).toBe('acknowledged')
    }
    expect(getMarcoPayOrder(order.orderId)?.state).toBe('CREATED')
  })
})
