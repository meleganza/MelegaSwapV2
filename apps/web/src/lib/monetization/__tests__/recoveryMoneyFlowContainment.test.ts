import type { NextApiRequest, NextApiResponse } from 'next'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}))
import featuredOrderHandler from 'pages/api/featured/orders/[orderId]'
import trendBoostHandler from 'pages/api/trend-boost/orders'
import { RECOVERY_CAPABILITIES } from 'config/constants/recoveryCapabilities'
import { commercialOrderStorageReady } from 'lib/featured-placement'
import { trendBoostOrderStorageReady } from 'lib/monetization/trendBoostOrders'

function mockResponse() {
  const state: { statusCode: number; body: unknown } = { statusCode: 200, body: null }
  const response = {
    status(code: number) {
      state.statusCode = code
      return response
    },
    json(body: unknown) {
      state.body = body
      return response
    },
    setHeader() {
      return response
    },
  }
  return { state, response: response as unknown as NextApiResponse }
}

describe('recovery money-flow containment', () => {
  it('enables only receipt-certified commercial payments', () => {
    expect(RECOVERY_CAPABILITIES).toEqual({
      separateSmartSwapProtocolFee: false,
      commercialPaymentActivation: true,
      createTokenExecution: true,
    })
    expect(commercialOrderStorageReady()).toBe(true)
    expect(trendBoostOrderStorageReady()).toBe(true)
  })

  it('never prepares a Featured payment for an unknown order', async () => {
    const { state, response } = mockResponse()
    await featuredOrderHandler(
      {
        method: 'POST',
        query: { orderId: 'not-required-while-contained' },
        body: { action: 'quote' },
      } as unknown as NextApiRequest,
      response,
    )
    expect(state.statusCode).toBe(404)
    expect(state.body).toMatchObject({ error: 'ORDER_NOT_FOUND' })
  })

  it('never confirms Trend Boost without a persisted order', async () => {
    const { state, response } = mockResponse()
    await trendBoostHandler(
      {
        method: 'POST',
        query: {},
        body: { action: 'confirm', orderId: 'untrusted-client-order' },
      } as unknown as NextApiRequest,
      response,
    )
    expect(state.statusCode).toBe(404)
    expect(state.body).toMatchObject({ error: 'ORDER_NOT_FOUND' })
  })
})
