import type { NextApiRequest, NextApiResponse } from 'next'
import { describe, expect, it } from 'vitest'
import featuredOrderHandler from 'pages/api/featured/orders/[orderId]'
import featuredOrdersHandler from 'pages/api/featured/orders'
import trendBoostHandler from 'pages/api/trend-boost/orders'
import { RECOVERY_CAPABILITIES } from 'config/constants/recoveryCapabilities'

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
  it('keeps all uncertified money-moving capabilities disabled', () => {
    expect(RECOVERY_CAPABILITIES).toEqual({
      separateSmartSwapProtocolFee: false,
      commercialPaymentActivation: false,
      createTokenExecution: false,
    })
  })

  it('rejects a Featured quote before order lookup or wallet preparation', async () => {
    const { state, response } = mockResponse()
    await featuredOrderHandler(
      {
        method: 'POST',
        query: { orderId: 'not-required-while-contained' },
        body: { action: 'quote' },
      } as unknown as NextApiRequest,
      response,
    )
    expect(state.statusCode).toBe(503)
    expect(state.body).toMatchObject({ error: 'PAYMENT_VERIFICATION_UNAVAILABLE' })
  })

  it('does not create dead Featured orders while payment activation is contained', async () => {
    const { state, response } = mockResponse()
    await featuredOrdersHandler(
      {
        method: 'POST',
        query: {},
        body: {
          projectId: 'project',
          buyerWallet: '0x1111111111111111111111111111111111111111',
          projectSlug: 'project',
        },
      } as unknown as NextApiRequest,
      response,
    )
    expect(state.statusCode).toBe(503)
    expect(state.body).toMatchObject({ error: 'PAYMENT_VERIFICATION_UNAVAILABLE' })
  })

  it('rejects Trend Boost confirmation without activating an order', async () => {
    const { state, response } = mockResponse()
    await trendBoostHandler(
      {
        method: 'POST',
        query: {},
        body: { action: 'confirm', orderId: 'untrusted-client-order' },
      } as unknown as NextApiRequest,
      response,
    )
    expect(state.statusCode).toBe(503)
    expect(state.body).toMatchObject({ error: 'PAYMENT_VERIFICATION_UNAVAILABLE' })
  })
})
