import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearMCreditsOrdersForTests } from 'lib/mcredits/checkout'

vi.mock('lib/mcredits/checkout', async () => {
  const actual = await vi.importActual<typeof import('lib/mcredits/checkout')>('lib/mcredits/checkout')
  return {
    ...actual,
    spendMCreditsForBoost: vi.fn(async (input: { serviceId: string }) => {
      if (input.serviceId === 'featured-pool') {
        const error = Object.assign(new actual.MCreditsGatewayError('SERVICE_NOT_FULFILLABLE', 'blocked'), {
          code: 'SERVICE_NOT_FULFILLABLE',
        })
        throw error
      }
      return {
        orderId: 'mc_api',
        state: 'FULFILLED',
        serviceId: input.serviceId,
        packageId: 'featured_24h',
      }
    }),
  }
})

import handler from 'pages/api/mcredits/orders'
import { spendMCreditsForBoost } from 'lib/mcredits/checkout'

function mockRes() {
  const res = {
    statusCode: 200,
    body: null as any,
    setHeader: vi.fn(),
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res as typeof res & NextApiResponse
}

describe('M-Credits orders API', () => {
  afterEach(() => {
    clearMCreditsOrdersForTests()
    vi.mocked(spendMCreditsForBoost).mockClear()
  })

  it('rejects unfulfillable services without charging', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { 'x-marco-passport-session': 'passport_session_test' },
        body: {
          projectId: 'eyed',
          buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
          serviceId: 'featured-pool',
        },
      } as unknown as NextApiRequest,
      res,
    )
    expect(res.statusCode).toBe(409)
    expect(res.body.error).toBe('SERVICE_ACTIVATION_PENDING')
    expect(spendMCreditsForBoost).not.toHaveBeenCalled()
  })

  it('accepts Featured with a Passport session and returns a fulfilled order', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { 'x-marco-passport-session': 'passport_session_test' },
        body: {
          projectId: 'eyed',
          buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
          serviceId: 'featured',
          packageId: 'featured_24h',
        },
      } as unknown as NextApiRequest,
      res,
    )
    expect(res.statusCode).toBe(201)
    expect(res.body.order.state).toBe('FULFILLED')
    expect(res.body.payment_id).toBeNull()
    expect(res.body.approval_url).toBeNull()
    expect(spendMCreditsForBoost).toHaveBeenCalledTimes(1)
  })
})
