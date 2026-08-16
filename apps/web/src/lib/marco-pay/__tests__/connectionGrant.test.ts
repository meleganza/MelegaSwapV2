import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  CONNECTION_GRANT_TOKEN_PATTERN,
  MARCO_CONNECTION_GRANT_EXCHANGE_URL,
  MELEGA_DEX_CANONICAL_CALLBACK,
  clearConnectionGrantForTests,
  consumeInboundConnectionGrant,
  evaluateInboundConnectionGrant,
  isTrustedMarcoExchangeUrl,
  parseConnectionGrantPayload,
  resolveMarcoPayWebhookSecret,
} from '../connectionGrant'

vi.mock('@vercel/blob', () => ({ get: vi.fn(), put: vi.fn() }))

const applicationRef = 'app_sedafoqw6qlxyxb9l8ds'
const token = `mcg_${'ab'.repeat(32)}`
const secret = 'whsec_test_only_never_public'
const WEB = path.resolve(__dirname, '../../../')

function grantBody(overrides: Record<string, unknown> = {}) {
  return Buffer.from(
    JSON.stringify({
      type: 'marco.connection_grant',
      version: 'MP121_CONNECTION_GRANT_V1',
      application_ref: applicationRef,
      callback_url: MELEGA_DEX_CANONICAL_CALLBACK,
      environment: 'production',
      exchange_url: MARCO_CONNECTION_GRANT_EXCHANGE_URL,
      connection_grant: token,
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      ...overrides,
    }),
  )
}

function inbound(overrides: Record<string, unknown> = {}) {
  return parseConnectionGrantPayload(grantBody(overrides), token)!
}

describe('MARCO Pay connection grant consumer', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MARCO_PAY_APPLICATION = applicationRef
    process.env.MARCO_PAY_CONNECTION_DIR = '/private/tmp/melega-marco-pay-connection-test'
    delete process.env.MARCO_PAY_WEBHOOK_SECRET
    delete process.env.BLOB_READ_WRITE_TOKEN
    clearConnectionGrantForTests()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    clearConnectionGrantForTests()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('accepts a valid single-use bound grant and hides the signing secret from the HTTP result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        expect(url).toBe(MARCO_CONNECTION_GRANT_EXCHANGE_URL)
        expect(String((init.headers as Record<string, string>).authorization)).toBe(`Bearer ${token}`)
        const presented = JSON.parse(String(init.body))
        expect(presented).toEqual({
          application_ref: applicationRef,
          callback_url: MELEGA_DEX_CANONICAL_CALLBACK,
          environment: 'production',
        })
        return new Response(
          JSON.stringify({
            ok: true,
            webhook_signing_secret: secret,
            secret_version: 3,
            consumed_at: '2026-08-16T16:00:00.000Z',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }),
    )
    const result = await consumeInboundConnectionGrant({
      rawBody: grantBody(),
      headerToken: token,
      expectedApplicationRef: applicationRef,
      nodeEnv: 'production',
    })
    expect(result).toEqual({ ok: true, status: 200, body: { received: true, connected: true } })
    expect(JSON.stringify(result)).not.toContain(secret)
    expect(JSON.stringify(result)).not.toContain(token)
    expect(await resolveMarcoPayWebhookSecret()).toBe(secret)
  })

  it('rejects a second exchange', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: false, error_code: 'GRANT_REPLAYED' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )
    const result = await consumeInboundConnectionGrant({
      rawBody: grantBody(),
      headerToken: token,
      expectedApplicationRef: applicationRef,
      nodeEnv: 'production',
    })
    expect(result.status).toBe(409)
    expect(result.body).toEqual({ received: true, connected: false, error: 'GRANT_REPLAYED' })
    expect(await resolveMarcoPayWebhookSecret()).toBeNull()
  })

  it('rejects an expired grant before calling MARCO', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(
      evaluateInboundConnectionGrant({
        payload: inbound({ expires_at: new Date(Date.now() - 1000).toISOString() }),
        expectedApplicationRef: applicationRef,
        nowMs: Date.now(),
        nodeEnv: 'production',
      }).error_code,
    ).toBe('GRANT_EXPIRED')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects the wrong application', () => {
    expect(
      evaluateInboundConnectionGrant({
        payload: inbound({ application_ref: 'app_otherreference01' }),
        expectedApplicationRef: applicationRef,
        nodeEnv: 'production',
      }).error_code,
    ).toBe('WRONG_APPLICATION')
  })

  it('rejects the wrong callback', () => {
    expect(
      evaluateInboundConnectionGrant({
        payload: inbound({ callback_url: 'https://example.com/hook' }),
        expectedApplicationRef: applicationRef,
        nodeEnv: 'production',
      }).error_code,
    ).toBe('WRONG_CALLBACK')
  })

  it('rejects the wrong environment', () => {
    expect(
      evaluateInboundConnectionGrant({
        payload: inbound({ environment: 'sandbox' }),
        expectedApplicationRef: applicationRef,
        nodeEnv: 'production',
      }).error_code,
    ).toBe('WRONG_ENVIRONMENT')
  })

  it('never fetches an untrusted exchange URL', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(isTrustedMarcoExchangeUrl('https://evil.example/api/machine/pay/connection-grants/exchange')).toBe(false)
    const result = await consumeInboundConnectionGrant({
      rawBody: grantBody({ exchange_url: 'https://evil.example/api/machine/pay/connection-grants/exchange' }),
      headerToken: token,
      expectedApplicationRef: applicationRef,
      nodeEnv: 'production',
    })
    expect(result.body.error).toBe('UNTRUSTED_EXCHANGE')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a missing or malformed grant token', () => {
    expect(CONNECTION_GRANT_TOKEN_PATTERN.test('not-a-grant')).toBe(false)
    expect(
      evaluateInboundConnectionGrant({
        payload: parseConnectionGrantPayload(grantBody({ connection_grant: '' }), '')!,
        expectedApplicationRef: applicationRef,
        nodeEnv: 'production',
      }).error_code,
    ).toBe('MISSING_GRANT')
    expect(
      evaluateInboundConnectionGrant({
        payload: inbound({ connection_grant: 'mcg_zzzz' }),
        expectedApplicationRef: applicationRef,
        nodeEnv: 'production',
      }).error_code,
    ).toBe('INVALID_GRANT')
  })

  it('keeps the raw signing secret and grant token out of frontend payloads', () => {
    const checkout = readFileSync(path.join(WEB, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')
    const marcoPay = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoPay.tsx'), 'utf8')
    const connect = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')
    const readiness = readFileSync(path.join(WEB, 'lib/marco-pay/readiness.ts'), 'utf8')
    const webhook = readFileSync(path.join(WEB, 'pages/api/marco-pay/webhook.ts'), 'utf8')
    for (const source of [checkout, marcoPay, connect, readiness]) {
      expect(source).not.toContain('webhook_signing_secret')
      expect(source).not.toContain('webhookSigningSecret')
      expect(source).not.toMatch(/mcg_[0-9a-f]{64}/)
      expect(source).not.toContain('whsec_')
    }
    expect(webhook).toContain('consumeInboundConnectionGrant')
    expect(webhook.indexOf('isConnectionGrantRequest')).toBeLessThan(webhook.indexOf('resolveMarcoPayWebhookSecret'))
    expect(readiness).toContain('secretConfigured')
    expect(readiness).not.toContain('webhookSigningSecret')
  })
})
