import fs from 'fs'
import path from 'path'
import { get, put } from '@vercel/blob'
import { getMarcoPayApplicationRef, getMarcoPayWebhookSecret, MARCO_MACHINE_ORIGIN } from './contract'

export const MARCO_PAY_CONNECTION_GRANT_VERSIONS = [
  'MP121_CONNECTION_GRANT_V1',
  'MP122_CONNECTION_GRANT_V1',
] as const
export const CONNECTION_GRANT_TYPE = 'marco.connection_grant'
export const CONNECTION_GRANT_TOKEN_PATTERN = /^mcg_[0-9a-f]{64}$/
export const CONNECTION_GRANT_EXCHANGE_PATH = '/api/machine/pay/connection-grants/exchange'
export const MARCO_CONNECTION_GRANT_EXCHANGE_URL = `${MARCO_MACHINE_ORIGIN}${CONNECTION_GRANT_EXCHANGE_PATH}`
export const MELEGA_DEX_CANONICAL_CALLBACK = 'https://www.melega.finance/api/marco-pay/webhook/'
export const CONNECTION_GRANT_HEADER = 'marco-connection-grant'

const BINDING_KEY = 'monetization/v1/marco-pay/connection/binding.json'

export type ConnectionGrantEnvironment = 'production' | 'sandbox'

export type MarcoConnectionGrantInbound = {
  type: typeof CONNECTION_GRANT_TYPE
  version: string
  application_ref: string
  callback_url?: string
  environment?: ConnectionGrantEnvironment | string
  exchange_url?: string
  connection_grant: string
  expires_at?: string
}

export type ConnectionGrantExchangePresentation = {
  application_ref: string
  callback_url: string
  environment: ConnectionGrantEnvironment
}

type BoundWebhookSecret = {
  schema: 'melega.marco-pay-connection-binding.v1'
  applicationRef: string
  webhookUrl: string
  secretVersion: number | null
  consumedAt: string | null
  boundAt: string
  webhookSigningSecret: string
}

type GrantExchangeError =
  | 'MISSING_GRANT'
  | 'INVALID_GRANT'
  | 'GRANT_UNAVAILABLE'
  | 'GRANT_REPLAYED'
  | 'GRANT_REVOKED'
  | 'GRANT_EXPIRED'
  | 'WRONG_APPLICATION'
  | 'WRONG_CALLBACK'
  | 'WRONG_ENVIRONMENT'
  | 'UNTRUSTED_EXCHANGE'
  | 'SECRET_UNAVAILABLE'
  | 'GRANT_WRITE_FAILED'

export type ConnectionGrantConsumeResult = {
  ok: boolean
  status: number
  body: { received: boolean; connected: boolean; error?: string }
}

let memoryBinding: BoundWebhookSecret | null = null

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function dataDir(): string {
  return process.env.MARCO_PAY_CONNECTION_DIR || path.join(process.cwd(), 'data', 'marco-pay-connection')
}

function bindingPath(): string {
  return path.join(dataDir(), 'binding.json')
}

export function normalizeCallbackUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

export function isTrustedMarcoExchangeUrl(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return true
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === 'https:' &&
      url.hostname === 'marco.melega.ai' &&
      url.pathname.replace(/\/+$/, '') === CONNECTION_GRANT_EXCHANGE_PATH
    )
  } catch {
    return false
  }
}

export function isConnectionGrantToken(value: string | undefined | null): boolean {
  return CONNECTION_GRANT_TOKEN_PATTERN.test((value ?? '').trim())
}

function headerToken(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] ?? '' : value ?? '').trim()
}

export function parseConnectionGrantPayload(
  rawBody: Buffer,
  headerGrant?: string | string[],
): MarcoConnectionGrantInbound | null {
  const fromHeader = headerToken(headerGrant)
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody.toString('utf8') || '{}')
  } catch {
    parsed = null
  }
  const body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {}
  const type = typeof body.type === 'string' ? body.type.trim() : ''
  const token =
    (typeof body.connection_grant === 'string' ? body.connection_grant.trim() : '') || fromHeader
  if (type !== CONNECTION_GRANT_TYPE && !fromHeader) return null
  if (!token) {
    return {
      type: CONNECTION_GRANT_TYPE,
      version: typeof body.version === 'string' ? body.version : '',
      application_ref: typeof body.application_ref === 'string' ? body.application_ref : '',
      callback_url: typeof body.callback_url === 'string' ? body.callback_url : undefined,
      environment: typeof body.environment === 'string' ? body.environment : undefined,
      exchange_url: typeof body.exchange_url === 'string' ? body.exchange_url : undefined,
      connection_grant: '',
      expires_at: typeof body.expires_at === 'string' ? body.expires_at : undefined,
    }
  }
  return {
    type: CONNECTION_GRANT_TYPE,
    version: typeof body.version === 'string' ? body.version : '',
    application_ref: typeof body.application_ref === 'string' ? body.application_ref : '',
    callback_url: typeof body.callback_url === 'string' ? body.callback_url : undefined,
    environment: typeof body.environment === 'string' ? body.environment : undefined,
    exchange_url: typeof body.exchange_url === 'string' ? body.exchange_url : undefined,
    connection_grant: token,
    expires_at: typeof body.expires_at === 'string' ? body.expires_at : undefined,
  }
}

export function isConnectionGrantRequest(rawBody: Buffer, headerGrant?: string | string[]): boolean {
  return parseConnectionGrantPayload(rawBody, headerGrant) !== null
}

export function evaluateInboundConnectionGrant(input: {
  payload: MarcoConnectionGrantInbound
  expectedApplicationRef: string
  nowMs?: number
  nodeEnv?: string | null
}): { ok: true; token: string; presented: ConnectionGrantExchangePresentation } | { ok: false; error_code: GrantExchangeError } {
  const token = input.payload.connection_grant.trim()
  if (!token) return { ok: false, error_code: 'MISSING_GRANT' }
  if (!isConnectionGrantToken(token)) return { ok: false, error_code: 'INVALID_GRANT' }
  const applicationRef = input.payload.application_ref.trim() || input.expectedApplicationRef
  if (applicationRef !== input.expectedApplicationRef) return { ok: false, error_code: 'WRONG_APPLICATION' }
  if (
    input.payload.version &&
    !MARCO_PAY_CONNECTION_GRANT_VERSIONS.includes(
      input.payload.version as (typeof MARCO_PAY_CONNECTION_GRANT_VERSIONS)[number],
    )
  ) {
    return { ok: false, error_code: 'INVALID_GRANT' }
  }
  if (!isTrustedMarcoExchangeUrl(input.payload.exchange_url)) {
    return { ok: false, error_code: 'UNTRUSTED_EXCHANGE' }
  }
  if (
    input.payload.callback_url &&
    normalizeCallbackUrl(input.payload.callback_url) !== normalizeCallbackUrl(MELEGA_DEX_CANONICAL_CALLBACK)
  ) {
    return { ok: false, error_code: 'WRONG_CALLBACK' }
  }
  const environment: ConnectionGrantEnvironment =
    input.payload.environment === 'sandbox' || input.payload.environment === 'production'
      ? input.payload.environment
      : (input.nodeEnv ?? process.env.NODE_ENV) === 'production'
      ? 'production'
      : 'sandbox'
  if (input.payload.environment && input.payload.environment !== environment) {
    return { ok: false, error_code: 'WRONG_ENVIRONMENT' }
  }
  if ((input.nodeEnv ?? process.env.NODE_ENV) === 'production' && environment !== 'production') {
    return { ok: false, error_code: 'WRONG_ENVIRONMENT' }
  }
  if (input.payload.expires_at) {
    const expiresAt = Date.parse(input.payload.expires_at)
    if (!Number.isFinite(expiresAt) || expiresAt <= (input.nowMs ?? Date.now())) {
      return { ok: false, error_code: 'GRANT_EXPIRED' }
    }
  }
  return {
    ok: true,
    token,
    presented: {
      application_ref: input.expectedApplicationRef,
      callback_url: MELEGA_DEX_CANONICAL_CALLBACK,
      environment,
    },
  }
}

function exchangeStatus(errorCode: GrantExchangeError): number {
  if (errorCode === 'MISSING_GRANT' || errorCode === 'INVALID_GRANT') return 401
  if (
    errorCode === 'WRONG_APPLICATION' ||
    errorCode === 'WRONG_CALLBACK' ||
    errorCode === 'WRONG_ENVIRONMENT' ||
    errorCode === 'UNTRUSTED_EXCHANGE'
  ) {
    return 403
  }
  if (errorCode === 'SECRET_UNAVAILABLE' || errorCode === 'GRANT_WRITE_FAILED') return 503
  return 409
}

function publicResult(error?: GrantExchangeError): ConnectionGrantConsumeResult {
  if (!error) return { ok: true, status: 200, body: { received: true, connected: true } }
  return {
    ok: false,
    status: exchangeStatus(error),
    body: { received: true, connected: false, error },
  }
}

function persistLocal(binding: BoundWebhookSecret) {
  memoryBinding = binding
  try {
    fs.mkdirSync(dataDir(), { recursive: true })
    fs.writeFileSync(bindingPath(), JSON.stringify(binding), { encoding: 'utf8', mode: 0o600 })
  } catch {
    /* memory-only outside production */
  }
}

function readLocalBinding(): BoundWebhookSecret | null {
  if (memoryBinding?.schema === 'melega.marco-pay-connection-binding.v1') return memoryBinding
  try {
    const parsed = JSON.parse(fs.readFileSync(bindingPath(), 'utf8')) as BoundWebhookSecret
    if (parsed?.schema === 'melega.marco-pay-connection-binding.v1' && parsed.webhookSigningSecret) {
      memoryBinding = parsed
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

export async function persistBoundWebhookSecret(binding: BoundWebhookSecret): Promise<void> {
  persistLocal(binding)
  const token = blobToken()
  if (!token) {
    if (process.env.NODE_ENV === 'production') throw new Error('GRANT_WRITE_FAILED')
    return
  }
  await put(BINDING_KEY, JSON.stringify(binding), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

export async function loadBoundWebhookSecret(): Promise<string | null> {
  const local = readLocalBinding()
  if (local?.webhookSigningSecret) return local.webhookSigningSecret
  const token = blobToken()
  if (!token) return null
  try {
    const result = await get(BINDING_KEY, { access: 'private', token, useCache: false })
    if (!result || result.statusCode !== 200) return null
    const parsed = (await new Response(result.stream).json()) as BoundWebhookSecret
    if (parsed?.schema !== 'melega.marco-pay-connection-binding.v1' || !parsed.webhookSigningSecret) return null
    memoryBinding = parsed
    return parsed.webhookSigningSecret
  } catch {
    return null
  }
}

export async function resolveMarcoPayWebhookSecret(): Promise<string | null> {
  return getMarcoPayWebhookSecret() || (await loadBoundWebhookSecret())
}

function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

async function exchangeConnectionGrant(
  token: string,
  presented: ConnectionGrantExchangePresentation,
): Promise<{ ok: true; webhook_signing_secret: string; secret_version: number | null; consumed_at: string | null } | { ok: false; error_code: GrantExchangeError }> {
  const response = await fetch(MARCO_CONNECTION_GRANT_EXCHANGE_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(presented),
    signal: abortAfter(8_000),
  })
  let payload: {
    ok?: boolean
    error_code?: string
    webhook_signing_secret?: string
    secret_version?: number
    consumed_at?: string
  } = {}
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    return { ok: false, error_code: 'GRANT_UNAVAILABLE' }
  }
  if (!payload.ok) {
    const code = payload.error_code
    if (
      code === 'MISSING_GRANT' ||
      code === 'INVALID_GRANT' ||
      code === 'GRANT_UNAVAILABLE' ||
      code === 'GRANT_REPLAYED' ||
      code === 'GRANT_REVOKED' ||
      code === 'GRANT_EXPIRED' ||
      code === 'WRONG_APPLICATION' ||
      code === 'WRONG_CALLBACK' ||
      code === 'WRONG_ENVIRONMENT'
    ) {
      return { ok: false, error_code: code }
    }
    return { ok: false, error_code: 'GRANT_UNAVAILABLE' }
  }
  const secret = typeof payload.webhook_signing_secret === 'string' ? payload.webhook_signing_secret.trim() : ''
  if (!secret) return { ok: false, error_code: 'SECRET_UNAVAILABLE' }
  return {
    ok: true,
    webhook_signing_secret: secret,
    secret_version: typeof payload.secret_version === 'number' ? payload.secret_version : null,
    consumed_at: typeof payload.consumed_at === 'string' ? payload.consumed_at : null,
  }
}

export async function consumeInboundConnectionGrant(input: {
  rawBody: Buffer
  headerToken?: string | string[]
  expectedApplicationRef?: string | null
  nowMs?: number
  nodeEnv?: string | null
}): Promise<ConnectionGrantConsumeResult> {
  const expectedApplicationRef = input.expectedApplicationRef ?? getMarcoPayApplicationRef()
  if (!expectedApplicationRef) return publicResult('GRANT_WRITE_FAILED')
  const payload = parseConnectionGrantPayload(input.rawBody, input.headerToken)
  if (!payload) return publicResult('INVALID_GRANT')
  const evaluated = evaluateInboundConnectionGrant({
    payload,
    expectedApplicationRef,
    nowMs: input.nowMs,
    nodeEnv: input.nodeEnv,
  })
  if (!evaluated.ok) return publicResult(evaluated.error_code)
  const exchanged = await exchangeConnectionGrant(evaluated.token, evaluated.presented)
  if (!exchanged.ok) return publicResult(exchanged.error_code)
  try {
    await persistBoundWebhookSecret({
      schema: 'melega.marco-pay-connection-binding.v1',
      applicationRef: expectedApplicationRef,
      webhookUrl: MELEGA_DEX_CANONICAL_CALLBACK,
      secretVersion: exchanged.secret_version,
      consumedAt: exchanged.consumed_at,
      boundAt: new Date().toISOString(),
      webhookSigningSecret: exchanged.webhook_signing_secret,
    })
  } catch {
    return publicResult('GRANT_WRITE_FAILED')
  }
  return publicResult()
}

export function clearConnectionGrantForTests() {
  memoryBinding = null
  try {
    if (fs.existsSync(bindingPath())) fs.unlinkSync(bindingPath())
  } catch {
    /* ignore */
  }
}
