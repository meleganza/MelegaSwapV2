import { signMarcoPayMerchantRequest } from '../marco-pay/gateway'
import type { MelegaDexReferralG2SettlementEvidence } from './g2'

const REVIEW_STATES = new Set(['PENDING_CLAIM', 'CLAIM_REQUESTED', 'EXPIRED'])

export type MelegaDexG2SubmitResult =
  | { ok: true; status: string; accrualId: string; duplicate: boolean }
  | {
      ok: false
      gate:
        | 'G2_DISABLED'
        | 'G2_CONFIG_INCOMPLETE'
        | 'G2_APPLICATION_MISMATCH'
        | 'G2_AUTHORITY_REFUSED'
        | 'G2_AUTHORITY_UNAVAILABLE'
        | 'G2_AUTHORITY_RESPONSE_INVALID'
    }

export async function submitMelegaDexReferralG2Settlement(
  evidence: MelegaDexReferralG2SettlementEvidence,
  options: { fetchImpl?: typeof fetch; nowSeconds?: number } = {},
): Promise<MelegaDexG2SubmitResult> {
  if (process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENABLED !== 'true') {
    return { ok: false, gate: 'G2_DISABLED' }
  }
  const endpoint = (process.env.MARCO_REFERRAL_G2_SETTLEMENT_ENDPOINT || '').trim()
  const applicationId = (process.env.MARCO_REFERRAL_G2_APPLICATION_ID || '').trim().toLowerCase()
  const applicationRef = (process.env.MARCO_REFERRAL_G2_APPLICATION_REF || '').trim()
  const secret = (process.env.MARCO_REFERRAL_G2_SIGNING_SECRET || '').trim()
  if (!endpoint || !applicationId || !applicationRef || !secret) {
    return { ok: false, gate: 'G2_CONFIG_INCOMPLETE' }
  }
  if (evidence.application_id !== applicationId) {
    return { ok: false, gate: 'G2_APPLICATION_MISMATCH' }
  }

  let url: URL
  try {
    url = new URL(endpoint)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return { ok: false, gate: 'G2_CONFIG_INCOMPLETE' }
    }
  } catch {
    return { ok: false, gate: 'G2_CONFIG_INCOMPLETE' }
  }

  const rawBody = JSON.stringify(evidence)
  const signed = signMarcoPayMerchantRequest({
    rawBody,
    secret,
    timestampSeconds: options.nowSeconds ?? Math.floor(Date.now() / 1000),
  })
  let response: Response
  try {
    response = await (options.fetchImpl || fetch)(url.toString(), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'marco-application': applicationRef,
        'marco-timestamp': signed.timestamp,
        'marco-signature': signed.signature,
      },
      body: rawBody,
      signal:
        typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(4_000)
          : undefined,
    })
  } catch {
    return { ok: false, gate: 'G2_AUTHORITY_UNAVAILABLE' }
  }
  if (!response.ok) {
    return { ok: false, gate: response.status >= 500 ? 'G2_AUTHORITY_UNAVAILABLE' : 'G2_AUTHORITY_REFUSED' }
  }

  let payload: any
  try {
    payload = await response.json()
  } catch {
    return { ok: false, gate: 'G2_AUTHORITY_RESPONSE_INVALID' }
  }
  const row = payload?.accrual
  const status = typeof row?.status === 'string' ? row.status : ''
  const accrualId = typeof row?.accrual_id === 'string' ? row.accrual_id : ''
  if (payload?.ok !== true || !REVIEW_STATES.has(status) || !accrualId) {
    return { ok: false, gate: 'G2_AUTHORITY_RESPONSE_INVALID' }
  }
  return { ok: true, status, accrualId, duplicate: row.duplicate === true }
}
