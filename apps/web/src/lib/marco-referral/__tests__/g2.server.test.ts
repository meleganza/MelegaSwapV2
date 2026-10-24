import { createHmac } from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { melegaDexReferralG2SettlementEvidence } from '../g2'
import { submitMelegaDexReferralG2Settlement } from '../g2.server'

const evidence = melegaDexReferralG2SettlementEvidence({
  applicationId: '00000000-0000-4000-8000-000000000002',
  orderId: 'dex-order-1',
  referralCode: 'FOUNDER',
  currency: 'USD',
  listedMinor: 10_000n,
  customerPaidMinor: 9_000n,
  settlementReference: 'dex-receipt-1',
})

afterEach(() => {
  delete process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENABLED
  delete process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENDPOINT
  delete process.env.MARCO_REFERRAL_G2_APPLICATION_ID
  delete process.env.MARCO_REFERRAL_G2_APPLICATION_REF
  delete process.env.MARCO_REFERRAL_G2_SIGNING_SECRET
})

function enable() {
  process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENABLED = 'true'
  process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENDPOINT = 'https://passport.example/api/public/referral/g2/settlement'
  process.env.MARCO_REFERRAL_G2_APPLICATION_ID = evidence.application_id
  process.env.MARCO_REFERRAL_G2_APPLICATION_REF = 'melega-dex-app'
  process.env.MARCO_REFERRAL_G2_SIGNING_SECRET = 'review-secret'
}

describe('Melega DEX staged G2 settlement handoff', () => {
  it('is disabled by default', async () => {
    const fetchImpl = vi.fn()
    await expect(submitMelegaDexReferralG2Settlement(evidence, { fetchImpl })).resolves.toEqual({
      ok: false,
      gate: 'G2_DISABLED',
    })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('signs exact evidence and accepts PENDING_CLAIM', async () => {
    enable()
    const nowSeconds = 1_792_843_200
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const rawBody = String(init?.body)
      const headers = new Headers(init?.headers)
      expect(headers.get('marco-application')).toBe('melega-dex-app')
      expect(headers.get('marco-timestamp')).toBe(String(nowSeconds))
      expect(headers.get('marco-signature')).toBe(
        `v1=${createHmac('sha256', 'review-secret').update(`v1.${nowSeconds}.${rawBody}`).digest('hex')}`,
      )
      expect(JSON.parse(rawBody)).toEqual(evidence)
      return new Response(JSON.stringify({ ok: true, accrual: { accrual_id: 'accrual-1', status: 'PENDING_CLAIM' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    await expect(
      submitMelegaDexReferralG2Settlement(evidence, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        nowSeconds,
      }),
    ).resolves.toEqual({ ok: true, status: 'PENDING_CLAIM', accrualId: 'accrual-1', duplicate: false })
  })

  it('refuses application mismatch and PAID authority responses', async () => {
    enable()
    process.env.MARCO_REFERRAL_G2_APPLICATION_ID = '00000000-0000-4000-8000-000000000003'
    const fetchImpl = vi.fn()
    await expect(submitMelegaDexReferralG2Settlement(evidence, { fetchImpl })).resolves.toEqual({
      ok: false,
      gate: 'G2_APPLICATION_MISMATCH',
    })
    expect(fetchImpl).not.toHaveBeenCalled()

    process.env.MARCO_REFERRAL_G2_APPLICATION_ID = evidence.application_id
    fetchImpl.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, accrual: { accrual_id: 'accrual-1', status: 'PAID' } })),
    )
    await expect(
      submitMelegaDexReferralG2Settlement(evidence, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toEqual({ ok: false, gate: 'G2_AUTHORITY_RESPONSE_INVALID' })
  })
})
