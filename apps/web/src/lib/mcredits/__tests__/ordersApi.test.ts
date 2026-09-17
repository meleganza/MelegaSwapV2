import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from 'pages/api/mcredits/orders'
import { clearMCreditsOrdersForTests } from 'lib/mcredits/checkout'

vi.mock('lib/mcredits/checkout', async () => {
  const actual = await vi.importActual<typeof import('lib/mcredits/checkout')>('lib/mcredits/checkout')
  return actual
})

function mockRes() {
  const res: any = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(key: string, value: string) {
      this.headers[key] = value
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res
}

describe('M-Credits orders API', () => {
  afterEach(() => {
    clearMCreditsOrdersForTests()
  })

  it('rejects blocked services without contacting a ledger', async () => {
    const req: any = {
      method: 'POST',
      headers: { 'x-marco-passport-session': 'passport_session_test' },
      body: {
        projectId: 'eyed',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'featured-pool',
        packageId: 'featured_pool_24h',
      },
    }
    const res = mockRes()
    await handler(req, res)
    expect(res.statusCode).toBe(409)
    expect(res.body.error).toBe('SERVICE_ACTIVATION_PENDING')
  })

  it('requires a Passport session instead of succeeding silently', async () => {
    const req: any = {
      method: 'POST',
      headers: {},
      body: {
        projectId: 'mm72',
        buyerWallet: '0x8fc8ac2af31c67c704da79dc454a6a29507f8fed',
        serviceId: 'trend-boost',
        packageId: 'trend_24h',
      },
    }
    const res = mockRes()
    await handler(req, res)
    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe('MCREDITS_IDENTITY_REQUIRED')
    expect(res.body.payment_id).toBeNull()
  })
})
