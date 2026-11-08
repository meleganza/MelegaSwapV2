import { createHmac } from 'crypto'

export const DEX_MCREDITS_PROTOCOL_VERSION = 'passport-mcredits.v1' as const
export const DEX_MCREDITS_CONSUMER = 'MELEGA_DEX' as const

export type McreditsGate =
  | 'PASSPORT_MCREDITS_NOT_CONFIGURED'
  | 'PASSPORT_MCREDITS_DISABLED'
  | 'PASSPORT_ORDER_AUTHORIZATION_REQUIRED'
  | 'PASSPORT_MCREDITS_UNREACHABLE'
  | 'PASSPORT_MCREDITS_REFUSED'

export type McreditsResult =
  | { ok: true; paymentId: string; status: 'RESERVED' | 'CONFIRMED' | 'RELEASED' }
  | { ok: false; gate: McreditsGate }

export type McreditsRuntime = {
  env?: Record<string, string | undefined>
  fetch?: (input: string, init?: RequestInit) => Promise<Response>
  now?: () => number
}

type Config = { endpoint: string; applicationRef: string | null; apiKey: string | null; enabled: boolean }

function config(env: Record<string, string | undefined> = process.env): Config {
  return {
    endpoint: (env.MARCO_CREDITS_ENDPOINT ?? 'https://marco.melega.ai').replace(/\/+$/, ''),
    applicationRef: env.MARCO_CONNECT_APPLICATION_REF ?? null,
    apiKey: env.MARCO_PAY_API_KEY ?? null,
    enabled: env.MARCO_CREDITS_ENABLED === 'true',
  }
}

export function mcreditsCapability(runtime: McreditsRuntime = {}):
  | { enabled: true; gate: null }
  | { enabled: false; gate: 'PASSPORT_MCREDITS_NOT_CONFIGURED' | 'PASSPORT_MCREDITS_DISABLED' } {
  const cfg = config(runtime.env)
  if (!cfg.applicationRef || !cfg.apiKey) return { enabled: false, gate: 'PASSPORT_MCREDITS_NOT_CONFIGURED' }
  if (!cfg.enabled) return { enabled: false, gate: 'PASSPORT_MCREDITS_DISABLED' }
  return { enabled: true, gate: null }
}

function signedHeaders(cfg: Config, body: string, now: () => number): Record<string, string> {
  const timestamp = String(Math.floor(now() / 1000))
  return {
    'content-type': 'application/json',
    accept: 'application/json',
    authorization: `Bearer ${cfg.apiKey}`,
    'marco-application': cfg.applicationRef ?? '',
    'marco-timestamp': timestamp,
    'marco-signature': createHmac('sha256', cfg.apiKey ?? '').update(`v1.${timestamp}.${body}`).digest('hex'),
  }
}

async function call(path: string, data: Record<string, unknown>, runtime: McreditsRuntime) {
  const cfg = config(runtime.env)
  try {
    const body = JSON.stringify(data)
    const response = await (runtime.fetch ?? fetch)(`${cfg.endpoint}${path}`, {
      method: 'POST',
      headers: signedHeaders(cfg, body, runtime.now ?? Date.now),
      body,
      signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(20_000)
        : undefined,
    })
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null
    return { response, payload }
  } catch {
    return null
  }
}

function unavailable(runtime: McreditsRuntime): McreditsResult | null {
  const capability = mcreditsCapability(runtime)
  return capability.enabled ? null : { ok: false, gate: capability.gate }
}

function payment(payload: Record<string, unknown> | null): Record<string, unknown> | null {
  const value = payload?.payment
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

export async function reservePassportMcredits(input: {
  customerAuthorization: string | null
  orderRef: string
  amountMinor: string
  item: string
}, runtime: McreditsRuntime = {}): Promise<McreditsResult> {
  const blocked = unavailable(runtime)
  if (blocked) return blocked
  if (!input.customerAuthorization?.trim()) return { ok: false, gate: 'PASSPORT_ORDER_AUTHORIZATION_REQUIRED' }
  if (!input.orderRef.trim() || !/^[1-9]\d*$/.test(input.amountMinor)) return { ok: false, gate: 'PASSPORT_MCREDITS_REFUSED' }
  const cfg = config(runtime.env)
  const result = await call('/api/public/mcredits/order/reserve', {
    protocol_version: DEX_MCREDITS_PROTOCOL_VERSION,
    consumer: DEX_MCREDITS_CONSUMER,
    application_ref: cfg.applicationRef,
    merchant_order_ref: input.orderRef,
    amount_minor: input.amountMinor,
    customer_authorization: input.customerAuthorization,
    payment_rail: 'M_CREDITS',
    item: input.item,
  }, runtime)
  if (!result) return { ok: false, gate: 'PASSPORT_MCREDITS_UNREACHABLE' }
  const row = payment(result.payload)
  const paymentId = typeof row?.payment_id === 'string' ? row.payment_id : null
  if (!result.response.ok || result.payload?.ok === false || !paymentId) {
    return { ok: false, gate: result.response.status >= 500 ? 'PASSPORT_MCREDITS_UNREACHABLE' : 'PASSPORT_MCREDITS_REFUSED' }
  }
  return { ok: true, paymentId, status: 'RESERVED' }
}

async function settle(paymentId: string, action: 'confirm' | 'release', runtime: McreditsRuntime, reason?: string): Promise<McreditsResult> {
  const blocked = unavailable(runtime)
  if (blocked) return blocked
  if (!paymentId.trim()) return { ok: false, gate: 'PASSPORT_MCREDITS_REFUSED' }
  const result = await call(`/api/public/mcredits/order/${action}`, {
    protocol_version: DEX_MCREDITS_PROTOCOL_VERSION,
    consumer: DEX_MCREDITS_CONSUMER,
    payment_id: paymentId,
    ...(action === 'release' ? { reason: reason ?? 'DEX_ORDER_FAILED' } : {}),
  }, runtime)
  if (!result) return { ok: false, gate: 'PASSPORT_MCREDITS_UNREACHABLE' }
  const row = payment(result.payload)
  if (!result.response.ok || result.payload?.ok === false || !row) {
    return { ok: false, gate: result.response.status >= 500 ? 'PASSPORT_MCREDITS_UNREACHABLE' : 'PASSPORT_MCREDITS_REFUSED' }
  }
  return {
    ok: true,
    paymentId: typeof row.payment_id === 'string' ? row.payment_id : paymentId,
    status: action === 'confirm' ? 'CONFIRMED' : 'RELEASED',
  }
}

export const confirmPassportMcredits = (paymentId: string, runtime: McreditsRuntime = {}) => settle(paymentId, 'confirm', runtime)
export const releasePassportMcredits = (paymentId: string, reason?: string, runtime: McreditsRuntime = {}) => settle(paymentId, 'release', runtime, reason)
