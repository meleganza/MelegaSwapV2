import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  activateVerifiedTrendBoostWindow,
  clearTrendBoostOrdersForTests,
  createTrendBoostOrder,
  listActiveTrendBoostOrders,
  updateTrendBoostOrder,
} from '../trendBoostOrders'

describe('Trend Boost activation guard', () => {
  beforeEach(() => clearTrendBoostOrdersForTests())
  afterEach(() => clearTrendBoostOrdersForTests())

  it('cannot activate an order without a server-verified receipt', () => {
    const order = createTrendBoostOrder({
      projectId: 'project-1',
      projectSlug: 'project-1',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'BNB',
    })
    expect(activateVerifiedTrendBoostWindow(order.orderId)).toBeNull()
  })

  it('activates only after receipt verification and confirmed payment state', () => {
    const order = createTrendBoostOrder({
      projectId: 'project-2',
      projectSlug: 'project-2',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'USDT',
    })
    updateTrendBoostOrder(order.orderId, {
      state: 'PAYMENT_CONFIRMED',
      paymentStatus: 'confirmed',
      receiptVerified: true,
    })
    const activated = activateVerifiedTrendBoostWindow(order.orderId)
    expect(activated).toMatchObject({ state: 'ACTIVE', receiptVerified: true, paymentStatus: 'confirmed' })
    expect(activated?.scheduledStart).toBeTruthy()
    expect(activated?.scheduledEnd).toBeTruthy()
    expect(listActiveTrendBoostOrders()).toHaveLength(1)
  })

  it('removes an expired verified order from the public active feed', () => {
    const order = createTrendBoostOrder({
      projectId: 'project-expired',
      projectSlug: 'project-expired',
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'BNB',
    })
    updateTrendBoostOrder(order.orderId, {
      state: 'ACTIVE',
      paymentStatus: 'confirmed',
      receiptVerified: true,
      scheduledStart: '2026-01-01T00:00:00.000Z',
      scheduledEnd: '2026-01-01T01:00:00.000Z',
    })
    expect(listActiveTrendBoostOrders(new Date('2026-01-01T02:00:00.000Z'))).toHaveLength(0)
  })
})
