import { createHmac } from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MARCO_PAY_SESSION_PATH,
  buildMarcoPayCreateBody,
  createMarcoPayPaymentSession,
  signMarcoPayMerchantRequest,
  MarcoPayGatewayError,
} from '../gateway'

const applicationRef = 'app_sedafoqw6qlxyxb9l8ds'
const secret = 'test_merchant_secret_only'
const now = 1_786_770_000

function signedFor(rawBody: string) {
  return signMarcoPayMerchantRequest({ rawBody, secret, timestampSeconds: now })
}

describe('MARCO Pay merchant session', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('owns amount, merchant_order_ref and merchant identifier in the signed body', () => {
    const rawBody = buildMarcoPayCreateBody({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'usd',
      item: 'trend-boost',
    })
    expect(JSON.parse(rawBody)).toEqual({
      application_ref: applicationRef,
      merchant_order_ref: 'mp_probe_intent_1',
      amount_minor: '900',
      currency: 'USD',
      item: 'trend-boost',
    })
    expect(() =>
      buildMarcoPayCreateBody({
        applicationRef,
        merchantOrderRef: 'bad',
        amountMinor: '900',
        currency: 'USD',
      }),
    ).toThrowError(MarcoPayGatewayError)
  })

  it('POSTs HMAC-signed /api/public/pay/session and never puts the secret in the request', async () => {
    const rawBody = buildMarcoPayCreateBody({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      item: 'trend-boost',
    })
    const expected = signedFor(rawBody)
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      expect(String(url)).toBe('https://marco.melega.ai/api/public/pay/session')
      expect(String(url)).toContain(MARCO_PAY_SESSION_PATH)
      expect(headers.get('marco-application')).toBe(applicationRef)
      expect(headers.get('marco-timestamp')).toBe(expected.timestamp)
      expect(headers.get('marco-signature')).toBe(expected.signature)
      expect(headers.get('marco-signature')).toBe(
        `v1=${createHmac('sha256', secret).update(`v1.${now}.${rawBody}`).digest('hex')}`,
      )
      expect(JSON.stringify(Object.fromEntries(headers.entries()))).not.toContain(secret)
      expect(String(init?.body)).toBe(rawBody)
      expect(JSON.parse(String(init?.body))).toEqual({
        application_ref: applicationRef,
        merchant_order_ref: 'mp_probe_intent_1',
        amount_minor: '900',
        currency: 'USD',
        item: 'trend-boost',
      })
      return new Response(
        JSON.stringify({
          ok: true,
          payment_id: 'pay_live_session_1',
          approval_url: 'https://marco.melega.ai/pay/pay_live_session_1',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    })

    const session = await createMarcoPayPaymentSession({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      item: 'trend-boost',
      secret,
      nowSeconds: now,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(session.paymentId).toBe('pay_live_session_1')
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_live_session_1')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('builds approval_url from payment_id when MARCO omits it', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true, payment_id: 'pay_derived_1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    const session = await createMarcoPayPaymentSession({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      secret,
      nowSeconds: now,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_derived_1')
  })

  it('refuses a test-mode session so checkout never settles without moving MARCO', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          ok: true,
          payment_id: 'pay_test_only',
          test_mode: true,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'LIVE_SETTLEMENT_REQUIRED' })
  })

  it('does not mark a payment completed and fails closed without a payment_id', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true, status: 'PAID' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'NOT_EXECUTABLE' })
  })

  it('surfaces SESSION_SIGNATURE_INVALID from MARCO', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'SESSION_SIGNATURE_INVALID',
          message: 'This checkout authorization is not valid.',
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      )
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'SESSION_SIGNATURE_INVALID' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('refuses to call MARCO unsigned when the signing secret is missing', async () => {
    const fetchImpl = vi.fn()
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret: '   ',
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'SECRET_UNAVAILABLE' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
