import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({ get: vi.fn(), head: vi.fn(), put: vi.fn(), list: vi.fn() }))
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
  hydrateFeaturedOrder: vi.fn(async () => null),
  persistFeaturedOrderDurably: vi.fn(),
  updateFeaturedOrder: vi.fn(),
}))
vi.mock('lib/monetization/packages', async () => {
  const actual = await vi.importActual<typeof import('lib/monetization/packages')>('lib/monetization/packages')
  return {
    ...actual,
    getFeaturedPackage: () => ({ id: 'featured_24h', durationMs: 86_400_000, usdPrice: 29 }),
    getVisibilityPackage: () => ({ id: 'trend_1h', durationMs: 3_600_000, usdPrice: 9 }),
  }
})
vi.mock('lib/monetization/trendBoostOrders', () => {
  const orders = new Map<string, any>()
  return {
    clearTrendBoostOrdersForTests: () => orders.clear(),
    getTrendBoostOrder: (id: string) => orders.get(id) ?? null,
    hydrateTrendBoostOrder: async (id: string) => orders.get(id) ?? null,
    createTrendBoostOrder: (input: any) => {
      const order = {
        orderId: `legacy_${orders.size + 1}`,
        state: 'DRAFT',
        receiptVerified: false,
        paymentStatus: 'none',
        treasuryWallet: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
        chainId: 56,
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

const paidState = {
  status: 'COMPLETED',
  completed: true,
  testMode: false,
  receiptRef: 'rcp_recon_1',
  merchantOrderRef: null as string | null,
  referenceAmountMinor: '900',
  marcoAmountMinor: '2840000',
  destinationWallet: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  chainId: 56,
  txHash: '0xabc',
}

vi.mock('../gateway', async () => {
  const actual = await vi.importActual<typeof import('../gateway')>('../gateway')
  return {
    ...actual,
    readMarcoPaySettlementState: vi.fn(async () => paidState),
  }
})

describe('MARCO Pay reconciliation', () => {
  let createMarcoPayOrder: (input: any) => Promise<any>
  let reconcileMarcoPayOrder: (orderRef: string) => Promise<any>
  let getTrendBoostOrder: (id: string) => any
  let clearMarcoPayOrdersForTests: () => void
  let clearTrendBoostOrdersForTests: () => void

  beforeAll(async () => {
    ;({ createMarcoPayOrder, reconcileMarcoPayOrder, clearMarcoPayOrdersForTests } = await import('../orders'))
    ;({ getTrendBoostOrder, clearTrendBoostOrdersForTests } = await import('lib/monetization/trendBoostOrders'))
  })

  beforeEach(() => {
    process.env.MARCO_PAY_ORDERS_DIR = '/private/tmp/melega-marco-pay-recon-test'
    process.env.TREND_BOOST_ORDERS_DIR = '/private/tmp/melega-marco-pay-recon-trend-test'
    paidState.merchantOrderRef = null
    clearMarcoPayOrdersForTests()
    clearTrendBoostOrdersForTests()
  })

  afterEach(() => {
    clearMarcoPayOrdersForTests()
    clearTrendBoostOrdersForTests()
  })

  it('fulfils once after a lost callback when MARCO reports paid settlement', async () => {
    const order = await createMarcoPayOrder({
      applicationRef: 'app_sedafoqw6qlxyxb9l8ds',
      projectId: 'mm72',
      buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
      serviceId: 'trend-boost',
      packageId: 'trend_1h',
    })
    paidState.merchantOrderRef = order.orderId
    const { updateMarcoPayOrder } = await import('../orders')
    await updateMarcoPayOrder(order.orderId, {
      paymentRef: 'pay_recon_1',
      marcoAmountMinor: '2840000',
      destinationWallet: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
      chainId: 56,
    })
    const first = await reconcileMarcoPayOrder(order.orderId)
    const second = await reconcileMarcoPayOrder(order.orderId)
    expect(first?.state).toBe('ACTIVE')
    expect(second?.activatedAt).toBe(first?.activatedAt)
    expect(getTrendBoostOrder(order.legacyOrderId)?.state).toBe('ACTIVE')
  })
})
