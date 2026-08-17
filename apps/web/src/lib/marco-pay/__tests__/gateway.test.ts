import { createHmac } from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MARCO_PAY_CREATE_PATH,
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

  it('signs v1.<timestamp>.<raw_body> and never puts the secret in the request', async () => {
    const rawBody = buildMarcoPayCreateBody({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
    })
    const expected = signedFor(rawBody)
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      expect(String(url)).toContain(MARCO_PAY_CREATE_PATH)
      expect(headers.get('marco-application')).toBe(applicationRef)
      expect(headers.get('marco-timestamp')).toBe(expected.timestamp)
      expect(headers.get('marco-signature')).toBe(expected.signature)
      expect(headers.get('marco-signature')).toBe(
        `v1=${createHmac('sha256', secret).update(`v1.${now}.${rawBody}`).digest('hex')}`,
      )
      expect(JSON.stringify(Object.fromEntries(headers.entries()))).not.toContain(secret)
      expect(String(init?.body)).toBe(rawBody)
      return new Response(
        JSON.stringify({
          ok: true,
          payment_id: 'pay_live_intent_1',
          approval_url: 'https://marco.melega.ai/pay/pay_live_intent_1',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
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
    expect(session.paymentId).toBe('pay_live_intent_1')
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_live_intent_1')
    expect(session.source).toBe('create')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('falls back to /api/public/pay/session when create returns GATEWAY_INVALID_REQUEST', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes(MARCO_PAY_CREATE_PATH)) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'GATEWAY_INVALID_REQUEST',
            message: 'The request body is not a valid MARCO Pay create request.',
          }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        )
      }
      expect(String(url)).toContain(MARCO_PAY_SESSION_PATH)
      return new Response(
        JSON.stringify({ ok: true, payment_id: 'pay_session_intent_1' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
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
    expect(session.paymentId).toBe('pay_session_intent_1')
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_session_intent_1')
    expect(session.source).toBe('session')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
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

  it('surfaces SESSION_SIGNATURE_INVALID from a signed create refusal', async () => {
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
