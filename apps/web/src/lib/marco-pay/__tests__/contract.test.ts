import { createHmac } from 'crypto'
import { describe, expect, it } from 'vitest'
import {
  MARCO_PAY_HEADERS,
  MarcoPayVerificationError,
  verifyMarcoPayWebhook,
  type MarcoPayCompletedEvent,
} from '../contract'

const secret = 'test_secret_only'
const applicationRef = 'app_sedafoqw6qlxyxb9l8ds'
const now = 1_786_770_000

function fixture(overrides: Partial<MarcoPayCompletedEvent> = {}): MarcoPayCompletedEvent {
  return {
    event_id: '00000000-0000-4000-8000-000000000001',
    event_type: 'payment.completed',
    event_version: '1',
    created_at: '2026-08-15T05:00:00.000Z',
    application_ref: applicationRef,
    payment_ref: 'pay_test_1',
    intent_ref: 'intent_test_1',
    product_ref: null,
    merchant_order_ref: 'mp_test_1',
    reference_currency: 'USD',
    reference_amount_minor: '900',
    marco_amount_minor: '2840000',
    status: 'COMPLETED',
    test_mode: true,
    receipt_ref: 'receipt_test_1',
    ...overrides,
  }
}

function signed(event = fixture(), timestamp = String(now)) {
  const rawBody = Buffer.from(JSON.stringify(event))
  const digest = createHmac('sha256', secret).update(`v1.${timestamp}.${rawBody.toString('utf8')}`).digest('hex')
  return {
    rawBody,
    headers: {
      eventId: event.event_id,
      eventType: event.event_type,
      timestamp,
      signature: `v1=${digest}`,
      signatureVersion: 'v1',
    },
  }
}

describe('MARCO Pay MP103 webhook contract', () => {
  it('verifies the exact raw body and canonical v1 signing input', () => {
    const input = signed()
    expect(
      verifyMarcoPayWebhook({ ...input, secret, expectedApplicationRef: applicationRef, nowSeconds: now }),
    ).toMatchObject({ payment_ref: 'pay_test_1', test_mode: true })
  })

  it('rejects a tampered body', () => {
    const input = signed()
    input.rawBody = Buffer.from(input.rawBody.toString('utf8').replace('900', '901'))
    expect(() =>
      verifyMarcoPayWebhook({ ...input, secret, expectedApplicationRef: applicationRef, nowSeconds: now }),
    ).toThrowError(MarcoPayVerificationError)
  })

  it('rejects stale timestamps, wrong applications and header/body mismatches', () => {
    const stale = signed(fixture(), String(now - 301))
    expect(() =>
      verifyMarcoPayWebhook({ ...stale, secret, expectedApplicationRef: applicationRef, nowSeconds: now }),
    ).toThrow('freshness')

    const wrongApplication = signed(fixture({ application_ref: 'app_otherreference01' }))
    expect(() =>
      verifyMarcoPayWebhook({ ...wrongApplication, secret, expectedApplicationRef: applicationRef, nowSeconds: now }),
    ).toThrow('application')

    const mismatch = signed()
    mismatch.headers.eventId = 'different-event'
    expect(() =>
      verifyMarcoPayWebhook({ ...mismatch, secret, expectedApplicationRef: applicationRef, nowSeconds: now }),
    ).toThrow('headers')
  })

  it('uses only the canonical lowercase header names', () => {
    expect(MARCO_PAY_HEADERS).toEqual({
      eventId: 'marco-event-id',
      eventType: 'marco-event-type',
      timestamp: 'marco-timestamp',
      signature: 'marco-signature',
      signatureVersion: 'marco-signature-version',
    })
  })
})
