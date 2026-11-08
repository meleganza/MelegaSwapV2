import { createHmac } from 'crypto'
import { describe, expect, it, vi } from 'vitest'
import {
  confirmPassportMcredits,
  DEX_MCREDITS_CONSUMER,
  DEX_MCREDITS_PROTOCOL_VERSION,
  mcreditsCapability,
  releasePassportMcredits,
  reservePassportMcredits,
} from '../server'

const env = {
  MARCO_CREDITS_ENDPOINT: 'https://passport.example',
  MARCO_CONNECT_APPLICATION_REF: 'app_dex',
  MARCO_PAY_API_KEY: 'secret',
  MARCO_CREDITS_ENABLED: 'true',
}
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })

describe('DEX Passport M-Credits consumer', () => {
  it('is disabled without explicit credentials and opt-in', () => {
    expect(mcreditsCapability({ env: {} })).toEqual({ enabled: false, gate: 'PASSPORT_MCREDITS_NOT_CONFIGURED' })
    expect(mcreditsCapability({ env: { ...env, MARCO_CREDITS_ENABLED: 'false' } })).toEqual({ enabled: false, gate: 'PASSPORT_MCREDITS_DISABLED' })
  })

  it('requires customer authorization and an exact positive amount', async () => {
    const fetch = vi.fn<[string, RequestInit?], Promise<Response>>()
    await expect(reservePassportMcredits({ customerAuthorization: null, orderRef: 'swap:1', amountMinor: '100', item: 'DEX' }, { env, fetch }))
      .resolves.toEqual({ ok: false, gate: 'PASSPORT_ORDER_AUTHORIZATION_REQUIRED' })
    await expect(reservePassportMcredits({ customerAuthorization: 'token', orderRef: 'swap:1', amountMinor: '0', item: 'DEX' }, { env, fetch }))
      .resolves.toEqual({ ok: false, gate: 'PASSPORT_MCREDITS_REFUSED' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('signs the versioned idempotent reservation', async () => {
    const fetch = vi.fn<[string, RequestInit?], Promise<Response>>(async () => json({ ok: true, payment: { payment_id: 'pay_1' } }))
    await expect(reservePassportMcredits({ customerAuthorization: 'token', orderRef: 'swap:1', amountMinor: '2500', item: 'DEX order' }, {
      env, fetch, now: () => 1_700_000_000_000,
    })).resolves.toEqual({ ok: true, paymentId: 'pay_1', status: 'RESERVED' })
    const [url, init] = fetch.mock.calls[0]!
    const body = String(init?.body)
    expect(url).toBe('https://passport.example/api/public/mcredits/order/reserve')
    expect(JSON.parse(body)).toMatchObject({
      protocol_version: DEX_MCREDITS_PROTOCOL_VERSION,
      consumer: DEX_MCREDITS_CONSUMER,
      merchant_order_ref: 'swap:1',
      amount_minor: '2500',
      customer_authorization: 'token',
    })
    expect((init?.headers as Record<string, string>)['marco-signature']).toBe(
      createHmac('sha256', 'secret').update(`v1.1700000000.${body}`).digest('hex'),
    )
  })

  it('confirms or compensates the same authority reservation', async () => {
    const fetch = vi.fn<[string, RequestInit?], Promise<Response>>(async () => json({ ok: true, payment: { payment_id: 'pay_1' } }))
    await expect(confirmPassportMcredits('pay_1', { env, fetch })).resolves.toEqual({ ok: true, paymentId: 'pay_1', status: 'CONFIRMED' })
    await expect(releasePassportMcredits('pay_1', 'ORDER_FAILED', { env, fetch })).resolves.toEqual({ ok: true, paymentId: 'pay_1', status: 'RELEASED' })
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      'https://passport.example/api/public/mcredits/order/confirm',
      'https://passport.example/api/public/mcredits/order/release',
    ])
  })

  it('fails closed on refusal and outage', async () => {
    const refused = vi.fn<[string, RequestInit?], Promise<Response>>(async () => json({ ok: false }, 409))
    await expect(reservePassportMcredits({ customerAuthorization: 'token', orderRef: 'swap:1', amountMinor: '100', item: 'DEX' }, { env, fetch: refused }))
      .resolves.toEqual({ ok: false, gate: 'PASSPORT_MCREDITS_REFUSED' })
    const outage = vi.fn<[string, RequestInit?], Promise<Response>>(async () => { throw new Error('offline') })
    await expect(confirmPassportMcredits('pay_1', { env, fetch: outage })).resolves.toEqual({ ok: false, gate: 'PASSPORT_MCREDITS_UNREACHABLE' })
  })
})
