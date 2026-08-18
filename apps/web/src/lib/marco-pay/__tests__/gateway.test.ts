import { createHmac } from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MARCO_PAY_SESSION_PATH,
  buildMarcoPayCreateBody,
  createMarcoPayPaymentSession,
  quoteMarcoPayConversion,
  signMarcoPayMerchantRequest,
  MarcoPayGatewayError,
} from '../gateway'

const applicationRef = 'app_sedafoqw6qlxyxb9l8ds'
const secret = 'test_merchant_secret_only'
const merchantApiKey = 'mpk_test_not_for_production'
const now = 1_786_770_000

function signedFor(rawBody: string) {
  return signMarcoPayMerchantRequest({ rawBody, secret, timestampSeconds: now })
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } })
}

describe('MARCO Pay merchant session', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.MARCO_DEX_RECEIVING_WALLET
    delete process.env.MARCO_TREASURY_SETTLEMENT_WALLET
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
    expect(rawBody).not.toContain('marco_amount_minor')
    expect(() =>
      buildMarcoPayCreateBody({
        applicationRef,
        merchantOrderRef: 'bad',
        amountMinor: '900',
        currency: 'USD',
      }),
    ).toThrowError(MarcoPayGatewayError)
  })

  it('POSTs HMAC-signed /api/public/pay/session with Bearer merchant key and never puts secrets in the body', async () => {
    const rawBody = buildMarcoPayCreateBody({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      item: 'trend-boost',
    })
    const expected = signedFor(rawBody)
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('/api/public/pay/state')) {
        return jsonResponse({
          ok: true,
          marco_amount_minor: '2840000',
          receiving_wallet: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
          chain_id: 56,
        })
      }
      const headers = new Headers(init?.headers)
      expect(String(url)).toBe('https://marco.melega.ai/api/public/pay/session')
      expect(String(url)).toContain(MARCO_PAY_SESSION_PATH)
      expect(headers.get('marco-application')).toBe(applicationRef)
      expect(headers.get('authorization')).toBe(`Bearer ${merchantApiKey}`)
      expect(headers.get('marco-timestamp')).toBe(expected.timestamp)
      expect(headers.get('marco-signature')).toBe(expected.signature)
      expect(headers.get('marco-signature')).toBe(
        `v1=${createHmac('sha256', secret).update(`v1.${now}.${rawBody}`).digest('hex')}`,
      )
      expect(JSON.stringify(Object.fromEntries(headers.entries()))).not.toContain(secret)
      expect(String(init?.body)).not.toContain(merchantApiKey)
      expect(String(init?.body)).toBe(rawBody)
      expect(JSON.parse(String(init?.body))).toEqual({
        application_ref: applicationRef,
        merchant_order_ref: 'mp_probe_intent_1',
        amount_minor: '900',
        currency: 'USD',
        item: 'trend-boost',
      })
      return jsonResponse({
        ok: true,
        payment_id: 'pay_live_session_1',
        approval_url: 'https://marco.melega.ai/pay/pay_live_session_1',
      })
    })

    const session = await createMarcoPayPaymentSession({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      item: 'trend-boost',
      secret,
      merchantApiKey,
      nowSeconds: now,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(session.paymentId).toBe('pay_live_session_1')
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_live_session_1')
    expect(session.marcoAmountMinor).toBe('2840000')
    expect(session.destinationWallet).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(session.chainId).toBe(56)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('builds approval_url from payment_id when MARCO omits it', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('/api/public/pay/state')) return jsonResponse({ ok: true })
      return jsonResponse({ ok: true, payment_id: 'pay_derived_1' })
    })
    const session = await createMarcoPayPaymentSession({
      applicationRef,
      merchantOrderRef: 'mp_probe_intent_1',
      amountMinor: '900',
      currency: 'USD',
      secret,
      merchantApiKey,
      nowSeconds: now,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(session.approvalUrl).toBe('https://marco.melega.ai/pay/pay_derived_1')
    expect(session.destinationWallet).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(session.chainId).toBe(56)
  })

  it('refuses a test-mode session so checkout never settles without moving MARCO', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({
        ok: true,
        payment_id: 'pay_test_only',
        test_mode: true,
      })
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        merchantApiKey,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'LIVE_SETTLEMENT_REQUIRED' })
  })

  it('does not refuse a label-only public quote without a MARCO minor amount', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({
        ok: true,
        quote: { amountLabel: 'USD 79', marcoAmountLabel: '79 MARCO' },
      })
    })
    await expect(
      quoteMarcoPayConversion({
        applicationRef,
        amountMinor: '7900',
        currency: 'USD',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toBeUndefined()
  })

  it('rejects a quote that copies USD minor units as the MARCO quantity', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({
        ok: true,
        quote: { amountLabel: 'USD 79', marcoAmountLabel: '79 MARCO', marco_amount_minor: '7900' },
      })
    })
    await expect(
      quoteMarcoPayConversion({
        applicationRef,
        amountMinor: '7900',
        currency: 'USD',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'MARCO_CONVERSION_INVALID' })
  })

  it('rejects a session that settles to a sentinel wallet', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({
        ok: true,
        payment_id: 'pay_sentinel',
        receiving_wallet: '0xdE00000000000000000000000000000000000001',
      })
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        merchantApiKey,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'SETTLEMENT_WALLET_NOT_TREASURY' })
  })

  it('rejects a session that copies the USD amount as the MARCO quantity', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({
        ok: true,
        payment_id: 'pay_copied_usd',
        marco_amount_minor: '900',
      })
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        merchantApiKey,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'MARCO_CONVERSION_INVALID' })
  })

  it('does not mark a payment completed and fails closed without a payment_id', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse({ ok: true, status: 'PAID' })
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        merchantApiKey,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'NOT_EXECUTABLE' })
  })

  it('surfaces SESSION_SIGNATURE_INVALID from MARCO', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse(
        {
          ok: false,
          error: 'SESSION_SIGNATURE_INVALID',
          message: 'This checkout authorization is not valid.',
        },
        401,
      )
    })
    await expect(
      createMarcoPayPaymentSession({
        applicationRef,
        merchantOrderRef: 'mp_probe_intent_1',
        amountMinor: '900',
        currency: 'USD',
        secret,
        merchantApiKey,
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
        merchantApiKey,
        nowSeconds: now,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'SECRET_UNAVAILABLE' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('refuses to call MARCO when the merchant API key is missing', async () => {
    const fetchImpl = vi.fn()
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
    ).rejects.toMatchObject({ code: 'MERCHANT_KEY_UNAVAILABLE' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
